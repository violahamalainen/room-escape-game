import { GAME_WIDTH, GAME_HEIGHT } from '../config.js';
import { STORY } from '../data/story.js';
import { revealLines, fadeToScene } from '../systems/UI.js';
import { playMusic } from '../systems/Audio.js';


const LINE_STYLE = { // tekstin ulkonäkö
    fontFamily: 'Arial', fontSize: '30px', fontStyle: 'italic', color: '#d7d2c4',
    align: 'center', wordWrap: { width: 1000 }
};
const AUTO_CONTINUE_MS = 6000; // kuinka kauan viimeisen rivin jälkeen odotetaan ennen kuin peli jatkuu itsestään

export default class IntroScene extends Phaser.Scene {
    constructor() {
        super('IntroScene');
    }

    init() {
        this.leaving = false;
        this.canSkip = false; // alkuun ei voi ohittaa, ettei nimikentän Enter ohita tekstiä heti
    }

    create() {
        this.cameras.main.fadeIn(600, 0, 0, 0);
                playMusic(this, 'rooms'); // alkutekstin aikana soi jo huoneiden musiikki, menu-musiikki hiipuu pois

        const { totalMs } = revealLines(this, STORY.intro, 190, 105, LINE_STYLE); // rivit ilmestyvät yksi kerrallaan

        const hint = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 50, STORY.skipHint, {
            fontFamily: 'Arial', fontSize: '20px', color: '#8a8a8a'
        }).setOrigin(0.5).setAlpha(0);
        this.tweens.add({ targets: hint, alpha: 1, duration: 600, delay: 1500 }); // ohjeteksti tulee näkyviin hetken kuluttua

        this.time.delayedCall(700, () => { this.canSkip = true; });
        this.input.keyboard.on('keydown', () => this.finish()); // mikä tahansa näppäin ohittaa
        this.input.on('pointerdown', () => this.finish());      // klikkaus tai kosketus ohittaa
        this.time.delayedCall(totalMs + AUTO_CONTINUE_MS, () => this.finish()); // ja lopuksi peli jatkuu itsestään
    }

    finish() {
        if (!this.canSkip) return;
        fadeToScene(this, 'RoomScene', { roomIndex: 0 }); // fadeToScene estää tuplakäynnistyksen
    }
}