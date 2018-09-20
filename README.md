# KoreanOverlayKaji

Cress' edit of Kaji's edit of someone else's kinda crappy edit of a nice Korean overlay skin
(for FFXIV's ACT Overlay Plugin)
v9.4


Setup
=====

Unzip it to its own folder. In the Overlay Plugin's tab in ACT, set the URL to
point to the path of the index.html file in the skin folder.

Position and resize the overlay as you like, ensuring that there is plenty of
space for name display, then ensure "Enable clickthru" is UNCHECKED and "Lock
overlay" is CHECKED.

Optionally, open js/config.js for various options, including customizing your
data columns.


Name Entry
==========

The overlay should prompt you for your name upon startup if you haven't set
one. Enter your character name. You can also double-click an entry in the parse
table to change your name to that character's name. Your parse table entry
should now be bold if it wasn't already. Additionally, pet merging, name
blurring, and personal mode should all now work correctly with both you and
your pets.

If you have multiple characters, enter their names separated by commas. You can
also enter a match phrase if have a reasonably uniquely identifying name shared
amongst your characters.

Examples:
- Lyse Hext
- Haurchefant Greystone, Estinien Wyrmblood
- Leveilleur

You may need to restart the overlay for name changes to transfer to the stream
window.


OBS Streaming without Having to Display Capture
===============================================

If you want to stream FFXIV along with the overlay, usually you have to use
a "Display Capture", which is supposedly slower and exposes your desktop to
accidental streaming when you Alt + Tab. This skin provides a workaround.

When you run the overlay, there's an Open Window button at the top. Click it
to open a window. (You can configure the window to open each time on startup.)

Now in OBS, add a "Window Capture" and select the window you just opened.
Then right-click the Window Capture entry, go to filters, and add a color key
filter with custom key. Select black and play with the settings to your liking.
It should look like this:

https://puu.sh/yKxoi/082f32bb5d.png

The window you're streaming and the overlay ingame will sadly be two separate
windows -- that is, changing tabs or sort options or name blurring in one won't
affect the other. But if you just want to stream overall dps and stats, that
shouldn't really matter much anyway.

The alternative to all this is to use the "streamer mode" version of the ACT
Overlay Plugin, which still doesn't seem to work with OBS, but might with other
streaming software maybe.


License
=======

MIT License for most components and my contributions. Unclear what was the
original license; may be GPLv3.
