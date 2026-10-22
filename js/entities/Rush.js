import { GAME_WIDTH, GAME_HEIGHT } from '../config.js';

export default class Rush { // odota, varota, hyökkää, odota...
    constructor(scene, settings) { // säilyttää scene ja room asetukset, luo hyökkäyksen overlayn ja rungon, aikatauluttaa ensimmäisen hyökkäyksen
        this.scene = scene;
        this.settings = settings;
        this.active = false; // kertoo onko rush liikkeellä vai ei
        this.hitThisPass = false; // vaan yks damage per hyökkäys
        this.busy = false; // true, kun rush vilkkuu tai on liikkeellä

        this.overlay = scene.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000);
        this.overlay.setAlpha(0).setDepth(20);

        this.body = scene.add.rectangle(-200, GAME_HEIGHT / 2, 90, GAME_HEIGHT - 80, 0xcfd8dc, 0.85); // itse rush, liikkuu vaakasuunnassa
        this.body.setDepth(10).setVisible(false); 

        this.scheduleNext(settings.firstDelayMs); // eka hyökkäys aikataulutetaan heti kun huone luotu
    }

    scheduleNext(delayMs) { // aikatauluttaa seuraavan hyökkäyksen tietyn ajan kuluttua
        this.scene.time.delayedCall(delayMs, () => this.startWarning());
    }

    startWarning() { 
        if (this.scene.changingRoom) return; // jos huone vaihtuu, ei hyökkäystä aloiteta
        if (this.scene.eyesBusy()) { // silmät on auki tai varoittaa -> rush odottaa sekunnin ja yrittää uudestaan
            this.scheduleNext(1000);
            return;
        }
        this.busy = true; // rush alkaa, silmät ei saa nyt avautua

        this.scene.showMessage('The lights flicker... hide! (E)', this.settings.warningMs);

        this.flickerEvent = this.scene.time.addEvent({ 
            delay: 90, 
            repeat: Math.floor(this.settings.warningMs / 90), 
            callback: () => this.overlay.setAlpha(Phaser.Math.FloatBetween(0, 0.75)) 
        });

        this.scene.time.delayedCall(this.settings.warningMs, () => this.launch()); // hyökkäys alkaa kun varoitus on ohi
    }

    launch() { 
        if (this.scene.changingRoom) return;

        if (this.flickerEvent) this.flickerEvent.remove(false); // lopeta vilkkuminen kun hyökkäys alkaa
        this.overlay.setAlpha(0);

        const fromLeft = Math.random() < 0.5; // vasemmalta ti oikeata hyökkäys satunnaisesti
        const startX = fromLeft ? -100 : GAME_WIDTH + 100; 
        const endX = fromLeft ? GAME_WIDTH + 100 : -100;

        this.body.setPosition(startX, GAME_HEIGHT / 2).setVisible(true); 
        this.active = true;
        this.hitThisPass = false; 

        const duration = (Math.abs(endX - startX) / this.settings.speed) * 1000; 
        this.scene.tweens.add({ 
            targets: this.body,
            x: endX,
            duration: duration,
            onComplete: () => this.finish() 
        });
    }

    finish() { 
        this.body.setVisible(false); // hyökkäys on ohi, piilotetaan se
        this.active = false;
        this.busy = false; // rush ohi, silmät saa avautua

        if (this.scene.hiding) { // poista nääki paskat
            this.scene.showMessage('It has passed. Press E to come out.', 0);
        }

        const gap = Phaser.Math.Between(this.settings.minGapMs, this.settings.maxGapMs); // seuraava hyökkäys aikataulutetaan satunnaisen ajan kuluttua
        this.scheduleNext(gap); 
    }

    update() {   // tarkistetaan osuiko hyökkäys pelaajaan
        if (!this.active || this.hitThisPass || this.scene.hiding) return; 

        const playerBounds = this.scene.player.getBounds(); 
        const rushBounds = this.body.getBounds(); 

        if (Phaser.Geom.Intersects.RectangleToRectangle(playerBounds, rushBounds)) { 
            this.hitThisPass = true;
            this.scene.hurtPlayer(); // pelaaja ottaa damagee kun hyökkäys osuu häneen
        }
    }
}