import { GAME_WIDTH, GAME_HEIGHT } from '../config.js';

export default class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    create() {
        this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'Hello, game!', {
            fontFamily: 'Arial',
            fontSize: '48px',
            color: '#ffffff'
        }).setOrigin(0.5);
    }
}