import { GAME_WIDTH, GAME_HEIGHT } from '../config.js';

const PULSE_MIN = 0.15;   // pulssin himmein kohta (0 = näkymätön, 1 = täysi väri)
const PULSE_MAX = 0.4;    // pulssin kirkkain kohta
const PULSE_MS = 1000;    // yhden pulssin kesto yhteen suuntaan millisekunteina, hitaampi on rauhallisempi
const DANGER_HEARTS = 1;  // punainen reuna näkyy kun sydämiä on näin paljon tai vähemmän

function ensureVignetteTexture(scene) { // tekee punaisen reunahehkun kuvan vain kerran, kuva säilyy huoneesta toiseen
    if (scene.textures.exists('lowHealthVignette')) return;

    const tex = scene.textures.createCanvas('lowHealthVignette', 256, 256);
    const ctx = tex.getContext();
    const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 181); // 181 = etäisyys keskeltä kulmaan
    gradient.addColorStop(0, 'rgba(180, 0, 0, 0)');     // keskusta täysin läpinäkyvä
    gradient.addColorStop(0.55, 'rgba(180, 0, 0, 0)');  // läpinäkyvä pidemmälle, joten vain reunat ja kulmat värjäytyvät
    gradient.addColorStop(1, 'rgba(200, 0, 0, 0.5)');   // kulmissa vain puoliksi punainen
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 256, 256);
    tex.refresh();
}

// punainen sykkivä reunahehku, palauttaa olion jolla on set(sydänten määrä)
export function createLowHealth(scene) {
    ensureVignetteTexture(scene);

    const glow = scene.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'lowHealthVignette');
    glow.setDisplaySize(GAME_WIDTH, GAME_HEIGHT); // venytetään koko ruudun kokoiseksi
    glow.setDepth(25).setAlpha(0).setVisible(false); // rushin vilkkumisen (20) päällä, HUD-tekstien (30) alla

    let active = false; // onko hehku päällä

    return {
        set(hearts) {
            const danger = hearts <= DANGER_HEARTS;
            if (danger === active) return; // ei tehdä mitään jos tila ei muutu
            active = danger;

            scene.tweens.killTweensOf(glow);
            if (danger) {
                glow.setVisible(true).setAlpha(PULSE_MIN);
                scene.tweens.add({ // sykkivä liike himmeästä kirkkaaseen ja takaisin
                    targets: glow,
                    alpha: PULSE_MAX,
                    duration: PULSE_MS,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut'
                });
            } else {
                glow.setVisible(false).setAlpha(0);
            }
        }
    };
}