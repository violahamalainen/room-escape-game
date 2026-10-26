import { loadArt, prepareArt } from '../systems/Art.js';
import { loadSfx } from '../systems/Audio.js';

export default class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        loadArt(this); // kaikki kuvat ladataan kerran pelin alussa
        loadSfx(this); // ja lyhyet äänitehosteet. Musiikit ladataan vasta kun niitä tarvitaan
    }

    create() {
        prepareArt(this); // nimetään kuvien palat ja tehdään animaatiot

        // launch eikä start: BootScene jää käyntiin, ja sen lataajaa käytetään musiikkien lataamiseen myöhemmin
        const tool = new URLSearchParams(window.location.search).get('tool'); // ?tool=picker tai ?tool=preview avaa kehitystyökalun
        if (tool === 'picker') this.scene.launch('TilePickerScene');
        else if (tool === 'preview') this.scene.launch('PreviewScene');
        else this.scene.launch('MenuScene'); // peli alkaa valikosta
    }
}