import { STORY } from '../data/story.js';
import { playMusic } from '../systems/Audio.js';
import { fadeToScene } from '../systems/UI.js';
import { playSequence } from '../systems/Sequence.js';

export default class OutroScene extends Phaser.Scene {
    constructor() {
        super('OutroScene');
    }

    init(data) {
        this.seconds = (data && data.seconds) || 0; // peliaika annetaan eteenpäin tulosruudulle
        this.leaving = false;
    }

    create() {
        this.cameras.main.setBackgroundColor(0x000000);
        this.cameras.main.fadeIn(700, 0, 0, 0);
        playMusic(this, 'win'); // voittomusiikki alkaa heti

        // kun kaikki lauseet on näytetty, siirrytään tulosruutuun
        playSequence(this, STORY.outro, () => fadeToScene(this, 'WinScene', { seconds: this.seconds }));
    }
}