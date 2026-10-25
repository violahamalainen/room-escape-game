import { GAME_WIDTH, MAX_HEARTS, ART_SCALE } from '../config.js';

const HEART_GAP = 34;  // sydänten välimatka pikseleinä
const HEART_Y = 20;    // sydänten korkeus ruudulla, yläseinän keskellä

// sydämet kuvina oikeassa yläkulmassa, palauttaa olion jolla on set(määrä)
export function createHearts(scene) {
    const hearts = [];
    for (let i = 0; i < MAX_HEARTS; i++) {
        const x = GAME_WIDTH - 30 - (MAX_HEARTS - 1 - i) * HEART_GAP; // ensimmäinen sydän vasemmalla, viimeinen oikeassa reunassa
        hearts.push(scene.add.image(x, HEART_Y, 'dungeonSheet', 'ui_heart_full').setScale(ART_SCALE).setDepth(30));
    }

    let shown = null; // montako sydäntä näytettiin viimeksi, null = ei vielä asetettu

    return {
        set(count) { // täydet sydämet vasemmalta, tyhjät perässä
            hearts.forEach((h, i) => h.setFrame(i < count ? 'ui_heart_full' : 'ui_heart_empty'));

            if (shown !== null && count < shown) { // menetettiin sydän: se pomppaa hetkeksi isommaksi
                scene.tweens.add({ targets: hearts[count], scale: ART_SCALE * 1.8, duration: 120, yoyo: true });
            }
            shown = count;
        }
    };
}