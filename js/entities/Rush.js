import { GAME_WIDTH, GAME_HEIGHT } from '../config.js';
import { TEXTS } from '../data/texts.js';
import { playSfx } from '../systems/Audio.js';



const MIST_ALPHA = 0.8;     // kuinka musta sumu on 0=näkymätön 1=musta
const DARK_MIN = 0.25;      // huoneen pimeys sumun aikana vaihtelee
const DARK_MAX = 0.7;
const FADE_OUT_MS = 1800;   // kuinka hitaasti huone vaalenee sumun jälkeen
const HIT_WIDTH = 170;      // hitboxin leveys, sama kuin sumun "ydin"
const RUMBLE = 0.004;       // ruudun tärinän voimakkuus sumun aikana, 0 = ei tärise

function ensureMistTexture(scene) { // tekee pehmeän mustan pilven kuvan 
    if (scene.textures.exists('mistBlob')) return;

    const tex = scene.textures.createCanvas('mistBlob', 256, 256);
    const ctx = tex.getContext();
    const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    gradient.addColorStop(0, 'rgba(0, 0, 0, 1)');
    gradient.addColorStop(0.45, 'rgba(0, 0, 0, 0.55)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 256, 256);
    tex.refresh();
}

export default class Rush { // odota, varoita (kaks kertaa), hyökkää, odota...
    constructor(scene, settings) { // säilyttää scene ja room asetukset, luo overlayn ja sumun, aikatauluttaa ensimmäisen hyökkäyksen
        this.scene = scene;
        this.settings = settings;
        this.active = false; // kertoo onko rush liikkeellä vai ei
        this.hitThisPass = false; // vaan yks damage per hyökkäys
        this.flickerEvent = null; // vilkkumisen ajastin
        this.popEvent = null; // valojen välkkymisen ajastin

        this.overlay = scene.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000);
        this.overlay.setAlpha(0).setDepth(20);

        // sumu on monta päällekkäistä pehmeää mustaa pilveä samassa containerissa
        ensureMistTexture(scene);
        this.mist = scene.add.container(-600, GAME_HEIGHT / 2);
        this.mist.setDepth(10).setAlpha(MIST_ALPHA).setVisible(false);
        this.blobs = []; // sumun pää kohta
        this.wisps = []; // mini sumut

        [-70, 0, 70].forEach((x) => { // kolme pystysuoraa pilvee
            for (let y = -330; y <= 330; y += 66) {
                this.addBlob(
                    x + Phaser.Math.Between(-15, 15),
                    y + Phaser.Math.Between(-15, 15),
                    Phaser.Math.FloatBetween(1.0, 1.35), 0.55, this.blobs
                );
            }
        });
        for (let i = 0; i < 6; i++) {
            this.addBlob(0, Phaser.Math.Between(-300, 300), Phaser.Math.FloatBetween(0.6, 0.9), 0.35, this.wisps);
        }

        // näkymätön hitbox, seuraa sumua ja on koko huoneen korkunen
        this.body = scene.add.rectangle(-600, GAME_HEIGHT / 2, HIT_WIDTH, GAME_HEIGHT - 80, 0x000000);
        this.body.setVisible(false);

        this.scheduleNext(settings.firstDelayMs); // eka hyökkäys aikataulutetaan heti kun huone luotu
    }

    addBlob(x, y, scale, alpha, list) { 
        const blob = this.scene.add.image(x, y, 'mistBlob');
        blob.setScale(scale).setAlpha(alpha);
        blob.baseX = x;
        blob.baseY = y;
        blob.baseScale = scale;
        this.mist.add(blob); // siirtyy containerin sisään
        list.push(blob);
    }

    scheduleNext(delayMs) { // aikatauluttaa seuraavan yrityksen tietyn ajan kuluttua
        this.scene.time.delayedCall(delayMs, () => this.tryStart());
    }

    tryStart() { // alkaa vain jos director antaa luvan, muuten yritetään hetken päästä uudestaan
        if (this.scene.changingRoom) return;

        const director = this.scene.director;
        if (!director.canStart()) {
            this.scheduleNext(Phaser.Math.Between(800, 1600));
            return;
        }

        director.start('rush');
        this.startStage1();
    }

    startFlicker(delay, callback) { // lopettaa vanhan vilkkumisen ja aloittaa uuden
        this.stopFlicker();
        this.flickerEvent = this.scene.time.addEvent({ delay: delay, loop: true, callback: callback });
    }

    stopFlicker() { // pysäyttää vilkkumisen
        if (this.flickerEvent) this.flickerEvent.remove(false);
        this.flickerEvent = null;
    }

    startPops() { // valot välkkyy eli lyhyitä kirkkaita välähdyksiä satunnaisesti
        this.stopPops();
        this.popEvent = this.scene.time.addEvent({
            delay: 600,
            loop: true,
            callback: () => {
                if (Math.random() < 0.6) this.scene.cameras.main.flash(70, 255, 230, 170);
            }
        });
    }

    stopPops() {
        if (this.popEvent) this.popEvent.remove(false);
        this.popEvent = null;
    }

    startStage1() { // eka varoitus: hennompi vilkkuminen
        this.scene.tweens.killTweensOf(this.overlay); // pysäyttää edellisen hyökkäyksen hitaan vaalenemisen
        this.scene.showMessage(TEXTS.rushWarning1, this.settings.warn1Ms, { id: 'rushWarn1', max: 1, danger: true });

        this.startFlicker(140, () => {
            this.overlay.setAlpha(Math.random() < 0.35 ? Phaser.Math.FloatBetween(0.08, 0.22) : 0); // vain kolmasosa kerroista, ja heikosti
        });

        this.scene.time.delayedCall(this.settings.warn1Ms, () => this.startStage2());
    }

    startStage2() { // toka varoitus: agressiivinen vilkkuminen
        if (this.scene.changingRoom) return;

        this.scene.showMessage(TEXTS.rushWarning2, this.settings.warn2Ms, { id: 'rushWarn2', max: 2, danger: true });
        this.startFlicker(90, () => this.overlay.setAlpha(Phaser.Math.FloatBetween(0, 0.75)));
        this.startPops();
        playSfx(this.scene, 'rushWarn');

        this.scene.time.delayedCall(this.settings.warn2Ms, () => this.launch()); // hyökkäys alkaa kun toinen varoitus on ohi
    }

    resetMist(dir) { // palauttaa pilvet alkuasentoon ja käynnistää niiden aaltoilun
        this.wisps.forEach((w, i) => { // kaistaleet sumun perään, vastakkaiseen suuntaan kuin sumu kulkee
            w.baseX = -dir * (130 + i * 60);
            w.baseY = Phaser.Math.Between(-300, 300);
        });

        [...this.blobs, ...this.wisps].forEach((b) => {
            b.setPosition(b.baseX, b.baseY).setScale(b.baseScale);
            this.scene.tweens.add({ // jokainen pilvi aaltoilee omaan tahtiinsa
                targets: b,
                y: b.baseY + Phaser.Math.Between(-30, 30),
                scale: b.baseScale * Phaser.Math.FloatBetween(1.1, 1.3),
                duration: Phaser.Math.Between(350, 700),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        });
    }

    stopMist() { // pysäyttää pilvien aaltoilun ja piilottaa sumun
        [...this.blobs, ...this.wisps].forEach((b) => this.scene.tweens.killTweensOf(b));
        this.mist.setVisible(false);
    }

    launch() { 
        if (this.scene.changingRoom) return;

        const fromLeft = Math.random() < 0.5; // vasemmalta tai oikealta hyökkäys satunnaisesti
        const dir = fromLeft ? 1 : -1; // 1 = kulkee oikealle, -1 = vasemmalle
        const startX = fromLeft ? -450 : GAME_WIDTH + 450; // sumu alkaa kokonaan ruudun ulkopuolelta
        const endX = fromLeft ? GAME_WIDTH + 450 : -450;

        this.resetMist(dir);
        this.mist.setPosition(startX, GAME_HEIGHT / 2).setVisible(true);
        this.body.setPosition(startX, GAME_HEIGHT / 2);
        this.active = true;
        this.hitThisPass = false; 

        // huone pimenee ja valot vilkkuu koko sumun ajan
        this.startFlicker(70, () => this.overlay.setAlpha(Phaser.Math.FloatBetween(DARK_MIN, DARK_MAX)));

        const duration = (Math.abs(endX - startX) / this.settings.speed) * 1000; 
        this.scene.cameras.main.shake(duration, RUMBLE); // näyttö heiluu
        this.scene.tweens.add({ 
            targets: this.mist,
            x: endX,
            duration: duration,
            onComplete: () => this.finish() 
        });
    }

    finish() { 
        this.stopMist(); // hyökkäys on ohi, sumu pois
        this.active = false;
        this.stopFlicker();
        this.stopPops();

        // huone pysyy hetken pimeänä ja vaalenee sitten hitaasti
        this.scene.tweens.add({ targets: this.overlay, alpha: 0, duration: FADE_OUT_MS });

        this.scene.director.end(); // tapahtuma päättyi, hiljainen väli alkaa

        const gap = Phaser.Math.Between(this.settings.minGapMs, this.settings.maxGapMs); // seuraava yritys satunnaisen ajan kuluttua
        this.scheduleNext(gap); 
    }

    update() {   // tarkistetaan osuiko hyökkäys pelaajaan
        if (!this.active) return;

        this.body.x = this.mist.x; // hitbox seuraa sumua
        if (this.hitThisPass || this.scene.hiding) return; 

        const body = this.scene.player.body; // hitbox on jalkojen kohdalla, ei koko hahmokuva
        const playerBounds = new Phaser.Geom.Rectangle(body.x, body.y, body.width, body.height); 
        const rushBounds = this.body.getBounds(); 

        if (Phaser.Geom.Intersects.RectangleToRectangle(playerBounds, rushBounds)) { 
            this.hitThisPass = true;
            this.scene.hurtPlayer('rush'); // pelaaja ottaa damagee kun hyökkäys osuu häneen
        }
    }
}