import { GAME_WIDTH } from '../config.js';
import { loadSettings, saveSettings } from '../systems/Storage.js';
import { createButton, fadeToScene } from '../systems/UI.js';

export default class SettingsScene extends Phaser.Scene {
    constructor() {
        super('SettingsScene');
    }

    init() {
        this.leaving = false;
    }

    create() {
        this.cameras.main.fadeIn(500, 0, 0, 0);
        this.settings = loadSettings();

        this.add.text(GAME_WIDTH / 2, 100, 'SETTINGS', {
            fontFamily: 'Arial', fontSize: '56px', color: '#ffffff'
        }).setOrigin(0.5);

        this.addVolumeRow('Music volume', 'musicVolume', 260);
        this.addVolumeRow('Sound effects volume', 'sfxVolume', 400);

        this.add.text(GAME_WIDTH / 2, 520, 'The game has no sound yet. Your choices are already saved.', {
            fontFamily: 'Arial', fontSize: '20px', color: '#888888'
        }).setOrigin(0.5);

        createButton(this, GAME_WIDTH / 2, 640, 'Back', () => fadeToScene(this, 'MenuScene'), 30);
    }

    addVolumeRow(label, key, y) { // otsikko, miinus-nappi, prosentti ja plus-nappi
        this.add.text(GAME_WIDTH / 2, y - 45, label, {
            fontFamily: 'Arial', fontSize: '28px', color: '#ffffff'
        }).setOrigin(0.5);

        const valueText = this.add.text(GAME_WIDTH / 2, y + 10, '', {
            fontFamily: 'Arial', fontSize: '36px', color: '#ffd54f'
        }).setOrigin(0.5);

        const refresh = () => valueText.setText(`${Math.round(this.settings[key] * 100)}%`);

        const change = (step) => { // muuttaa äänenvoimakkuutta 10 % kerrallaan ja tallentaa heti
            const next = Math.round((this.settings[key] + step) * 10) / 10; // pyöristys estää 0.30000000004 -virheet
            this.settings[key] = Phaser.Math.Clamp(next, 0, 1);
            saveSettings(this.settings);
            refresh();
        };

        createButton(this, GAME_WIDTH / 2 - 150, y + 10, '-', () => change(-0.1), 36);
        createButton(this, GAME_WIDTH / 2 + 150, y + 10, '+', () => change(0.1), 36);
        refresh();
    }
}