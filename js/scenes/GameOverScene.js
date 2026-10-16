import { GAME_WIDTH, MAX_HEARTS } from '../config.js';
import gameState from '../systems/GameState.js';

export default class GameOverScene extends Phaser.Scene {
    constructor() {
        super('GameOverScene');
    }

    init(data) {
        this.roomIndex = (data && data.roomIndex) || 0; 
        this.leaving = false; 
    }

    create() { // luodaan game over scene, pelaaja voi yrittää peliä uudelleen
        this.cameras.main.fadeIn(500, 0, 0, 0);

        this.add.text(GAME_WIDTH / 2, 210, 'GAME OVER', {
            fontFamily: 'Arial', fontSize: '80px', color: '#ff5252'
        }).setOrigin(0.5);

        this.add.text(GAME_WIDTH / 2, 300, `attempt ${gameState.tries} ended. you were caught in room ${this.roomIndex + 1}`, {
            fontFamily: 'Arial', fontSize: '28px', color: '#ffffff'
        }).setOrigin(0.5);

        this.add.text(GAME_WIDTH / 2, 345, 'everything you collected is lost.', {
            fontFamily: 'Arial', fontSize: '22px', color: '#bbbbbb'
        }).setOrigin(0.5);

        const button = this.add.text(GAME_WIDTH / 2, 440, 'Try again', {
            fontFamily: 'Arial',
            fontSize: '40px',
            color: '#ffffff',
            backgroundColor: '#444444',
            padding: { x: 30, y: 15 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        button.on('pointerover', () => button.setStyle({ backgroundColor: '#666666' }));
        button.on('pointerout', () => button.setStyle({ backgroundColor: '#444444' }));
        button.on('pointerdown', () => this.tryAgain());

        this.add.text(GAME_WIDTH / 2, 520, 'or press Enter', {
            fontFamily: 'Arial', fontSize: '20px', color: '#999999'
        }).setOrigin(0.5);

        this.input.keyboard.once('keydown-ENTER', () => this.tryAgain());
    }

    tryAgain() { // kun pelaaja haluaa yrittää uudelleen, peli aloitetaan alusta huoneesta 1
        if (this.leaving) return;
        this.leaving = true;

        this.cameras.main.fadeOut(400, 0, 0, 0);
        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
            gameState.nextTry(); 
            this.scene.start('RoomScene', { roomIndex: 0 });
        });
    }
}