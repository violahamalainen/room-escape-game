import { GAME_WIDTH, GAME_HEIGHT } from '../config.js';

const FADE_IN_MS = 1000;     // lause tulee esiin näin hitaasti
const FADE_OUT_MS = 1000;    // ja häipyy näin hitaasti
const MIN_HOLD_MS = 2200;    // lyhyinkin lause pysyy näkyvissä vähintään näin kauan
const MS_PER_CHAR = 45;      // pidemmät lauseet saavat lisäaikaa luettavaksi (merkkiä kohti)
const GAP_MS = 500;          // musta tauko lauseiden välillä
const FIRST_DELAY_MS = 900;  // hetki mustaa alussa
const SKIP_FADE_MS = 250;    // lause häipyy näin nopeasti kun sen ohittaa
const SKIP_GAP_MS = 150;     // lyhyt tauko ohituksen jälkeen ennen seuraavaa lausetta
const SKIP_GUARD_MS = 700;   // ohitus alkaa toimia vasta tämän jälkeen, ettei nimikentän Enter ohita heti

const BASE_STYLE = { // lauseen oletusulkonäkö
    fontFamily: 'Arial', fontSize: '34px', fontStyle: 'italic', color: '#d7d2c4',
    align: 'center', wordWrap: { width: 1000 }
};

// näyttää lauseet mustalla ruudulla yksi kerrallaan: tulee esiin, pysyy, häipyy, seuraava.
// lines = lista merkkijonoja tai { text, style }, onDone kutsutaan kun viimeinenkin on näytetty
export function playSequence(scene, lines, onDone) {
    let nextIndex = 0;      // seuraavaksi näytettävä lause
    let current = null;     // lause joka on näkyvissä tai häipymässä
    let token = 0;          // kasvaa jokaisessa uudessa vaiheessa, vanhentuneet ajastukset huomaavat sen ja lopettavat
    let cutByUser = false;  // true kun pelaaja katkaisi lauseen ja seuraavaa odotetaan
    let canSkip = false;
    let finished = false;

    const wait = (ms, fn) => { // ajastus joka peruuntuu itsestään jos token on vaihtunut tai sarja on loppu
        const my = token;
        scene.time.delayedCall(ms, () => {
            if (!finished && token === my) fn();
        });
    };

    const fadeOut = (text, ms, then) => { // häivyttää lauseen pois ja tuhoaa sen
        scene.tweens.killTweensOf(text);
        scene.tweens.add({
            targets: text, alpha: 0, duration: ms,
            onComplete: () => {
                text.destroy();
                if (then) then();
            }
        });
    };

    const finish = () => {
        if (finished) return;
        finished = true;
        onDone();
    };

    const startLine = () => { // aloittaa seuraavan lauseen tai lopettaa jos lauseet loppuivat
        if (nextIndex >= lines.length) { finish(); return; }

        token += 1;
        cutByUser = false;
        const my = token;

        const item = lines[nextIndex];
        nextIndex += 1;
        const cfg = typeof item === 'string' ? { text: item } : item;

        const text = scene.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, cfg.text, { ...BASE_STYLE, ...(cfg.style || {}) })
            .setOrigin(0.5).setAlpha(0).setDepth(10);
        current = text;

        const hold = Math.max(MIN_HOLD_MS, cfg.text.length * MS_PER_CHAR); // kuinka kauan lause pysyy kokonaan näkyvissä

        scene.tweens.add({ // esiin, odotus, pois, tauko, seuraava
            targets: text, alpha: 1, duration: FADE_IN_MS,
            onComplete: () => {
                if (token !== my) return;
                wait(hold, () => {
                    fadeOut(text, FADE_OUT_MS, () => {
                        if (token !== my) return;
                        if (current === text) current = null;
                        wait(GAP_MS, startLine);
                    });
                });
            }
        });
    };

    const skip = () => { // yksi painallus = yksi lause eteenpäin
        if (!canSkip || finished) return;

        if (current) { // lause näkyy tai häipyy: katkaistaan se nopeasti, seuraava alkaa pienen tauon jälkeen
            token += 1;
            cutByUser = true;
            const t = current;
            current = null;
            fadeOut(t, SKIP_FADE_MS);
            wait(SKIP_FADE_MS + SKIP_GAP_MS, startLine);
        } else if (cutByUser) { // painettiin heti uudestaan ennen kuin seuraava ehti näkyviin: ohitetaan sekin
            token += 1;
            nextIndex += 1;
            wait(SKIP_GAP_MS, startLine);
        } else { // luonnollinen musta tauko: seuraava lause heti
            token += 1;
            startLine();
        }
    };

    // Skip-nappi oikeassa alakulmassa
    const skipButton = scene.add.text(GAME_WIDTH - 30, GAME_HEIGHT - 26, 'Skip >>', {
        fontFamily: 'Arial', fontSize: '22px', color: '#8a8a8a', padding: { x: 10, y: 6 }
    }).setOrigin(1, 1).setDepth(20).setInteractive({ useHandCursor: true });
    skipButton.on('pointerover', () => skipButton.setColor('#ffffff'));
    skipButton.on('pointerout', () => skipButton.setColor('#8a8a8a'));
    skipButton.on('pointerdown', skip);

    scene.input.keyboard.on('keydown-ENTER', (e) => { if (!e.repeat) skip(); }); // pohjassa pidetty näppäin ei ohita monta kertaa
    scene.input.keyboard.on('keydown-SPACE', (e) => { if (!e.repeat) skip(); });

    scene.time.delayedCall(SKIP_GUARD_MS, () => { canSkip = true; });
    wait(FIRST_DELAY_MS, startLine);
}