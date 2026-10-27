# Escape Game 

A top-down horror escape game for the browser, built with [Phaser 3](https://phaser.io) and JavaScript. Player is a wizard trapped in catacombs with multiple rooms. The goal is to get out. In the each room, player finds and collects objects that are needed to solve the timed puzzle in the final room.

Play it online: https://violahamalainen.github.io/room-escape-game/

Made as the final project of the Web Programming course at LUT University. 

Author: Viola Hämäläinen

## How to play

Goal of each room is to find a key, that then opens the door to the next room. In each room player also finds and picks up objects. In the final room player needs to solve a puzzle before time runs out.

Player can hide in crates when danger comes. Some monsters can be banished with clicking them.

Player has three hearts. If you lose them all, you start again in room 1 and everything you collected is lost.

## Controls

Keybooard and mouse:
- Move: WASD or arrow keys
- Hide in a crate / come out: E (next to a crate)
- Banish Screech monster: click it
- Final puzzle: place a flask: click a flask, then click a socket to place it
- Skip a story sentence: skip button, enter, space

Phone or tablet:
- Move: joystick
- Hide in a crate / come out: HIDE button
- Banish Screech monster: tap it
- Final puzzle: place a flask: tap a flask, then tap a socket to place it
- Skip a story sentence: skip button


## The creatures

- Rush: the lights flicker faintly at first, then strongly, and then a wall of black mist crosses the room. If it hits player, player takes damage. Hide in a crate to escape it.
- Screech: the screen flashes and a creature appears next to player. Click it before time runs out and it damages you.
- Eyes: when they open, stand still. Any movement and you take damage.


## Features

- Four rooms and a final puzzle room. You can walk back and forth between the rooms.
- A director lets only one monster event happen at a time, with quiet gaps between them.
- The final gate only opens when you have found every object (1 flask and 1 note in each room). The final room is a logic puzzle: the notes are clues to the order you need to place the four flasks on a tray, and the clock is ticking while the walls close in.
- Dying shows what killed you and a tip for the next try.
- Name entry, a local scoreboard (fewest tries first, then fastest time), a "Continue" rule so quitting to the menu cannot give a better score, and volume settings.
- Fade transitions between all scenes.
- Sound effects annd music
- Touch controls 
- Speech bubbles are the wizaards thoughts, they guide the player.
- A pulsing red light when at one heart

## Testing

- I tested on Chrome and Safari
- Testing shortcuts: press 0 in a room to jumpstart the final puzzle, to skip the rooms 1-4. Add '?touch=1' to the address to show the touch controls on a desktop.

## Credits

- Phaser 3: [phaser.io](https://phaser.io), MIT license.

Art:

- Rogue Fantasy Catacombs by Szadi art.: szadiart.itch.io/rogue-fantasy-catacombs. Free for personal and commercial use, not for resale. Used for the floors, walls, doors, torches and candles. The license text is in assets/images/catacombs/public-license.txt.
- DungeonTileset II by 0x72: 0x72.itch.io/dungeontileset-ii. CC0. Used for the wizard, crates, flasks and hearts.


Sound effects:

- Sound effects from Pixabay, under the Pixabay Content License.

Music:

- "Symmetry" by Kevin MacLeod (incompetech.com), licensed under Creative Commons: By Attribution 4.0, http://creativecommons.org/licenses/by/4.0/
- "Gi-i Dark Ambient Techno" by SouljahdeShiva, CC BY 3.0, https://opengameart.org/content/gi-i-dark-ambient-techno
- "Ominous Sci-Fi Menu" by Eric Matyas www.soundimage.org, CC BY 3.0, https://opengameart.org/content/ominous-sci-fi-menu-looping
- "Something Freaky This Way Comes" by Eric Matyas www.soundimage.org, https://soundimage.org/dark-ominous/
