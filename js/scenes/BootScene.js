import { loadArt, prepareArt } from '../systems/Art.js';
import { loadSfx } from '../systems/Audio.js';

export default class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        loadArt(this); // kaikki kuvat ladataan kerran pelin alussa
        loadSfx(this); // ja lyhyet äänitehosteet, mut musiikit ladataan vasta kun niitä tarvitaan
    }

    create() {
        prepareArt(this); // nimetään kuvien palat ja tehdään animaatiot

        // launch eikä start: BootScene jää käyntiin, ja sen lataajaa käytetään musiikkien lataamiseen myöhemmin
        this.scene.launch('MenuScene'); // peli alkaa valikosta
    }
}