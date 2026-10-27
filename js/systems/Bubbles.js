import { GAME_WIDTH } from '../config.js';

const MAX_BUBBLES = 3;     // enintään näin monta kuplaa yhtä aikaa
const MIN_SHOW_MS = 2500;  // jokainen kupla näkyy vähintään näin kauan
const GAP = 4;             // kuplien väli pikseleinä
const TOP_LIMIT = 60;      // kuplat eivät mene HUD:n päälle
const DANGER_COLOR = '#ffb4a8'; // vaarakuplat ovat hieman punertavia, tavalliset valkoisia

const STYLE = { // kuplan ulkonäkö, ei mustaa taustaa
    fontFamily: 'Arial', fontSize: '22px', fontStyle: 'italic', color: '#ffffff',
    padding: { x: 12, y: 6 }, wordWrap: { width: 460 }, align: 'center'
};

// pelaajan ajatukset pinona pään yläpuolella: uusin lähimpänä pelaajaa
export default class Bubbles {
    constructor(scene) {
        this.scene = scene;
        this.list = []; // vanhin ensin, uusin viimeisenä: { text, danger, timer }
    }

    add(text, duration, danger) { // lisää kuplan. duration 0 = pysyy kunnes se poistetaan
        const same = this.list.find((b) => b.text.text === text);
        if (same) { // sama teksti on jo näkyvissä: ei tehdä toista, vain jatketaan sen aikaa
            this.restartTimer(same, duration);
            return;
        }

        if (this.list.length >= MAX_BUBBLES) { // ei tilaa: vanhin tavallinen kupla pois
            let victim = this.list.find((b) => !b.danger);
            if (!victim && !danger) return;       // kaikki ovat vaarakuplia: tavallinen viesti ei saa työntää niitä pois
            if (!victim) victim = this.list[0];   // uusi on vaarakupla ja kaikki ovat vaarakuplia: vanhin vaarakupla pois
            this.remove(victim, true);
        }

        const text_ = this.scene.add.text(0, 0, text, { ...STYLE, color: danger ? DANGER_COLOR : STYLE.color });
        text_.setOrigin(0.5, 0).setDepth(30).setAlpha(0); // yläreuna keskellä, näkymätön alussa
        this.scene.tweens.add({ targets: text_, alpha: 1, duration: 200 }); // häivytetään esiin

        const bubble = { text: text_, danger, timer: null };
        this.list.push(bubble);
        this.restartTimer(bubble, duration);
        this.layout(); // heti oikeaan paikkaan, ettei kupla välähdä väärässä kohdassa
    }

    restartTimer(bubble, duration) { // kuplan poistoajastin alkaa alusta
        if (bubble.timer) bubble.timer.remove(false);
        if (duration > 0) {
            bubble.timer = this.scene.time.delayedCall(Math.max(duration, MIN_SHOW_MS), () => this.remove(bubble));
        }
    }

    remove(bubble, instant = false) { // poistaa kuplan, hitaasti häivyttäen tai heti
        const i = this.list.indexOf(bubble);
        if (i === -1) return;
        this.list.splice(i, 1);
        if (bubble.timer) bubble.timer.remove(false);

        const t = bubble.text;
        if (instant) t.destroy();
        else this.scene.tweens.add({ targets: t, alpha: 0, duration: 250, onComplete: () => t.destroy() });
        this.layout();
    }

    clear() { // kaikki pois heti
        [...this.list].forEach((b) => this.remove(b, true));
    }

    update() { // ajetaan joka framella, jotta pino seuraa pelaajaa
        this.layout();
    }

    layout() { // asettaa kuplat pinoon pelaajan pään yläpuolelle
        const p = this.scene.player;
        if (!p || this.list.length === 0) return;

        const anchorY = p.y - (this.scene.hiding ? 62 : 52); // pinon alareuna, kaappi on korkeampi kuin pelaaja
        const heights = this.list.map((b) => b.text.height);
        const total = heights.reduce((sum, h) => sum + h, 0) + GAP * (this.list.length - 1);
        const fitsAbove = anchorY - total >= TOP_LIMIT; // mahtuuko pino ruudulle pelaajan yläpuolelle

        let cursor = fitsAbove ? anchorY : p.y + 40; // ylhäällä: alareunasta ylöspäin, muuten pelaajan alapuolelta alaspäin
        for (let i = this.list.length - 1; i >= 0; i--) { // uusimmasta vanhimpaan
            const t = this.list[i].text;
            const top = fitsAbove ? cursor - t.height : cursor;
            const half = t.width / 2 + 10;
            t.setPosition(Phaser.Math.Clamp(p.x, half, GAME_WIDTH - half), top); // ei mene ruudun sivuille
            cursor = fitsAbove ? top - GAP : top + t.height + GAP;
        }
    }
}