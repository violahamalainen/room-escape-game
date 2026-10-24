import { TEXTS } from '../data/texts.js';

const LOOKS = { // silmien ulkonäkö
    closed:  { color: 0x555555, scaleY: 0.12, zoneAlpha: 0 },
    warning: { color: 0xffd54f, scaleY: 0.55, zoneAlpha: 0.06 },
    open:    { color: 0xff5252, scaleY: 1,    zoneAlpha: 0.15 }
};

export default class Eyes {
    constructor(scene, data) {
        this.scene = scene;
        this.data = data;
        this.state = 'closed'; // closed -> warning -> open -> closed...
        this.hitThisOpening = false; // yksi avautuminen voi osua vain kerran

        const z = data.zone;
        this.zoneRect = new Phaser.Geom.Rectangle(z.x, z.y, z.w, z.h); // näkymätön laatikko, jolla tarkistetaan onko pelaaja alueella

        // punainen sävy vahdittavan alueen päälle (alpha 0 = piilossa alussa)
        this.zone = scene.add.rectangle(z.x + z.w / 2, z.y + z.h / 2, z.w, z.h, 0xff0000);
        this.zone.setAlpha(0).setDepth(0);

        const whiteLeft = scene.add.ellipse(-22, 0, 34, 24, LOOKS.closed.color);
        const whiteRight = scene.add.ellipse(22, 0, 34, 24, LOOKS.closed.color);
        const pupilLeft = scene.add.circle(-22, 0, 6, 0x000000);
        const pupilRight = scene.add.circle(22, 0, 6, 0x000000);
        this.whites = [whiteLeft, whiteRight]; 

        // container yhdistää muodot yhdeksi, jolloin ne liikkuu ja skaalautuu yhdessä
        this.face = scene.add.container(data.x, data.y, [whiteLeft, whiteRight, pupilLeft, pupilRight]);
        this.face.setDepth(4);
        this.face.setScale(1, LOOKS.closed.scaleY); // litistetään kiinni olevan näköseks

        this.scheduleOpen(data.firstDelayMs); // aloitetaan ensimmäinen odotus
    }

    closedGap() { // random aika kuinka kauan silmät pysyy kiinni
        return Phaser.Math.Between(this.data.minClosedMs, this.data.maxClosedMs);
    }

    openTime() { // random aika kuinka kauan silmät pysyy auki, ettei rytmiä voi laskea
        return Phaser.Math.Between(this.data.minOpenMs, this.data.maxOpenMs);
    }

    scheduleOpen(delayMs) { // ajastin: kun aika kuluu, alkaa varoitus
        this.scene.time.delayedCall(delayMs, () => this.startWarning());
    }

    isBusy() { // true jos silmät ei ole kiinni, rush tarkistaa tän
        return this.state !== 'closed';
    }

    otherEyesBusy() { // true jos jokin toinen silmäpari varoittaa tai on auki
        return this.scene.eyes.some((e) => e !== this && e.isBusy());
    }

    startWarning() {
        if (this.scene.changingRoom) return; // jos huonetta vaihdetaan, ei tehdä mitään

        // rush tai toinen silmäpari on liikkeellä -> odotetaan hetki ja yritetään uudestaan
        if ((this.scene.rush && this.scene.rush.busy) || this.otherEyesBusy()) {
            this.scheduleOpen(Phaser.Math.Between(800, 1600));
            return;
        }

        this.state = 'warning';
        this.setLook('warning'); // silmät aukeaa puoliksi keltaisena
        if (!this.scene.hiding) { // ei poisteta "Hiding..." tekstiä jos pelaaja on kaapissa
            this.scene.showMessage(TEXTS.eyesWarning, this.data.warnMs);
        }
        this.scene.time.delayedCall(this.data.warnMs, () => this.open());
    }

    open() {
        if (this.scene.changingRoom) return;

        const openFor = this.openTime(); // arvotaan tämän avautumisen kesto

        this.state = 'open';
        this.hitThisOpening = false; // uusi avautuminen, voi osua taas kerran
        this.setLook('open'); // silmät auki punaisena
        if (!this.scene.hiding) {
            this.scene.showMessage(TEXTS.eyesOpen, openFor);
        }
        this.scene.time.delayedCall(openFor, () => this.close());
    }

    close() {
        this.state = 'closed';
        this.setLook('closed');
        if (!this.scene.changingRoom) { // huoneen vaihdossa kierto vain loppuu
            this.scheduleOpen(this.closedGap());
        }
    }

    setLook(state) { // vaihtaa silmien värin, aukioloasteen ja alueen sävyn tilan mukaan
        const look = LOOKS[state];
        this.whites.forEach((w) => w.setFillStyle(look.color));
        this.scene.tweens.add({ targets: this.face, scaleY: look.scaleY, duration: 200 }); // pehmeä avautuminen
        this.scene.tweens.add({ targets: this.zone, alpha: look.zoneAlpha, duration: 200 });
    }

    update() { // ajetaan joka framella
        if (this.state !== 'open' || this.hitThisOpening) return; // vain kun silmät on auki ja ei ole vielä osunut

        const s = this.scene;
        if (s.hiding) return; // kaapissa = turvassa
        if (!Phaser.Geom.Rectangle.Contains(this.zoneRect, s.player.x, s.player.y)) return; // pelaaja ei ole vahditulla alueella

        if (s.player.isTryingToMove()) { // liikkui silmien ollessa auki
            this.hitThisOpening = true;
            s.hurtPlayer('eyes'); // sama damage-funktio kuin rushilla ja screechillä
            s.showMessage(TEXTS.eyesSaw, 1200);
        }
    }
}