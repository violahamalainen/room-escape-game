export function createShape(scene, data) {
    switch (data.shape) { // luodaan esineen muoto sen mukaan, mikä on määritelty dataan
        case 'square':
            return scene.add.rectangle(data.x, data.y, 30, 30, data.color);
        case 'triangle':
            return scene.add.triangle(data.x, data.y, 0, 30, 15, 0, 30, 30, data.color);
        case 'star':
            return scene.add.star(data.x, data.y, 5, 9, 20, data.color);
        default:
            return scene.add.circle(data.x, data.y, 16, data.color);
    }
}

export default class Pickup {
    constructor(scene, kind, data) {
        this.kind = kind; // obect tai note
        this.x = data.x;
        this.y = data.y;

        if (kind === 'object') {
            this.shape = createShape(scene, data);
        } else {
            this.shape = scene.add.rectangle(data.x, data.y, 26, 34, 0xf5f0dc);
        }

        this.shape.setStrokeStyle(2, 0xffffff);
        this.shape.setDepth(3);

        this.bob = scene.tweens.add({ // esine leijuu ylös alas ni helpompi nähä
            targets: this.shape,
            y: data.y - 6,
            duration: 700,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    isNear(player) { // distance check
        return Phaser.Math.Distance.Between(player.x, player.y, this.x, this.y) < 40;
    }

    destroy() { // kun esine on kerätty, se poistetaan näkyvistä ja tween animaatio pysäytetään
        this.bob.stop();
        this.shape.destroy();
    }
}