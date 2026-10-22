import { GAME_WIDTH, GAME_HEIGHT } from './config.js';
import BootScene from './scenes/BootScene.js';
import MenuScene from './scenes/MenuScene.js';
import ScoreboardScene from './scenes/ScoreboardScene.js';
import SettingsScene from './scenes/SettingsScene.js';
import RoomScene from './scenes/RoomScene.js';
import GameOverScene from './scenes/GameOverScene.js';
import FinalRoomScene from './scenes/FinalRoomScene.js';
import WinScene from './scenes/WinScene.js';

const config = {
    type: Phaser.AUTO,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    parent: 'game-container',
    backgroundColor: '#111111',
    dom: { createContainer: true }, // tarvitaan, jotta nimikenttä (HTML) voi olla pelin päällä
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: { debug: false }
    },
    scene: [BootScene, MenuScene, ScoreboardScene, SettingsScene, RoomScene, GameOverScene, FinalRoomScene, WinScene]
};

new Phaser.Game(config);