/* Scale factor for the UI, e.g. 1.5 for 150% of normal size. [default = 1] */
var uiScale = 1;

/* Whether to horizontally shrink the overlay in Personal Mode or not. [default = true]
 *   Also, how to justify the shrunk Personal Mode overlay ("left", "center", "right"). [default = "left"] */
var shrinkForPersonal = false;
var shrinkForPersonalJustify = "left";

/* Whether to open the streaming window on startup or not. [default = false] */
var startOpenWindow = false;

/* Whether to show an icon for the highest DPS ally (excluding pets) other than self when playing certain jobs. [default = true]
 *   Also, which jobs will have this feature active, and what icon to use for that job (icon/___.png) when no ally is found.
 *   Add an entry for "default" if you also want the feature active for all other jobs. E.g. "default":"yosida", */
var showHighestNonSelfPersonalDPSIcon = true;
var showHighestDPSData = {
  "DRG":"Dragon_Sight",
  "AST":"The_Balance",
};


/* Whether to show pets and companions with different colored bars in the parse table when merging pets. [default = true] */
var showMergedPetBars = true;

/* Whether to show a "sticky" floating entry if your entry in the parse list has been scrolled offscreen. [default = true] */
var showStickyEntry = true;

/* Whether to filter out additional entries (e.g. boss mechanics entities that do no damage) in the parse table. [default = true] */
var filterCombatantList = true;


/* Tab names for which character names should be abbreviated to initials, e.g., ["DPS", "HPS"]. [default = ["DPS"]] */
var initialNameTabs = ["DPS"];

/* Tab and sort column settings: */
var sortObject = 
{
  "Overview":
  {
    "encdps":{label:"DPS", width:52, display:true},
    "damage%":{label:"DMG %", display:false},
    "crithit%":{label:"Crit %", width:36,display:true},
    "DirectHitPct":{label:"DH %", width:36,display:true},
    "CritDirectHitPct":{label:"! ! %", width:36,display:false},
    "maxhit":{label:"Max Hit", width:160, display:false},
    "maxhitNoText":{label:"Max Hit", width:60, display:true},
    "kills":{label:"Kills", display:false},
    "enchps":{label:"HPS", width:45, display:false},
    "critheal%":{label:"Crit H. %", display:false},
    "OverHealPct":{label:"Over %", display:false},
    "heals":{label:"Heals", display:false},
    "encdtps":{label:"DTPS", width:42, display:false},
    "deaths":{label:"Deaths", width:34,display:true},
    "duration":{label:"DUR", display:false},
  },
  "DPS":
  {
    "encdps":{label:"DPS", width:40, display:true},
    "damage":{label:"Damage",  width:79, display:true},
    "crithit%":{label:"Crit %", width:36,display:false},
    "DirectHitPct":{label:"DH %", width:36,display:false},
    "CritDirectHitPct":{label:"! ! %", width:36,display:false},
    "maxhit":{label:"Max Hit", width:160, display:false},
    "maxhitNoText":{label:"Max Hit", width:60, display:false},
    "kills":{label:"Kills", display:false},
    "enchps":{label:"HPS", width:45, display:false},
    "critheal%":{label:"Crit H. %", display:false},
    "OverHealPct":{label:"Over %", display:false},
    "heals":{label:"Heals", display:false},
    "encdtps":{label:"DTPS", width:42, display:false},
    "deaths":{label:"Deaths", width:34,display:false},
    "duration":{label:"DUR", display:false},
  },
  "HPS":
  {
    "enchps":{label:"HPS", width:42, display:true},
    "healed%":{label:"Heal %", width: 38, display:false},
    "healed":{label:"Healed", width:58, display:true},
    "critheal%":{label:"Crit H. %", display:false},
    "OverHealPct":{label:"Over %", display:true},
    "heals":{label:"Heals", display:false},
  },
  "DTPS":
  {
    "encdtps":{label:"DTPS", width:42, display:true},
    "ParryPct":{label:"Parry%", width:30,display:false},
    "BlockPct":{label:"Block%", width:30,display:false},
    "damagetaken":{label:"DT", width:54, display:true},
    "healstaken":{label:"Inc. Heal", width:54,display:true},
    "deaths":{label:"Deaths", width:28,display:false},
  }
};
