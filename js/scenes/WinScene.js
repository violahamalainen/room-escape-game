import { GAME_WIDTH } from '../config.js';
import { STORY } from '../data/story.js';
import gameState from '../systems/GameState.js';
import { saveScore, loadScores, sortScores } from '../systems/Storage.js';
import { createButton, fadeToScene, formatTime, revealLines } from '../systems/UI.js';

const ENDING_STYLE = { // loppurivien ulkonäkö
    fontFamily: 'Arial', fontSize: '26px', fontStyle: 'italic', color: '#cfd8dc',
    align: 'center', wordWrap: { width: 1000 }
};

export default class WinScene extends Phaser.Scene {
    constructor() {
        super('WinScene');
    }

    init(data) {
        this.seconds = (data && data.seconds) || 0; // peliaika annetaan mukana, kello pysähtyi voitossa
        this.leaving = false;
    }

    create() {
        this.cameras.main.fadeIn(700, 0, 0, 0);

        // tallennetaan tulos kerran, kun voittoruutu avautuu
        const entry = saveScore(gameState.playerName || 'Player', gameState.tries, this.seconds);
        const rank = sortScores(loadScores()).findIndex((s) => s.id === entry.id) + 1; // 0 jos ei löytynyt
        gameState.endRun(); // tämä peli on päättynyt, seuraava Start aloittaa uuden pelin

        this.add.text(GAME_WIDTH / 2, 100, STORY.winTitle, {
            fontFamily: 'Arial', fontSize: '70px', color: '#66bb6a'
        }).setOrigin(0.5);

        this.add.text(GAME_WIDTH / 2, 185, gameState.playerName, {
            fontFamily: 'Arial', fontSize: '32px', color: '#ffffff'
        }).setOrigin(0.5);

        this.add.text(GAME_WIDTH / 2, 240, `Tries: ${gameState.tries}     Time: ${formatTime(this.seconds)}`, {
            fontFamily: 'Arial', fontSize: '30px', color: '#ffffff'
        }).setOrigin(0.5);

        if (rank > 0) {
            this.add.text(GAME_WIDTH / 2, 290, `Rank #${rank} on this browser's scoreboard`, {
                fontFamily: 'Arial', fontSize: '24px', color: '#ffd54f'
            }).setOrigin(0.5);
        }

        revealLines(this, STORY.ending, 380, 70, ENDING_STYLE, 1700); // loppurivit ilmestyvät yksi kerrallaan

        createButton(this, GAME_WIDTH / 2 - 170, 640, 'Scoreboard', () => {
            fadeToScene(this, 'ScoreboardScene', { highlightId: entry.id });
        }, 30);
        createButton(this, GAME_WIDTH / 2 + 170, 640, 'Main menu', () => fadeToScene(this, 'MenuScene'), 30);
    }
}