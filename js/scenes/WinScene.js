import { GAME_WIDTH } from '../config.js';
import gameState from '../systems/GameState.js';
import { saveScore, loadScores, sortScores } from '../systems/Storage.js';
import { createButton, fadeToScene, formatTime } from '../systems/UI.js';

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

        gameState.endRun(); // tämä peli on päättynyt, seuraava Start aloittaa uuden

        this.add.text(GAME_WIDTH / 2, 150, 'YOU ESCAPED!', {
            fontFamily: 'Arial', fontSize: '80px', color: '#66bb6a'
        }).setOrigin(0.5);

        this.add.text(GAME_WIDTH / 2, 255, gameState.playerName, {
            fontFamily: 'Arial', fontSize: '36px', color: '#ffffff'
        }).setOrigin(0.5);

        this.add.text(GAME_WIDTH / 2, 330, `Tries: ${gameState.tries}     Time: ${formatTime(this.seconds)}`, {
            fontFamily: 'Arial', fontSize: '34px', color: '#ffffff'
        }).setOrigin(0.5);

        if (rank > 0) {
            this.add.text(GAME_WIDTH / 2, 395, `Rank #${rank} on this browser's scoreboard`, {
                fontFamily: 'Arial', fontSize: '26px', color: '#ffd54f'
            }).setOrigin(0.5);
        }

        createButton(this, GAME_WIDTH / 2, 500, 'Scoreboard', () => {
            fadeToScene(this, 'ScoreboardScene', { highlightId: entry.id });
        });
        createButton(this, GAME_WIDTH / 2, 590, 'Main menu', () => fadeToScene(this, 'MenuScene'));
    }
}