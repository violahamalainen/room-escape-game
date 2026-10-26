import { GAME_WIDTH, GAME_HEIGHT } from '../config.js';
import { TEXTS } from '../data/texts.js';
import { playSfx } from '../systems/Audio.js';


const WARNING_MS = 700;  // varoitus ennenkuin hirviö ilmestyy

// toistuva cycle: odota, varoita, ilmesty, odota klikkausta, toista
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
        this.scene.time.delayedCall(delayMs, () => this.tryStart());
    }

    tryStart() { // alkaa vain jos pelaaja ei piilossa ja ohjaaja antaa luvan
        if (this.scene.changingRoom) return;

        if (this.scene.hiding) { // jos piilossa, ei hyökkäystä tällä kertaa
            this.scheduleNext(this.nextGap());
            return;
        }

        const director = this.scene.director;
        if (!director.canStart()) { // jokin toinen tapahtuma on käynnissä -> yritetään hetken päästä uudestaan
            this.scheduleNext(Phaser.Math.Between(800, 1600));
            return;
        }

        director.start('screech');
        playSfx(this.scene, 'screech');
        this.scene.cameras.main.flash(250, 255, 0, 0);
        this.scene.showMessage(TEXTS.screechWarning, WARNING_MS);
        this.scene.time.delayedCall(WARNING_MS, () => this.appear()); // varotuksen jälkeen kutsutaan appear()
    }

    appear() {
        if (this.scene.changingRoom) return;

        if (this.scene.hiding) { // pelaaja ehti piiloutua varoituksen aikana
            this.scene.director.end();
            this.scheduleNext(this.nextGap());
            return;
        }

        const spot = this.findSpot();
        if (!spot) { // ei löytynyt vapaata paikkaa, yritetään pian uudestaan
            this.scene.director.end();
            this.scheduleNext(3000);
            return;
        }

        this.createCreature(spot.x, spot.y);
        this.active = true;
        this.timeout = this.scene.time.delayedCall(this.settings.reactMs, () => this.missed());
    }

    findSpot() { // etsii paikan 150-220 pikseliä pelaajasta, ei seinän sisällä
        const p = this.scene.player;
        const wallAreas = this.scene.walls.getChildren().map((wall) =>
            Phaser.Geom.Rectangle.Inflate(wall.getBounds(), 40, 40)
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
        return null;
    }

    createCreature(x, y) { // hirviö tehdään muodoista, container yhdistää ne yhdeksi klikattavaksi olioksi
        const s = this.scene;

        const body = s.add.circle(0, 0, 32, 0x8e0000);
        body.setStrokeStyle(3, 0xff5252);
        const eyeLeft = s.add.circle(-11, -6, 8, 0xffffff);
        const eyeRight = s.add.circle(11, -6, 8, 0xffffff);
        const pupilLeft = s.add.circle(-11, -5, 3.5, 0x000000);
        const pupilRight = s.add.circle(11, -5, 3.5, 0x000000);
        const mouth = s.add.rectangle(0, 14, 26, 8, 0x000000);

        this.creature = s.add.container(x, y, [body, eyeLeft, eyeRight, pupilLeft, pupilRight, mouth]);
        this.creature.setSize(80, 80); // klikkausalue, containerilla ei ole omaa kokoa
        this.creature.setInteractive({ useHandCursor: true });
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

    onClicked() { // pelaaja ehti klikata ajoissa
        if (!this.active) return;
        if (this.scene.changingRoom) return;

        this.timeout.remove(false); // peruu "liian hidas" -ajastimen
        this.active = false;
        playSfx(this.scene, 'banish');
        this.removeCreature(true);
        this.scene.showMessage(TEXTS.screechBanished, 900);
        this.scene.director.end();
        this.scheduleNext(this.nextGap());
    }

    missed() { // aika loppui ennen klikkausta
        this.active = false;
        this.removeCreature(false);

        if (!this.scene.changingRoom && !this.scene.hiding) {
            this.scene.hurtPlayer('screech');
            this.scene.showMessage(TEXTS.screechMissed, 1200);
        }

        this.scene.director.end();
        this.scheduleNext(this.nextGap());
    }

    removeCreature(animated) {
        const c = this.creature;
        this.creature = null; // nollataan heti, ettei samaa poisteta kahdesti
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

    update() { // jos pelaaja piiloutuu kun hirviö on esillä, hirviö katoaa ilman damagea
        if (this.active && this.scene.hiding) {
            this.timeout.remove(false);
            this.active = false;
            this.removeCreature(false);
            this.scene.director.end();
            this.scheduleNext(this.nextGap());
        }
    }
}