import { GAME_WIDTH, GAME_HEIGHT } from './config.js';
import BootScene from './scenes/BootScene.js';
import MenuScene from './scenes/MenuScene.js';
import HowToPlayScene from './scenes/HowToPlayScene.js';
import ScoreboardScene from './scenes/ScoreboardScene.js';
import SettingsScene from './scenes/SettingsScene.js';
import RoomScene from './scenes/RoomScene.js';
import GameOverScene from './scenes/GameOverScene.js';
import FinalRoomScene from './scenes/FinalRoomScene.js';
import WinScene from './scenes/WinScene.js';
import TilePickerScene from './scenes/TilePickerScene.js';
import PreviewScene from './scenes/PreviewScene.js';
import IntroScene from './scenes/IntroScene.js';
import { setupPage } from './systems/Page.js';
import OutroScene from './scenes/OutroScene.js';



const config = {
    type: Phaser.AUTO,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    parent: 'game-container',
    backgroundColor: '#111111',
    dom: { createContainer: true }, // tarvitaan, jotta nimikenttä (HTML) voi olla pelin päällä
    input: { activePointers: 3 }, // kolme sormea yhtä aikaa: joystick, HIDE-nappi ja yksi napautus
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: { debug: false }
    },
    scene: [
        BootScene, MenuScene, IntroScene, HowToPlayScene, ScoreboardScene, SettingsScene,
        RoomScene, GameOverScene, FinalRoomScene, WinScene, OutroScene,
        TilePickerScene, PreviewScene
    ]
};

const game = new Phaser.Game(config);
setupPage(game); // pystyasennon viesti ja kellon pysäytys