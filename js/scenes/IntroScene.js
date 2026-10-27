import { STORY } from '../data/story.js';
import { playMusic } from '../systems/Audio.js';
import { fadeToScene } from '../systems/UI.js';
import { playSequence } from '../systems/Sequence.js';

export default class IntroScene extends Phaser.Scene {
    constructor() {
        super('IntroScene');
    }

    init() {
        this.leaving = false; // fadeToScene käyttää tätä estämään tuplakäynnistyksen
    }

    create() {
        this.cameras.main.setBackgroundColor(0x000000); // täysin musta tausta
        this.cameras.main.fadeIn(600, 0, 0, 0);
        playMusic(this, 'rooms'); // alkutekstin aikana soi jo huoneiden musiikki

        // kun kaikki lauseet on näytetty, häivytetään peliin
        playSequence(this, STORY.intro, () => fadeToScene(this, 'RoomScene', { roomIndex: 0 }));
    }
}