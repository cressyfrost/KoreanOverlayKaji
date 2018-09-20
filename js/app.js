var languagepack = 
{
};
var lastEncounter = null;
var lastEncounterRecord = [];
var prevEncounterActive = false;
var onPlayRecord =false;
var onRecord = false;
var sortkey = "encdps";
var sorttype = "asc";
var lastCombat = null;
var websocket = null;

var numDecimalChar = null;
var numGroupingChar = null;
var numDecimalRegex = null;
var numGroupingRegex = null;
var myname = ["Cress Albain"];
var selectTab = Object.keys(sortObject)[0];
var defaultSort = Object.keys(sortObject[selectTab])[0];
var normalSortKey = defaultSort;
var normalSortType = "asc";
var personalSortKey = defaultSort;
var personalSortType = "asc";
var defaultNameString = "[ Please enter your name. ]";
var defaultNewName = "Derek Derplander";
var parseDisplayPaused = false;
var latestEncounter = null;


/* --- Initialize functions --- */

$(document).ready(function() 
{
  init();
  document.addEventListener('onOverlayDataUpdate', onOverlayDataUpdate);
  window.addEventListener('message', onMessage);
});

function onMessage(e) 
{
  if (e.data.type === 'onOverlayDataUpdate') 
    onOverlayDataUpdate(e.data);
}

function onOverlayDataUpdate(e)
{
  encounterAct(e, false);
  $(".loading").fadeOut();
}

// ACTWebSocket 적용
function connectWebSocket(uri)
{
  if(uri.indexOf("@HOST_PORT@") > -1) return;
  websocket = new WebSocket(uri);

  websocket.onmessage = function(evt) 
  {
    if (evt.data == ".") 
      websocket.send(".");
    else 
      document.dispatchEvent(new CustomEvent('onOverlayDataUpdate', { detail: JSON.parse(evt.data) }));
  };

  websocket.onclose = function(evt) 
  { 
    setTimeout(function(){connectWebSocket(uri)}, 5000);
  };

  websocket.onerror = function(evt) 
  {
    websocket.close();
  };
}    
connectWebSocket(wsUri);


function init()
{
  var version = "Kaji Edit";
  var temp = "";
  var tabs = "";

  for(var i in sortObject)
  {
    tabs += "<div class=\"tab";
    if(i == selectTab)
    tabs += " seltab";
    tabs += "\" onclick=\"resort(this);\">"+i+"</div>";
  }
  for(var i in sortObject[selectTab])
  {
    if(sortObject[selectTab][i].display)
      temp += "<div data-sort=\"none\" data=\""+i+"\" "+(sortObject[selectTab][i].width===undefined?"":"style=\"width:"+sortObject[selectTab][i].width+"px;\"")+">"+sortObject[selectTab][i].label+"</div>";
  }

  var html = "<div class=\"tooltip\"></div>"+
  "<header>"+
  "<div class=\"tabs\">"+
  tabs+
  "</div>"+
  "<div class=\"sighticon xdisabled\" onmouseover=\"$('.tooltip').show(); $('.tooltip').css({'left':'0px', 'right':'auto', 'top':'55px'}); $('.tooltip').html('<div>Eye of Judgment</div><div>Shows job icon of highest DPS other than self.</div>');\" onmouseleave=\"$('.tooltip').hide();\" style=\"background-image:url(icon/Dragon_Sight.png);\" id=\"dragonsighticon\"></div>"+
  "<div class=\"icon\" onmouseover=\"$('.tooltip').show(); $('.tooltip').css({'left':'0px', 'right':'auto', 'top':'45px'}); $('.tooltip').html('<div>History</div><div>Shows the last 20 parses.</div>');\" onmouseleave=\"$('.tooltip').hide();\" style=\"background:url(img/calendar-text.png) no-repeat center center; background-size:90% auto; float:left;\" id=\"battlelogbutton\" onclick=\"if($('.title').html().toString().indexOf('집계 중') == -1){showBattleLog();}\"></div>"+
  "<div class=\"pause\"></div>"+
  "<div class=\"duration\">00:00</div>"+
  "<div class=\"title\">---</div>"+
  "<div class=\"datacov\"><div class=\"rdps\">0 rDPS</div>"+
  "<div class=\"rhps\">0 rHPS</div>"+
  "<div class=\"rdamage\">0 rDmg</div>"+
  "<div class=\"rhealed\">0 rHeal</div></div>"+
  "<div class=\"icons\">"+
  "<div class=\"icon xdisabled\" onmouseover=\"$('.tooltip').show(); $('.tooltip').css({'right':'0px', 'left':'auto', 'top':'25px'}); $('.tooltip').html('<div>Personal Mode</div><div>Displays only your own statistics.</div>');\" onmouseleave=\"$('.tooltip').hide();\" style=\"background:url(img/personal-mode.png) no-repeat center center; background-size:90% auto;\" data-checked=\"false\" id=\"othershide\" onclick=\"hideOthers();\"></div>"+
  "<div class=\"icon xdisabled\" onmouseover=\"$('.tooltip').show(); $('.tooltip').css({'right':'0px', 'left':'auto', 'top':'25px'}); $('.tooltip').html('<div>Blur Names</div><div>Blurs out other PC names.</div>');\" onmouseleave=\"$('.tooltip').hide();\" style=\"background:url(img/dns.png) no-repeat center center; background-size:90% auto;\" data-checked=\"false\" id=\"nicknamehide\"></div>"+
  "<div class=\"icon\" onmouseover=\"$('.tooltip').show(); $('.tooltip').css({'right':'0px', 'left':'auto', 'top':'25px'}); $('.tooltip').html('<div>Merge Pets</div><div>Merges pet and companion data with PCs.</div>');\" onmouseleave=\"$('.tooltip').hide();\" style=\"background:url(img/account-multiple-plus.png) no-repeat center center; background-size:90% auto;\" data-checked=\"false\" id=\"mergeAvatar\"></div>"+
  "<div class=\"icon\" onmouseover=\"$('.tooltip').show(); $('.tooltip').css({'left':'auto', 'right':'0px', 'top':'25px'}); $('.tooltip').html('<div>Refresh</div><div>Clears and refreshes the parse display.</div>');\" onmouseleave=\"$('.tooltip').hide();\" style=\"background:url(img/refresh.png) no-repeat center center; background-size:100% auto;\" onclick=\"refreshParse();\"></div>";

  if (!getConfigName().includes("Window")) html +=
  "<div class=\"icon xdisabled\" onmouseover=\"$('.tooltip').show(); $('.tooltip').css({'right':'0px', 'left':'auto', 'top':'25px'}); $('.tooltip').html('<div>Open Window</div><div>Opens window for stream capture.</div>');\" onmouseleave=\"$('.tooltip').hide();\" style=\"background:url(img/window.png) no-repeat center center; background-size:90% auto;\" id=\"openwindowbutton\" onclick=\"openStreamWindow();\"></div></div>";


  // Rudimentary locale
  var testNum = 0.1;
  numDecimalChar = testNum.toLocaleString().replace(/\d/g, '');
  testNum = 1000;
  numGroupingChar = testNum.toLocaleString().replace(/\d/g, '');

  numDecimalRegex = new RegExp(escapeRegexChar(numDecimalChar), "g");
  numGroupingRegex = new RegExp(escapeRegexChar(numGroupingChar), "g");

  Number.prototype.toFixedLocalized = function(numPlaces){ return this.toFixed(numPlaces).replace(/\./g, numDecimalChar).replace("Infinity","∞"); };

  html +=
  "</header>"+
  "<div class=\"datasort\">"+
  temp+
  "</div>"+
  "<div class=\"content\">"+
  "<div class=\"item\" data-job=\"WAR\">"+
  "<div class=\"icon\"></div>"+
  "<div class=\"leftdeco\"></div>"+
  "<div class=\"datas\">"+
  "</div>"+
  "</div>"+
  "</div>"+
  "<div class=\"battlelog\" style=\"display:none;\"></div>"+
  "<div class=\"nameentry\" style=\"display:none;\"><div>Your Current Name</div><input type=text name=currname readonly /><div>▼</div><div>New Name</div><input type=text name=newname readonly /><div>(click to edit)</div><input type=button name=savebutton value='Change Name' /><input type=button name=closebutton value='Cancel' /></div>"+
  "<div class=\"versions\" style=\"display:none;\">"+version+"</div>";

  $("body").append(html);
  if (document.addEventListener) 
  {
    window.onbeforeunload = function() 
    {
      document.removeEventListener('onOverlayDataUpdate', onOverlayDataUpdate);
      window.removeEventListener('message', onMessage);
      saveConfig();
    };

    window.addEventListener("unload", function() 
    {
      document.removeEventListener('onOverlayDataUpdate', onOverlayDataUpdate);
      window.removeEventListener('message', onMessage);
      saveConfig();
    }, false);
  }

  $(".datasort div[data=\""+defaultSort+"\"]").attr("data-sort","asc");

  $(".content *").remove();

  $("header .icon[data-checked]").click(function(){
    if($(this).attr("data-checked")=="true")
      $(this).attr("data-checked", "false");
    else
      $(this).attr("data-checked", "true");
    
    encounterAct(lastEncounter, false);
  });

  $(".datasort div").click(function(){
    sorttype="asc";
    if($(this).attr("data-sort") == "asc")
    {
      $(".datasort div").attr("data-sort","none");
      $(this).attr("data-sort","desc");
      sorttype="desc";
    }
    else if($(this).attr("data-sort") == "desc")
    {
      $(".datasort div").attr("data-sort","none");
      $(this).attr("data-sort","asc");
    }
    else
    {
      $(".datasort div").attr("data-sort","none");
      $(this).attr("data-sort","asc");
    }
    sortkey = $(this).attr("data");
    encounterAct(lastEncounter, false);
  });

  $(".content").on("dblclick", ".item", doubleClickName);
  $("input[name=savebutton]").click(saveButton);
  $("input[name=closebutton]").click(closeButton);
  $("input[name=newname]").click(nameInput);

  $(window).resize( $.throttle(150, resizeEvents) );
  $(".content").scroll( $.throttle(150, function(){Sticky.showHide();}) );

  loadConfig();

  if (isMyNameEmpty() && !getConfigName().includes("Window"))
  {
    $("input[name=newname]").val(defaultNewName);
    showNameEntry();
  }

  scaleOverlay(uiScale);



  if (shrinkForPersonalJustify == "center") $("body").css("margin", "0px auto 0px auto");
  else if (shrinkForPersonalJustify == "right") $("body").css("margin", "0px 0px 0px auto");

}


/* --- Core data functions --- */


function encounterAct(e, n)
{
  if(e==null) return;

  var encounterActive = (e.detail.isActive == "true");
  var encounterValid = (e.detail.Encounter.encdps != "NaN" && e.detail.Encounter.encdps != "---" && parseFloatLocalized(e.detail.Encounter.encdps) > 0);

  if (encounterActive && parseDisplayPaused)
  {
    latestEncounter = e;
    prevEncounterActive = true;
    return;
  }

  var _a = e.detail.Encounter.title;
  var _b = parseFloatLocalized(e.detail.Encounter.encdps).toFixedLocalized(0);
  var _c = e.detail.Encounter.duration.replace(":","_");
  var combatant = [];
  var reg = /(.*?)\s\((.*?)\)/im;
  var idx=0;
  const avatars = 
  {
    "Rook Autoturret":"MCH",
    "Bishop Autoturret":"MCH",
    "Eos":"SCH",
    "Selene":"SCH",
    "Emerald Carbuncle":"SMN",
    "Topaz Carbuncle":"SMN",
    "Ruby Carbuncle":"SMN",
    "Garuda-Egi":"SMN",
    "Titan-Egi":"SMN",
    "Ifrit-Egi":"SMN",
    "Demi-Bahamut":"SMN"
  }

  $("header .title").html(e.detail.Encounter.title=="Encounter"?"Parsing":e.detail.Encounter.title);
  $("header .duration").html(e.detail.Encounter.duration);
  $("header .rdps").html(parseFloatLocalized(e.detail.Encounter.encdps).toFixedLocalized(0)+" rDPS");
  $("header .rhps").html(parseFloatLocalized(e.detail.Encounter.enchps).toFixedLocalized(0)+ " rHPS");
  $("header .rdamage").html(parseIntLocalized(e.detail.Encounter.damage).toLocaleString()+" rDmg");
  $("header .rhealed").html(parseIntLocalized(e.detail.Encounter.healed).toLocaleString()+ " rHeal");

  for(var user in e.detail.Combatant)
  {
    var c = e.detail.Combatant[user];    
    combatant.push(
    {  
      "dps":c.encdps, 
      "name":c.name,
      "rank":0,
      "combat": getCombatantDetail(c, e.detail.Encounter, c.name),
      "combatant":c,
      "avatar":false,
    });
  }

  var highestEncdpsNotSelf = 0;
  var highestEncdpsNotSelfJob = "";
  var myJob = "";

  for(var user in combatant)
  {
    var deleteFlag = false;
    var matches = combatant[user].name.match(reg);

    if(combatant[user].name == "Limit Break")
      combatant[user].combatant.Job = "LMB";

    if (matches)   // name has paren clause, e.g. "Petname (Player Name)"; 1 = Petname, 2 = Player Name
    {

      if (matches[1] in avatars)
      {
        combatant[user].combatant.Job = avatars[matches[1]];
        combatant[user].avatar = true;
      }

      var finduser = -1;
      for(var i in combatant)
      {
        if(combatant[i].name == matches[2] || (combatant[i].name == "YOU" && hasMyName(matches[2])))
        {
          if (combatant[user].combatant.Job == "") combatant[user].combatant.Job = "CBO";
          finduser = i;
        }
      }

      if($("#mergeAvatar").attr("data-checked") == "true" && finduser>-1)
      {

        if (combatant[user].combatant.Job == "CBO")
        {
          if (combatant[finduser]["companion"] == undefined) combatant[finduser].companion = combatant[user].combat;
          else mergeCombatantDetail(combatant[finduser].companion, combatant[user].combat, e, true);
        }
        else
        {
          if (combatant[finduser]["pet"] == undefined) combatant[finduser].pet = combatant[user].combat;
          else mergeCombatantDetail(combatant[finduser].pet, combatant[user].combat, e, true);
        } 
        
        if (combatant[finduser]["own"] == undefined) combatant[finduser].own = $.extend({}, combatant[finduser].combat);
        combatant[finduser].combat = mergeCombatantDetail(combatant[finduser].combat, combatant[user].combat, e);
        deleteFlag = true;

      }

    }
    else
    {
      if (combatant[user].combatant.Job == "" && combatant[user].combatant.encdps == 0 && (filterCombatantList || combatant[user].combatant.damagetaken == 0))
        deleteFlag = true;
    }

    if (showHighestNonSelfPersonalDPSIcon)
    {
      var ownEncdps = (combatant[user]["own"] == undefined) ? parseIntLocalized(combatant[user].combat.encdps) : parseIntLocalized(combatant[user].own.encdps);
      if ( (combatant[user].name != "YOU" && !isMyName(combatant[user].name)) && !combatant[user].avatar && (ownEncdps > highestEncdpsNotSelf) )
      {
        highestEncdpsNotSelf = ownEncdps;
        highestEncdpsNotSelfJob = combatant[user].combat.Job.toUpperCase();
      }
      if (combatant[user].name == "YOU" || isMyName(combatant[user].name))
      {
        myJob = combatant[user].combat.Job.toUpperCase();
      }
    }

    if (deleteFlag) delete combatant[user];
  }

  lastEncounter = e;
  lastCombat = combatant;

  var sortkeyD = getAlternateSortkey(sortkey);

  if(sortkeyD=="maxhit" || sortkeyD=="maxheal")
  {
    if(sorttype == "desc")
    {
      combatant.sort(function(b, a){return parseFloatLocalized(b.combat[sortkeyD].split("-")[1].replace(numGroupingRegex,"")) - parseFloatLocalized(a.combat[sortkeyD].split("-")[1].replace(numGroupingRegex,""))});
    }
    else
    {
      combatant.sort(function(a, b){return parseFloatLocalized(b.combat[sortkeyD].split("-")[1].replace(numGroupingRegex,"")) - parseFloatLocalized(a.combat[sortkeyD].split("-")[1].replace(numGroupingRegex,""))});
    }
  }
  else
  {
    if(sorttype == "desc")
    {
      combatant.sort(function(b, a){return parseFloatLocalized(b.combat[sortkeyD]) - parseFloatLocalized(a.combat[sortkeyD])});
    }
    else
    {
      combatant.sort(function(a, b){return parseFloatLocalized(b.combat[sortkeyD]) - parseFloatLocalized(a.combat[sortkeyD])});
    }
  }

  if( $(".battlelog").find("div[data=\""+_a+"|"+_b+"|"+_c+"\"]").length == 0 && (e.detail.Encounter.title != "Encounter" || (!encounterActive && prevEncounterActive && encounterValid)) )
  {
    $(".battlelog").prepend("<div select='no' data='"+_a+"|"+_b+"|"+_c+"' idx='"+(lastEncounterRecord.length+1)+"'>"+e.detail.Encounter.title+" ("+parseIntLocalized(e.detail.Encounter.encdps)+" rDPS)</div>");
    lastEncounterRecord.push(e);

    $(".battlelog div[data=\""+_a+"|"+_b+"|"+_c+"\"]").click(function(){
      parseDisplayPaused = true;
      $("header .pause").html("❙❙");
      if( $(".battlelog").find("div[data=\"current\"]").length == 0 )
      {
        $(".battlelog").prepend("<div select='no' data='current' idx='0'>► Resume Realtime Display</div>");
        $(".battlelog div[data=\"current\"]").click(function(){
          parseDisplayPaused = false;
          $("header .pause").html("");
          $(".battlelog div[data=\"current\"]").remove();
          $(".battlelog div").each(function(){$(this).attr("select", "no")});
          showBattleLog();
          if (latestEncounter != null) encounterAct(latestEncounter, false);
          else encounterAct(lastEncounterRecord[lastEncounterRecord.length-1], false);
        });
      }
  
      $(".battlelog div").each(function(){$(this).attr("select", "no")});
      $(this).attr("select","yes");
      showBattleLog();
      encounterAct(e, false);
    });
  }
  $(".battlelog div").each(function(){$(this).attr("select", "no")});
  $(".battlelog div[data=\""+_a+"|"+_b+"|"+_c+"\"]").attr("select","yes");

  if($(".battlelog div").length > 20)
  {
    $(".battlelog div")[20].remove();
  }

  if (showHighestNonSelfPersonalDPSIcon)
  {
    var toIcon = $("#dragonsighticon");
    if (highestEncdpsNotSelf > 0 && (myJob in showHighestDPSData || "default" in showHighestDPSData))
    {
      var $element = $("<div class=item data-job=\"" + highestEncdpsNotSelfJob + "\"><div class=icon /></div>").hide().appendTo("body");
      $(toIcon).css( "background-image", $element.find(".icon").css("background-image") );
      $(toIcon).css( "background-color", $element.find(".icon").css("background-color") );
      $element.remove();
      //$(toIcon).show();
    }
    else
    {
      if (myJob in showHighestDPSData)
      {
        $(toIcon).css( "background-image", "url(icon/" + showHighestDPSData[myJob] + ".png)" );
        //$(toIcon).show();
      }
      else if ("default" in showHighestDPSData)
      {
        $(toIcon).css( "background-image", "url(icon/" + showHighestDPSData["default"] + ".png)" );
        //$(toIcon).show();
      }
      else
      {
        $(toIcon).hide();
      }
    }
  }

  var topVal = getTopVal(combatant, sortkey);
    
  for(var user in combatant)
  {
    if($("#othershide").attr("data-checked") == "false" || combatant[user].name == "YOU" || hasMyName(combatant[user].name))
    {
      combatant[user].rank = idx++;
      addItem(combatant[user], topVal);
    }
    else delete combatant[user];
  }

  $(".content .item").each(function()
  {
    var remove = true;
    for(var i in combatant)
    {
      if($(this).attr("data-id") == combatant[i].name) remove = false;
    }
  
    if(remove)
      $(this).remove();
  });

  if (showStickyEntry && $("#othershide").attr("data-checked") == "false") Sticky.initClone();

  resizeEvents();

  prevEncounterActive = encounterActive;

}

function getCombatantDetail(c,e,playername)
{
  return {
      "Job":c.Job,
      "playername":playername,
      "swings":parseIntLocalized(c.swings),
      "dps":parseFloatLocalized(c.dps).toFixedLocalized(0),
      "encdps":parseIntLocalized(c.encdps).toLocaleString(),
      "damage":parseIntLocalized(c.damage).toLocaleString(),
      "damage%":calcPercentage(parseIntLocalized(c.damage), parseIntLocalized(e.damage)).toFixedLocalized(1),
      "DirectHitCount":parseIntLocalized(c.DirectHitCount),
      "DirectHitPct":calcPercentage(parseIntLocalized(c.DirectHitCount), parseIntLocalized(c.swings)).toFixedLocalized(1),
      "CritDirectHitPct":calcPercentage(parseIntLocalized(c.CritDirectHitCount), parseIntLocalized(c.swings)).toFixedLocalized(1),
      "heals":parseIntLocalized(c.heals),
      "enchps":parseFloatLocalized(c.enchps).toFixedLocalized(0),
      "healed":parseIntLocalized(c.healed).toLocaleString(),
      "healed%":calcPercentage(parseIntLocalized(c.healed), parseIntLocalized(e.healed)).toFixedLocalized(1),
      "misses":parseIntLocalized(c.misses),
      "crithits":parseIntLocalized(c.crithits),
      "critheals":parseIntLocalized(c.critheals),
      "crithit%":calcPercentage(parseIntLocalized(c.crithits), parseIntLocalized(c.swings)).toFixedLocalized(1),
      "critheal%":calcPercentage(parseIntLocalized(c.critheals), parseIntLocalized(c.heals)).toFixedLocalized(1),
      "damagetaken":parseIntLocalized(c.damagetaken).toLocaleString(),
      "healstaken":parseIntLocalized(c.healstaken).toLocaleString(),
      "OverHealPct":parseIntLocalized(c.OverHealPct),
      "kills":parseIntLocalized(c.kills),
      "deaths":parseIntLocalized(c.deaths),
      "maxhit":getMaxhit(c),
      "maxhitNoText":getMaxhitNoText(c),
      "maxheal":c.maxheal,
      "duration":c.duration,
      "durationSecs":c.DURATION,
      "ParryPct":removePerc(c.ParryPct),
      "BlockPct":removePerc(c.BlockPct),
      "encdtps":(calcPercentage(parseIntLocalized(c.damagetaken), e.DURATION) / 100).toFixedLocalized(0),
      "cures":parseIntLocalized(c.cures),
    };
}

function mergeCombatantDetail(original, target, e, mergeUnmergedStats)
{
  
  // Needs to be done first before updating others
  original.OverHealPct = Math.round( calcPercentage( (parseIntLocalized(original.healed) * original.OverHealPct / 100) + (parseIntLocalized(target.healed) * target.OverHealPct / 100), parseIntLocalized(original.healed) + parseIntLocalized(target.healed) ) );

  original.swings += target.swings;
  original.encdps = (parseFloatLocalized(original.encdps) + parseFloatLocalized(target.encdps)).toFixedLocalized(0);
  original.damage = (parseIntLocalized(original.damage) + parseIntLocalized(target.damage)).toLocaleString();
  original['damage%'] = calcPercentage(parseIntLocalized(original.damage), parseIntLocalized(e.detail.Encounter.damage)).toFixedLocalized(1);
  original.heals += target.heals;
  original.enchps = (parseFloatLocalized(original.enchps) + parseFloatLocalized(target.enchps)).toFixedLocalized(0);
  original.healed = (parseIntLocalized(original.healed) + parseIntLocalized(target.healed)).toLocaleString();
  original['healed%'] = calcPercentage(parseIntLocalized(original.healed), parseIntLocalized(e.detail.Encounter.healed)).toFixedLocalized(1);
  original.misses += target.misses;
  original.crithits += target.crithits;
  original.critheals += target.critheals;
  original['crithit%'] = calcPercentage(original.crithits, original.swings).toFixedLocalized(1);
  original['critheal%'] = calcPercentage(original.critheals, original.heals).toFixedLocalized(1);
  original.DirectHitCount += target.DirectHitCount;
  original.DirectHitPct = calcPercentage(original.DirectHitCount, original.swings).toFixedLocalized(1);
  original.kills += target.kills;
  original.cures += target.cures;
  original.maxhit = (parseIntLocalized(target.maxhit.split("-")[1]) > parseIntLocalized(original.maxhit.split("-")[1])) ? target.maxhit : original.maxhit;
  original.maxhitNoText = (parseIntLocalized(target.maxhitNoText) > parseIntLocalized(original.maxhitNoText)) ? target.maxhitNoText : original.maxhitNoText;

  // May be useful to not merge these stats from pets/companions into players unless explicitly asked to?
  if (mergeUnmergedStats != undefined && mergeUnmergedStats)
  {
    original.damagetaken = (parseIntLocalized(original.damagetaken) + parseIntLocalized(target.damagetaken)).toLocaleString();
    original.healstaken = (parseIntLocalized(original.healstaken) + parseIntLocalized(target.healstaken)).toLocaleString();
    original.encdtps = (parseFloatLocalized(original.encdtps) + parseFloatLocalized(target.encdtps)).toFixedLocalized(0);
    original.deaths = original.deaths + target.deaths;
  }

  // Not technically accurate but whatever
  original.dps = (parseFloatLocalized(original.dps) + parseFloatLocalized(target.dps)).toFixedLocalized(0);

  return original;
}

function getItem(id)
{
  if($(".content .item[data-id=\""+id+"\"]").length > 0)
    return $(".content .item[data-id=\""+id+"\"]");
  else
    return false;
}

function addItem(e, topVal)
{
  var item = getItem(e.name);
  if(!item)
  {
    $(".content").append("<div class=\"item "+e.combatant.Job.toUpperCase()+"\" data-job=\""+e.combatant.Job.toUpperCase()+"\" data-id=\""+e.name+"\" style=\"top:"+((e.rank+2)*27)+"px; opacity:0;\"><div class=\"icon\"></div><div class=\"leftdeco d\"></div><div class=\"leftdeco\"></div><div class=\"datas "+e.combatant.Job.toUpperCase()+"\"><div class=\"values\"><div class=\"vv\"></div></div><div class=\"bar ownbar\" /></div></div>");
    $(item).find(".ownbar").width("0px");
  }

  modifyItem(e, topVal);
}

function removeItem(id)
{
  var item = getItem(id);
  if (item)
  {
    $(item).find(".ownbar").width("0px");
    $(item).remove();
  }
}

function modifyItem(e, topVal)
{  
  var item = getItem(e.name);
  var hasOwn = (e["own"] != undefined);
  var hasPet = (e["pet"] != undefined);
  var hasCompanion = (e["companion"] != undefined);

  if(e.avatar)
  {
    $(item).find(".icon").css({"background-image":"url(./icon/AVA.png)", "background-size":"20px auto", "background-position":"0px 3px"});
    $(item).attr("avatar", "");
  }

  $(item).attr("data-job", e.combatant.Job.toUpperCase());
  $(item).find(".datas>.values>.vv>span").remove();

  var dispName = e.name;

  if($(item).find(".datas>.values>a").length == 0)
    $(item).find(".datas>.values").append("<a>"+dispName+"</a>");

  //$(item).find(".datas>.values>a").text(dispName);

  if($("#nicknamehide").attr("data-checked")=="true" && !( e.name == "YOU" || hasMyName(e.name) || e.name == "Limit Break" || !e.name.includes(" ") || (!e.name.includes("(") && (e.name.split(" ").length != 2)) || ((e.combatant.Job == "") && (!e.name.includes("(")) && (parseInt(e.combatant.encdps) > 0)) ))
    $(item).find(".datas>.values>a").css("-webkit-filter","blur(3px)");
  else
    $(item).find(".datas>.values>a").css("-webkit-filter","");

  if (isMyName(e.name) || e.name == "YOU")
    $(item).attr("data-you", true);
  else
    $(item).removeAttr("data-you");

  for(var i in sortObject[selectTab])
  {
    var text = i;
    var selectedStyle = "";
    if (sortkey == text)
      selectedStyle = ""; // e.g. "font-weight: bold; "

    if(sortObject[selectTab][i].display){
      if(i == "playername"){
        $(item).find(".datas>.values>.vv").append("<span style=\"float:left; overflow:hidden; margin-left:3px; text-align:center; font-family:'Segoe UI';"+selectedStyle+(sortObject[selectTab][i].width===undefined?" width:38px;":" width:"+sortObject[selectTab][i].width+"px;")+"\">" + e.name + "</div>");
      }
      else{
        $(item).find(".datas>.values>.vv").append("<span style=\"float:left; overflow:hidden; margin-left:3px; text-align:center; font-family:'Segoe UI';"+selectedStyle+(sortObject[selectTab][i].width===undefined?" width:38px;":" width:"+sortObject[selectTab][i].width+"px;")+"\">" + e.combat[i] + "</div>");
      }
    }
  }

  var sortkeyD = getAlternateSortkey(sortkey);
  var getFunction = getKeyGetterFn(sortkeyD);

  var offset = 10;   // match .content>.item>.datas>.petbar::after's left value, inverted
  offset += 1;     // gap

  var myVal = getFunction(e.combat[sortkeyD]);
  var ownVal = (showMergedPetBars && hasOwn) ? getFunction(e.own[sortkeyD]) : myVal;
  var petVal = hasPet ? getFunction(e.pet[sortkeyD]) : 0;
  var comVal = hasCompanion? getFunction(e.companion[sortkeyD]) : 0;

  var ownWidth = calcPercentage(ownVal, topVal);
  var petWidth = calcPercentage(petVal, topVal);
  var comWidth = calcPercentage(comVal, topVal);

  var petLeft = calcPercentage(ownVal, topVal);
  var comLeft = calcPercentage(ownVal+petVal, topVal);

  var isComplexMergedStat =
    (["crithit%", "critheal%", "DirectHitPct", "maxhit", "maxhitNoText", "OverHealPct"].findIndex(function(curr){return curr == sortkeyD;}) > -1);

  if (isComplexMergedStat)
  {
    petWidth = calcPercentage(petVal-ownVal, topVal);

    comWidth = calcPercentage(comVal-ownVal, topVal);
    comLeft = calcPercentage(ownVal, topVal);
  }

  var maxBarWidth = $(item).find(".datas").width();
  if ((petWidth * maxBarWidth / 100) < offset) petVal = 0;
  if ((comWidth * maxBarWidth / 100) < offset) comVal = 0;

  if(topVal == 0)
    ownWidth = 100;

  if (showMergedPetBars && petVal > 0)
  {
    if ($(item).find(".petbar").length == 0)
    {
      $(item).find(".datas").append("<div class=\"bar petbar\" />");
      $(item).find(".petbar").width("0px");
      $(item).find(".petbar").css("left", "0px");
    }
  }
  else
  {
    $(item).find(".petbar").remove();
  }

  if (showMergedPetBars && comVal > 0)
  {
    if ($(item).find(".combar").length == 0)
    {
      $(item).find(".datas").append("<div class=\"bar combar\" />");
      $(item).find(".combar").width("0px");
      $(item).find(".combar").css("left", "0px");
    }  
  }
  else
  {
    $(item).find(".combar").remove();
  }

  var barTop = (e.rank*24);
  if (e.name == "YOU" || isMyName(e.name)) Sticky.setMyBarTop(barTop);

  $(item).css({"top":barTop, "z-index":(90-e.rank), "opacity":1, "position":""});
  $(item).find(".ownbar").width(ownWidth + "%");
  if (showMergedPetBars && (hasPet || hasCompanion))
  {
    $(item).find(".petbar").width("calc(" + petWidth + "% - " + offset + "px)");
    $(item).find(".petbar").css("left", "calc(" + petLeft + "% + " + offset + "px)");
    $(item).find(".combar").width("calc(" + comWidth + "% - " + offset + "px)");
    $(item).find(".combar").css("left", "calc(" + comLeft + "% + " + offset + "px)");  
  }
}


/* --- Math and parse helper functions --- */


function getAlternateSortkey(key)
{
  const sortkeyMap = {
      "encdps":"damage",
      "enchps":"healed",
      "encdtps":"damagetaken",
      "duration":"durationSecs"
    };

  if (key in sortkeyMap) return sortkeyMap[key];
  else return key; 
}

function getKeyGetterFn(key)
{
  if(key=="maxhit"||key=="maxheal")
    return function(input) { return parseFloatLocalized(input.split("-")[1].replace(numGroupingRegex,"")); }
  else
    return parseFloatLocalized;
}

function getTopVal(combatList, key)
{
  var topVal = 0;
  var sortkeyD = getAlternateSortkey(key);
  var getFunction = getKeyGetterFn(sortkeyD);
  var isUnmergedStat =
    (["damagetaken", "healstaken", "encdtps", "deaths"].findIndex(function(curr){return curr == sortkeyD;}) > -1);

  for(var i in combatList)
  {
    var myVal = getFunction(combatList[i].combat[sortkeyD]);
    if (showMergedPetBars && combatList[i]["own"] != undefined)
    {
      var ownVal = getFunction(combatList[i].own[sortkeyD]);
      topVal = (ownVal > topVal) ? ownVal : topVal;
    }
    if (showMergedPetBars && combatList[i]["pet"] != undefined)
    {
      var petVal = getFunction(combatList[i].pet[sortkeyD]);
      if (isUnmergedStat) myVal += petVal;
      else topVal = (petVal > topVal) ? petVal : topVal;
    }
    if (showMergedPetBars && combatList[i]["companion"] != undefined)
    {
      var comVal = getFunction(combatList[i].companion[sortkeyD]);
      if (isUnmergedStat) myVal += comVal;
      else topVal = (comVal > topVal) ? comVal : topVal;
    }
    topVal = (myVal > topVal) ? myVal : topVal;
  }

  return topVal;
}

function isMyNameEmpty()
{
  return (myname.length == 1 && myname[0].length == 0);
}

function hasMyName(name)
{
  var names = name.replace(/[()]/g,"").split(" ");
  for (c in myname)
  {
    if (myname[c] == name) return true;
    for (d in names)
    {
      if (myname[c] == names[d]) return true;
    }
    
    // Special case for full name specified
    if (names.length > 1)
      if (myname[c] == (names[names.length-2] + " " + names[names.length-1])) return true;

  }

  return false;
}

function isMyName(name)
{
  if (name.includes("(")) return false;
  return hasMyName(name);
}

function convNameToInitials(name)
{
  var str = name;

  if (str != "YOU")
  {
    var splitedtext = str.split(" ");
    str = splitedtext[0].substring(0,1);
    if (splitedtext.length > 1)
    {
      var str2 = splitedtext[1].substring(0,1);
      if (str2 != "(") str = str + str2;
    }  
  }
  else str = "★";

  return str;
}

function calcPercentage(numer, denom)
{
  if (numer == 0 && denom == 0) return 0;
  if (denom == 0) return Math.sign(numer) * Infinity;
  return numer / denom * 100;
}

function getMaxhit(c)
{
  var str = c.maxhit.replace(/\s\(\*\)/ig, "");

  // Localize name (?)
  var splitedtext = str.split("-");
  if(languagepack[splitedtext[0]] != undefined)
    str = languagepack[splitedtext[0]];
  else
    str = splitedtext[0];

  if (str == undefined || str == "")
    str = "No Damage";

  // Shorten (English) names
  str = str.replace("Enchanted","E.");
  str = str.replace("The Forbidden","Forbidden");
  str = str.replace("Doom Of The Living","Doom of the Living");

  // Add damage number
  if (splitedtext.length > 1 && splitedtext[1] != "No Damage")
    str = str + "-" + splitedtext[1];
  else
    str = str + "-" + "0";

  return str;
}

function getMaxhitNoText(c)
{
  var str = c.MAXHIT;
  var pattern = new RegExp("[^0-9]");
  if (str == undefined || str.length == 0 || pattern.test(str[0])) str = "0";
  return str.replace(numGroupingRegex, "");
}

function removePerc(v)
{
  var str = v;
  if (str == undefined || str.length == 0) str = "0";
  return parseFloatLocalized(str.replace(/%/ig,""));
}

function parseIntLocalized(val)
{
  if (val == undefined) return NaN;
  var str = val.toString();
  if (str == "∞") return Infinity;
  if (str == "---") return 0;
  return parseInt(str.replace(numGroupingRegex, '').replace(numDecimalRegex,'.'));
}

function parseFloatLocalized(val)
{
  if (val == undefined) return NaN;
  var str = val.toString();
  if (str == "∞") return Infinity;
  if (str == "---") return 0;
  return parseFloat(str.replace(numGroupingRegex, '').replace(numDecimalRegex,'.'));
}

function escapeRegexChar(str)
{
  return str.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
}


/* --- Data visualization functions --- */


function resort(obj)
{
  resortDo($(obj).html());
}

function resortDo(inTab)
{
  var tabs = "";
  var temp = "";
  var first = false;
  var sort = "";

  selectTab = inTab;

  for(var i in sortObject)
  {
    tabs += "<div class=\"tab";
    if(i == selectTab)
    tabs += " seltab";
    tabs += "\" onclick=\"resort(this);\">"+i+"</div>";
  }

  for(var i in sortObject[selectTab])
  {
    if(!first)
    {
      sort = i;
      first = true;
    }

    if(sortObject[selectTab][i].display)
      temp += "<div data-sort=\"none\" data=\""+i+"\" "+(sortObject[selectTab][i].width===undefined?"":"style=\"width:"+sortObject[selectTab][i].width+"px;\"")+">"+sortObject[selectTab][i].label+"</div>";
  }

  $(".tabs").html(tabs);
  $(".datasort").html(temp);

  defaultSort = sortkey = sort;

  $(".datasort div[data=\""+defaultSort+"\"]").attr("data-sort",sorttype);
  encounterAct(lastEncounter, false);
  
  $(".datasort div").click(function(){
    sorttype="asc";
    if($(this).attr("data-sort") == "asc")
    {
      $(".datasort div").attr("data-sort","none");
      $(this).attr("data-sort","desc");
      sorttype="desc";
    }
    else if($(this).attr("data-sort") == "desc")
    {
      $(".datasort div").attr("data-sort","none");
      $(this).attr("data-sort","asc");
    }
    else
    {
      $(".datasort div").attr("data-sort","none");
      $(this).attr("data-sort","asc");
    }
    sortkey = $(this).attr("data");
    encounterAct(lastEncounter, false);
  });
}

function updateSort()
{
  $(".datasort div").attr("data-sort","none");
  $(".datasort div[data=\""+sortkey+"\"]").attr("data-sort",sorttype);
  encounterAct(lastEncounter, false);
}


/* --- UI functions --- */


function resizeEvents()
{
  $(".content>.item>.datas>.values>a").width( $(".content>.item>.datas").width() - $(".datasort").width() - 4 );
  Sticky.adjustWidth();
  Sticky.showHide();
}

var Sticky = (function() {

  const upDownSymbolWidth = 10;
  
  var $boundBox = [];
  var contentTop = 0;
  var myBarTop = 0;
  var stickyShown = false;

  var $clone = [];
  var $cloneI = [];
  var $cloneB = [];

  return {
      
    initClone : function() {
      $(".content>.item[clone]").remove();
      $clone = $(".content>.item[data-you=true]").clone().attr("clone","").appendTo(".content");
      $clone.css({"z-index":99, "position":"fixed"});
      $clone.append("<b></b>");
      $cloneI = $clone.find(".datas>.values>a");
      $cloneB = $clone.find("b");
      $cloneI.css("padding-left", upDownSymbolWidth + "px");
      $boundBox = $(".content");
      contentTop = parseInt($boundBox.css("top"));
      this.adjustWidth();
      this.hide();
    },
    
    setMyBarTop : function(input) {
      myBarTop = input; 
    },
    
    adjustWidth : function() {
      var oldWidth = $(".content>.item>.datas").width() - $(".datasort").width() - 4;
      var newWidth = oldWidth - upDownSymbolWidth;
      $cloneI.width(newWidth);
    },
    
    show : function() {
      stickyShown = true;
      $clone.show();
    },
    
    hide : function() {
      stickyShown = false;
      $clone.hide();
    },
       
    showHide : function() {

      if (!showStickyEntry)
      {
        this.hide();
        return;
      }

      var scrollTop = $boundBox.scrollTop();

      if ( (scrollTop + $boundBox.height()) < myBarTop + 20)
      {
        $clone.css("top", "");
        $clone.css("bottom", "29px");
        $cloneB.text("▼");
        this.show();
      }
      else if ( scrollTop > (myBarTop + 8) )
      {
        $clone.css( "top", (contentTop + 4) + "px" );
        $clone.css("bottom", "");
        $cloneB.text("▲");
        this.show();
      }
      else { this.hide(); }
    }
    
  };

}());



function scaleOverlay(scaleFactor)
{
  var val = parseFloatLocalized(scaleFactor);
  if (val != 1 && val != 0)
    $("html").css({
      "transform": "scale(" + val + ")",
      "width": 100/val + "%",
      });
  else
    $("html").css({
      "transform": "",
      "width": "",
      });
}

function showBattleLog()
{
  if($(".battlelog").css("display") == "none")
  {
    $(".content").hide();
    $(".battlelog").show();
  }
  else
  {
    $(".content").show();
    $(".battlelog").hide();
  }
}

function hideOthers()
{
  if($("#othershide").attr("data-checked") == "false")
  {
    normalSortKey = sortkey;
    normalSortType = sorttype;
    if (sortObject[selectTab][personalSortKey] != undefined && sortObject[selectTab][personalSortKey].display) sortkey = personalSortKey;
    sorttype = personalSortType;
    if (shrinkForPersonal)
    {
      $(".tab").hide();
      $(".rdamage").hide();
      $("body").width( $(".datasort").width() + 44);
    }
  }
  else
  {
    personalSortKey = sortkey;
    personalSortType = sorttype;
    if (sortObject[selectTab][normalSortKey] != undefined && sortObject[selectTab][normalSortKey].display) sortkey = normalSortKey;
    sorttype = normalSortType;
    if (shrinkForPersonal)
    {
      $(".tab").show();
      $(".rdamage").show();
      $("body").css("width","");
    }
  }

  updateSort();
}

function openStreamWindow()
{
  window.open('./indexWindow.html','','height='+(window.outerHeight+34)+',width='+(window.outerWidth+14));
}

function refreshParse()
{
  location.href=location.href;
}

function doubleClickName()
{
  var str = $(this).attr("data-id");

  if (str.includes("(")) str = str.split("(")[1].replace(")","");
  if (str != "YOU" && str != "Limit Break") $("input[name=newname]").val(str);
  else if (isMyNameEmpty()) $("input[name=newname]").val(defaultNewName);
  else $("input[name=newname]").val(myname);

  showNameEntry();
}

function showNameEntry()
{
  if (isMyNameEmpty()) $("input[name=currname]").val(defaultNameString);
  else $("input[name=currname]").val(myname);
  $(".nameentry").show();
}

function saveButton()
{
  var input = $("input[name=newname]").val().toString();
  if (input == defaultNameString) input = "";
  input = input.replace(/[^\w'\-, ]/ig,"");
  var strs = input.split(",");
  strs.forEach( function(curr,i,strs){strs[i] = curr.trim();} );
  myname = strs;

  encounterAct(lastEncounter, false);
  
  $("input[name=currname]").val(myname);
  $(".nameentry").hide();
}

function closeButton()
{
  $(".nameentry").hide();
}

function nameInput()
{
  var input = prompt("Please enter your character name.\n(Or names, separated by commas, if multiple.)", $("input[name=newname]").val());
  if (input != null) $("input[name=newname]").val(input);
}


/* --- Config functions --- */


function getConfigName(getMainConfig)
{
  var currentPathParts = document.location.href.split("/");
  return (getMainConfig || currentPathParts[currentPathParts.length-1] == "index.html") ? "kajiOverlayConfig" : "kajiOverlayConfigWindow";
}

function saveConfig()
{
  var config = {
    "othershide":($("#othershide").attr("data-checked") == "true"),
    "nicknamehide":($("#nicknamehide").attr("data-checked") == "true"),
    "mergeAvatar":($("#mergeAvatar").attr("data-checked") == "true"),
  };
  var simpleGlobalConfigItems = ["myname", "selectTab", "sortkey", "sorttype", "normalSortKey", "normalSortType", "personalSortKey", "personalSortType"];
  simpleGlobalConfigItems.forEach( function(currItem){ config[currItem] = window[currItem]; } );

  localStorage.setItem(getConfigName(), JSON.stringify(config));
}

function loadConfig()
{
  if (getConfigName() in localStorage)
  {
    var config = JSON.parse(localStorage.getItem(getConfigName()));

    function validConfigItem(name) { return (name in config && config[name] != undefined); };
    function globalConfigItemLoad(name) { if (validConfigItem(name)) window[name] = config[name]; };

    var simpleGlobalConfigItems = ["myname", "normalSortKey", "normalSortType", "personalSortKey", "personalSortType"];
    simpleGlobalConfigItems.forEach( function(currItem){ globalConfigItemLoad(currItem); } );

    if (validConfigItem("selectTab") && sortObject[config.selectTab] != undefined)  resortDo(config.selectTab);
    if (validConfigItem("nicknamehide") && config.nicknamehide) $("#nicknamehide").attr("data-checked", "true");
    if (validConfigItem("mergeAvatar") && config.mergeAvatar) $("#mergeAvatar").attr("data-checked", "true");
    if (validConfigItem("sortkey") && sortObject[selectTab][config.sortkey] != undefined && sortObject[selectTab][config.sortkey].display)
    {
      sortkey = config.sortkey;
      globalConfigItemLoad("sorttype");
    }
    if (validConfigItem("othershide") && config.othershide)
    {
      hideOthers();
      $("#othershide").attr("data-checked", "true");
    }

    updateSort();
  }

  if (getConfigName() != getConfigName(true))
  {
    if (getConfigName(true) in localStorage)
    {
      var config2 = JSON.parse(localStorage.getItem(getConfigName(true)));
      if ("myname" in config2 && config2.myname != undefined) myname = config2.myname;
    }
  }

  if (!getConfigName().includes("Window") && startOpenWindow == true) openStreamWindow();
}


/* --- Debug/testing functions --- */


function saveTestData(name)
{
  localStorage.setItem("kajiOverlayTestData-" + name.replace(/ /ig,""), JSON.stringify(lastEncounter.detail));
}

function loadTestData(name)
{
  var dataName = "kajiOverlayTestData-" + name.replace(/ /ig,"");
  
  if (dataName in localStorage)
  {
    var data = JSON.parse(localStorage.getItem(dataName));
    lastEncounter = Object();
    lastEncounter.detail = data;
    encounterAct(lastEncounter, false);
  }
}

function saveTestRecord(name)
{
  var modRecord = [];
  for (curr in lastEncounterRecord)
    modRecord.push(lastEncounterRecord[curr].detail);
  localStorage.setItem("kajiOverlayTestRecord-" + name.replace(/ /ig,""), JSON.stringify(modRecord));
}

function loadTestRecord(name)
{
  var dataName = "kajiOverlayTestRecord-" + name.replace(/ /ig,"");
  
  if (dataName in localStorage)
  {
    var data = JSON.parse(localStorage.getItem(dataName));
    for (curr in data)
    {
      lastEncounter = Object();
      lastEncounter.detail = data[curr];
      encounterAct(lastEncounter, false);  
    }
  }
}
