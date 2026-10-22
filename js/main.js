import { GAME_WIDTH, GAME_HEIGHT } from './config.js';
import BootScene from './scenes/BootScene.js';
import RoomScene from './scenes/RoomScene.js';
import GameOverScene from './scenes/GameOverScene.js';
import FinalRoomScene from './scenes/FinalRoomScene.js';

const config = {
    type: Phaser.AUTO,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    parent: 'game-container',
    backgroundColor: '#111111',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: { debug: false }
    },
    scene: [BootScene, RoomScene, GameOverScene, FinalRoomScene]
};

new Phaser.Game(config);