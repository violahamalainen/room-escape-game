import { ART_SCALE } from '../config.js';

// piirretty note, keskipiste on (0, 0)
function drawScroll(scene) {
    const g = scene.add.graphics();
    g.fillStyle(0xf5f0dc, 1);
    g.fillRect(-10, -12, 20, 24);  // paperi
    g.fillStyle(0xcfc08f, 1);
    g.fillRect(-12, -15, 24, 6);   // yläkääre
    g.fillRect(-12, 9, 24, 6);     // alakääre
    g.fillStyle(0x8a7a55, 1);
    g.fillRect(-6, -4, 12, 2);     // tekstirivit
    g.fillRect(-6, 1, 12, 2);
    g.fillRect(-6, 6, 8, 2);
    return g;
}

// flask tai  note, leijuu ylös alas
export default class Pickup {
    constructor(scene, kind, data) {
        this.kind = kind;
        this.x = data.x;
        this.y = data.y;

        const parts = []; 
        if (kind === 'object') {
            parts.push(scene.add.image(0, 0, 'dungeonSheet', `flask_big_${data.flask}`).setScale(ART_SCALE));
        } else {
            parts.push(drawScroll(scene));
        }

        this.shape = scene.add.container(data.x, data.y, parts); // container liikuttaa kaikkia osia yhdessä
        this.shape.setDepth(3);

        this.bob = scene.tweens.add({ // leijuminen ylös alas
            targets: this.shape,
            y: data.y - 6,
            duration: 700,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    isNear(player) { // true jos pelaaja on tarpeeksi lähellä keräämään
        return Phaser.Math.Distance.Between(player.x, player.y, this.x, this.y) < 40;
    }

    destroy() {
        this.bob.stop(); // pysäytetään leijuminen ensin
        this.shape.destroy();
    }
}