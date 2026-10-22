import { GAME_WIDTH, GAME_HEIGHT } from '../config.js';

const WARNING_MS = 700;  // varoitus ennenkuin hirviö ilmestyy


// toistuva cycle: odota, varoita, ilmesty, odota klikkauta, toista
export default class Screech { 
    constructor(scene, settings) {
        this.scene = scene;
        this.settings = settings;
        this.active = false; // onko hirviö näytöllä odottamassa klikkausta
        this.creature = null;
        this.timeout = null;

        this.scheduleNext(settings.firstDelayMs); // countdown alkaa
    }

    nextGap() {
        return Phaser.Math.Between(this.settings.minGapMs, this.settings.maxGapMs); // valitsee odotus ajan
    }

    scheduleNext(delayMs) {
        this.scene.time.delayedCall(delayMs, () => this.warn());
    }

    warn() {
        if (this.scene.changingRoom) return;

        if (this.scene.hiding) { // jos piilossa, schedule next try
            this.scheduleNext(this.nextGap());
            return;
        }

        this.scene.cameras.main.flash(250, 255, 0, 0);
        this.scene.showMessage('You hear a screech...', WARNING_MS);
        this.scene.time.delayedCall(WARNING_MS, () => this.appear()); // varotuksen jälkeen kutsutaan appear()
    }

    appear() {
        if (this.scene.changingRoom) return;

        if (this.scene.hiding) { // varmistetaan että pelaaja ei ole piilossa
            this.scheduleNext(this.nextGap());
            return;
        }

        const spot = this.findSpot(); // mihin ilmestytään
        if (!spot) {
            this.scheduleNext(3000);
            return;
        }

        this.createCreature(spot.x, spot.y); 
        this.active = true;
        this.scene.showMessage('Screech! Click it!', this.settings.reactMs);
        this.timeout = this.scene.time.delayedCall(this.settings.reactMs, () => this.missed());
    }

    findSpot() { // mihin screech ilmestyy
        const p = this.scene.player;
        const wallAreas = this.scene.walls.getChildren().map((wall) =>
            Phaser.Geom.Rectangle.Inflate(wall.getBounds(), 40, 40) // hirviö pysyy kauempana seinistä
        );

        for (let attempt = 0; attempt < 40; attempt++) {
            const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
            const distance = Phaser.Math.Between(150, 220);
            const x = p.x + Math.cos(angle) * distance;
            const y = p.y + Math.sin(angle) * distance;

            if (x < 90 || x > GAME_WIDTH - 90 || y < 90 || y > GAME_HEIGHT - 90) continue;
            if (wallAreas.some((area) => Phaser.Geom.Rectangle.Contains(area, x, y))) continue;

            return { x, y };
        }
        return null; // jos ei löydy paikkaa, return null
    }

    createCreature(x, y) {
        const s = this.scene;

        const body = s.add.circle(0, 0, 32, 0x8e0000);
        body.setStrokeStyle(3, 0xff5252);
        const eyeLeft = s.add.circle(-11, -6, 8, 0xffffff);
        const eyeRight = s.add.circle(11, -6, 8, 0xffffff);
        const pupilLeft = s.add.circle(-11, -5, 3.5, 0x000000);
        const pupilRight = s.add.circle(11, -5, 3.5, 0x000000);
        const mouth = s.add.rectangle(0, 14, 26, 8, 0x000000);

        this.creature = s.add.container(x, y, [body, eyeLeft, eyeRight, pupilLeft, pupilRight, mouth]);
        this.creature.setSize(80, 80);
        this.creature.setInteractive({ useHandCursor: true }); // tekee hirviöstä interaktiivisen
        this.creature.setDepth(12);
        this.creature.on('pointerdown', () => this.onClicked());

        this.creature.setScale(0);
        s.tweens.add({ targets: this.creature, scale: 1, duration: 150, ease: 'Back.easeOut' });
        s.tweens.add({
            targets: this.creature,
            angle: 8,
            duration: 110,
            yoyo: true,
            repeat: -1
        });
    }

    onClicked() {
        if (!this.active) return;
        if (this.scene.changingRoom) return;

        this.timeout.remove(false); // lopettaa "liian hidas" ajastimen
        this.active = false;
        this.removeCreature(true); // ajaa hirviö katoaa animaation
        this.scene.showMessage('Banished!', 900);
        this.scheduleNext(this.nextGap());
    }

    missed() { // aika loppui, pelaaja oli liian hidas
        this.active = false;
        this.removeCreature(false);

        if (!this.scene.changingRoom && !this.scene.hiding) {
            this.scene.hurtPlayer();
            this.scene.showMessage('Too slow!', 1200);
        }

        this.scheduleNext(this.nextGap());
    }

    removeCreature(animated) {
        const c = this.creature;
        this.creature = null;
        if (!c) return;

        this.scene.tweens.killTweensOf(c);
        c.disableInteractive();

        if (animated) {
            this.scene.tweens.add({
                targets: c,
                scale: 0,
                angle: 180,
                duration: 200,
                onComplete: () => c.destroy()
            });
        } else {
            c.destroy();
        }
    }

    update() {
        if (this.active && this.scene.hiding) {
            this.timeout.remove(false);
            this.active = false;
            this.removeCreature(false);
            this.scheduleNext(this.nextGap());
        }
    }
}