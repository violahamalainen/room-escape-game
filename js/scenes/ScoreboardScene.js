import { GAME_WIDTH } from '../config.js';
import { loadScores, sortScores } from '../systems/Storage.js';
import { createButton, fadeToScene, formatTime } from '../systems/UI.js';

export default class ScoreboardScene extends Phaser.Scene {
    constructor() {
        super('ScoreboardScene');
    }

    init(data) {
        this.highlightId = (data && data.highlightId) || null; // juuri tallennettu tulos korostetaan
        this.leaving = false;
    }

    create() {
        this.cameras.main.fadeIn(500, 0, 0, 0);

        this.add.text(GAME_WIDTH / 2, 70, 'SCOREBOARD', {
            fontFamily: 'Arial', fontSize: '56px', color: '#ffffff'
        }).setOrigin(0.5);

        const scores = sortScores(loadScores()).slice(0, 10); // top 10

        if (scores.length === 0) {
            this.add.text(GAME_WIDTH / 2, 330, 'No finished runs yet', {
                fontFamily: 'Arial', fontSize: '32px', color: '#bbbbbb'
            }).setOrigin(0.5);
        } else {
            this.addRow(150, '#', 'Name', 'Tries', 'Time', '#aaaaaa');
            scores.forEach((s, i) => {
                const color = s.id === this.highlightId ? '#ffd54f' : '#ffffff';
                this.addRow(200 + i * 44, String(i + 1), s.name, String(s.tries), formatTime(s.seconds), color);
            });
            this.add.text(GAME_WIDTH / 2, 635, 'Scores are saved in this browser only.', {
                fontFamily: 'Arial', fontSize: '18px', color: '#888888'
            }).setOrigin(0.5);
        }

        createButton(this, GAME_WIDTH / 2, 690, 'Back', () => fadeToScene(this, 'MenuScene'), 30);
    }

    addRow(y, rank, name, tries, time, color) { // yksi taulukon rivi, neljä saraketta
        const style = { fontFamily: 'Arial', fontSize: '28px', color };
        this.add.text(340, y, rank, style).setOrigin(0.5);
        this.add.text(430, y, name, style).setOrigin(0, 0.5);
        this.add.text(820, y, tries, style).setOrigin(0.5);
        this.add.text(980, y, time, style).setOrigin(0.5);
    }
}