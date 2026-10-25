not done:

# Escape Game *whats the title*

A top-down horror escape game for the browser, built with [Phaser 3](https://phaser.io) and JavaScript. Player is trapped in a building with multiple rooms. The goal is to get out. In the each room, player finds and collects objects that are needed to solve the timed puzzle in the final room.

Made as the final project of the Web Programming course at LUT University. 

Author: Viola Hämäläinen

## Features

- Four rooms and a final puzzle room. You can walk back and forth between the rooms.
- Three monsters that each need a different response:
  - **Rush**: the lights flicker twice as a warning, then a wall of black mist crosses the room. Hide in a crate to not take damage.
  - **Screech**: a creature appears next to you. Click it before time runs out. Optionally you can also hide in a crate.
  - **Eyes**: when they open, stand perfectly still.
- A director lets only one event happen at a time, with quiet gaps between them.
- The final gate only opens when you have found every object (1 flask and 1 note in each room). The final room is a logic puzzle: the notes are clues to the order you need to place the four flasks on a tray, and the clock is ticking while the walls close in.
- Dying shows what killed you and a tip for the next try.
- Name entry, a local scoreboard (fewest tries first, then fastest time), a "Continue" rule so quitting to the menu cannot give a better score, and volume settings.
- Fade transitions between all scenes.

*more here probs*

## Controls

- Move: WASD or arrow keys
- Hide in a crate / come out: E (next to a crate)
- Banish Screech: click or tap it
- Final puzzle: place a flask: click/tap a flask, then click/tap a socket
- REMOOOOOOOOOOVE: N toggle notes



## Technology

HTML, CSS and JavaScript. Phaser 3.90.0 for scenes, Arcade physics, input, animation and tweens. Scores and settings are saved in the browser's `localStorage`. ##### CHAGNE THIS

## Credits

- **Phaser 3**: [phaser.io](https://phaser.io), MIT license.
- **Rogue Fantasy Catacombs** by Szadi art.: [szadiart.itch.io/rogue-fantasy-catacombs](https://szadiart.itch.io/rogue-fantasy-catacombs). Free for personal and commercial use, not for resale. Used for the floors, walls, doors, torches and candles. The license text is in `assets/images/catacombs/public-license.txt`.
- **DungeonTileset II** by 0x72: [0x72.itch.io/dungeontileset-ii](https://0x72.itch.io/dungeontileset-ii). CC0. Used for the character, crates, flasks and hearts.
- Sound effects and music: # NOT DOOOOOOOOOONE!!

## AI assistance

The project was written with the help of Claude Sonnet 5.5 as a coding assistant. The details are in the project report.
