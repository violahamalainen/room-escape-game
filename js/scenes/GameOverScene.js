import { GAME_WIDTH } from '../config.js';
import { TEXTS } from '../data/texts.js';
import gameState from '../systems/GameState.js';
import { createButton, fadeToScene } from '../systems/UI.js';
import { playMusic } from '../systems/Audio.js';


export default class GameOverScene extends Phaser.Scene {
    constructor() {
        super('GameOverScene');
    }

    init(data) {
        this.roomIndex = (data && data.roomIndex) || 0; 
        this.cause = (data && data.cause) || 'unknown'; // mikä pelaajan tappoi, RoomScene lähettää tämän mukana
        this.leaving = false; 
    }

    create() { // luodaan game over scene, pelaaja voi yrittää peliä uudelleen
        this.cameras.main.fadeIn(500, 0, 0, 0);
        playMusic(this, null); // musiikki hiljenee pois

        const info = TEXTS.death[this.cause] || TEXTS.death.unknown; // jos syytä ei tunneta, käytetään yleistä tekstiä
        console.log('cause:', this.cause); // väliaikainen testi, poista kun toimii

        this.add.text(GAME_WIDTH / 2, 130, 'GAME OVER', {
            fontFamily: 'Arial', fontSize: '80px', color: '#ff5252'
        }).setOrigin(0.5);

        this.add.text(GAME_WIDTH / 2, 240, info.title, { // esim. "You died to Rush."
            fontFamily: 'Arial', fontSize: '36px', color: '#ffffff'
        }).setOrigin(0.5);

        this.add.text(GAME_WIDTH / 2, 295, info.tip, { // vinkki miten selvitä ensi kerralla
            fontFamily: 'Arial', fontSize: '26px', color: '#ffd54f', wordWrap: { width: 900 }, align: 'center'
        }).setOrigin(0.5);

        this.add.text(GAME_WIDTH / 2, 365, `attempt ${gameState.tries} ended in room ${this.roomIndex + 1}`, {
            fontFamily: 'Arial', fontSize: '22px', color: '#bbbbbb'
        }).setOrigin(0.5);

        this.add.text(GAME_WIDTH / 2, 400, 'everything you collected is lost.', {
            fontFamily: 'Arial', fontSize: '20px', color: '#999999'
        }).setOrigin(0.5);

        const button = this.add.text(GAME_WIDTH / 2, 490, 'Try again', {
            fontFamily: 'Arial',
            fontSize: '40px',
            color: '#ffffff',
            backgroundColor: '#444444',
            padding: { x: 30, y: 15 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        button.on('pointerover', () => button.setStyle({ backgroundColor: '#666666' }));
        button.on('pointerout', () => button.setStyle({ backgroundColor: '#444444' }));
        button.on('pointerdown', () => this.tryAgain());

        this.add.text(GAME_WIDTH / 2, 550, 'or press Enter', {
            fontFamily: 'Arial', fontSize: '20px', color: '#999999'
        }).setOrigin(0.5);

        createButton(this, GAME_WIDTH / 2, 620, 'Main menu', () => this.goToMenu(), 28);
        this.add.text(GAME_WIDTH / 2, 675, 'Leaving counts as a failed try. Choose Continue on the menu to carry on', {
            fontFamily: 'Arial', fontSize: '18px', color: '#888888'
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

    goToMenu() { // valikkoon poistuminen lasketaan epäonnistuneeksi yritykseksi
        if (this.leaving) return; // estää tuplaklikkauksen
        gameState.nextTry(); // yritykset +1, sydämet ja kerätyt esineet nollataan
        fadeToScene(this, 'MenuScene');
    }
}