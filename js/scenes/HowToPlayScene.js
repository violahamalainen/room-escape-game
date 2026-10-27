import { GAME_WIDTH } from '../config.js';
import { TEXTS } from '../data/texts.js';
import { createButton, fadeToScene } from '../systems/UI.js';

export default class HowToPlayScene extends Phaser.Scene {
    constructor() {
        super('HowToPlayScene');
    }

    init() {
        this.leaving = false;
    }

    create() {
        this.cameras.main.fadeIn(500, 0, 0, 0);

        this.add.text(GAME_WIDTH / 2, 100, TEXTS.howToPlayTitle, {
            fontFamily: 'Arial', fontSize: '56px', color: '#ffffff'
        }).setOrigin(0.5);

        // yksi rivi per ohje, rivit alekkain 85 pikselin välein
        TEXTS.howToPlay.forEach((line, i) => {
            this.add.text(GAME_WIDTH / 2, 190 + i * 72, line, {
                fontFamily: 'Arial', fontSize: '24px', color: '#dddddd',
                wordWrap: { width: 1000 }, align: 'center'
            }).setOrigin(0.5);
        });

        createButton(this, GAME_WIDTH / 2, 670, 'Back', () => fadeToScene(this, 'MenuScene'), 30);
    }
}