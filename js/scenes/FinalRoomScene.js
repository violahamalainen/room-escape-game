import { GAME_WIDTH, GAME_HEIGHT } from '../config.js';
import { ROOMS } from '../data/rooms.js';
import { PUZZLE } from '../data/puzzle.js';
import gameState from '../systems/GameState.js';
import { formatTime } from '../systems/UI.js';
import { buildFloor, paintWall, addDecor, buildWallBlock } from '../systems/Art.js';
import { playSfx, playMusic, prefetchMusic } from '../systems/Audio.js';


const SLOT_X = [400, 560, 720, 880]; // sockets ja tray käyttää samoja x-paikkoja
const SOCKET_Y = 390;
const TRAY_Y = 590;
const WALL_START = 40;      // seinän sisäreuna alussa
const WALL_TRAVEL = 210;    // kuinka paljon seinät liikkuu sisäänpäin
const WALL_W = 300;         // liikkuvan seinän leveys
const FLICKER_FROM = 30000; // vilkkuminen alkaa kun aikaa on alle 30 s

export default class FinalRoomScene extends Phaser.Scene {
    constructor() {
        super('FinalRoomScene');
    }

    init() { // kaikki nollataan tässä, koska sama scene-olio käytetään uudelleen
        this.timeLeft = PUZZLE.timeLimitMs;
        this.finished = false; // voitto tai häviö -> mikään ei enää toimi
        this.busy = false; // true kun väärän flaskin palautusanimaatio on käynnissä
        this.selected = null; // tarjottimelta valittu flask
        this.placedCount = 0;
        this.notesOpen = true;
        this.flickerTimer = 0;
        this.pulsing = false;
        this.messageTimer = null;
    }

    create() {
        this.cameras.main.fadeIn(700, 0, 0, 0);
          playMusic(this, 'final');
          prefetchMusic(this, 'win'); // voittomusiikki ladataan valmiiksi
        gameState.startClock(); // kello käy vain kun pelaaja on huoneessa
        this.events.once('shutdown', () => gameState.stopClock()); // kello pysähtyy kun scene päättyy

        buildFloor(this, 0x1e1a24); // kivilattia tummalla sävyllä
        paintWall(this, GAME_WIDTH / 2, 20, GAME_WIDTH, 40);                // yläseinä
        paintWall(this, GAME_WIDTH / 2, GAME_HEIGHT - 20, GAME_WIDTH, 40); // alaseinä
        addDecor(this); // soihdut ja kynttilät

        // seinät jotka liikkuu sisäänpäin ajan kuluessa, koottu kuvapaloista
        this.leftWall = buildWallBlock(this, WALL_W, GAME_HEIGHT, 5);
        this.rightWall = buildWallBlock(this, WALL_W, GAME_HEIGHT, 5);
        this.updateWalls(); // asettaa seinät alkupaikalleen

        // vilkkuva musta peitto, näkyy vasta kun aikaa on vähän
        this.overlay = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000)
            .setAlpha(0).setDepth(20);

        this.createSockets();
        this.createItems();
        this.createNotesPanel();

        this.timerText = this.add.text(GAME_WIDTH / 2, 30, '', {
            fontFamily: 'Arial', fontSize: '36px', color: '#ffffff'
        }).setOrigin(0.5).setDepth(50);
        this.updateTimerText();

        this.messageText = this.add.text(GAME_WIDTH / 2, 682, '', {
            fontFamily: 'Arial', fontSize: '22px', color: '#ffd54f'
        }).setOrigin(0.5).setDepth(50);
        this.showMessage('Click a flask, then click a socket.', 6000);
    }

    // -----------------------------------------------------------
    //                      HUONEEN RAKENNUS
    // -----------------------------------------------------------

    createSockets() { // neljä sockettia numeroituna vasemmalta oikealle
        this.sockets = SLOT_X.map((x, i) => {
            const rect = this.add.rectangle(x, SOCKET_Y, 110, 110, 0x2a2433);
            rect.setStrokeStyle(3, 0x8d8d8d);
            rect.setInteractive({ useHandCursor: true });
            rect.on('pointerdown', () => this.onSocketClicked(i));

            this.add.text(x, SOCKET_Y + 80, String(i + 1), {
                fontFamily: 'Arial', fontSize: '26px', color: '#bbbbbb'
            }).setOrigin(0.5);

            return { x, y: SOCKET_Y, rect, filled: false };
        });
    }

    createItems() { // tarjottimelle tulee kaikkien huoneiden flaskit, jokaisella värin nimi
        this.items = ROOMS.filter((r) => r.object).map((room, i) => {
            const data = room.object;
            const x = SLOT_X[i];

            const plate = this.add.rectangle(0, 0, 100, 100, 0x2a2433);
            plate.setStrokeStyle(2, 0x6d6d6d);
            const flask = this.add.image(0, -10, 'dungeonSheet', `flask_big_${data.flask}`).setScale(3);
            const label = this.add.text(0, 32, data.flask, { // värin nimi
                fontFamily: 'Arial', fontSize: '20px', color: '#ffffff'
            }).setOrigin(0.5);

            // container yhdistää alustan, flaskin ja nimen, ja antaa niille yhteisen klikkausalueen
            const container = this.add.container(x, TRAY_Y, [plate, flask, label]);
            container.setSize(100, 100).setDepth(10);
            container.setInteractive({ useHandCursor: true });

            const item = { flask: data.flask, container, plate, placed: false };
            container.on('pointerdown', () => this.onItemClicked(item));
            return item;
        });
    }

    createNotesPanel() { // vihjepaneeli ylhäällä, sisältö tulee huoneiden notes-teksteistä
        this.notesBg = this.add.rectangle(GAME_WIDTH / 2, 170, 760, 220, 0x000000, 0.92);
        this.notesBg.setStrokeStyle(3, 0xf5f0dc).setDepth(40);

        const clues = ROOMS.filter((r) => r.note).map((r, i) => `${i + 1}. ${r.note.text}`);
        this.notesText = this.add.text(GAME_WIDTH / 2, 170, ['CLUES', '', ...clues].join('\n'), {
            fontFamily: 'Arial', fontSize: '22px', color: '#f5f0dc', wordWrap: { width: 720 }, lineSpacing: 6
        }).setOrigin(0.5).setDepth(41);
    }

    // -----------------------------------------------------------
    //                      PELAAJAN TOIMINNOT
    // -----------------------------------------------------------


    deselect() { // poistaa valinnan ja palauttaa alustan reunan normaaliksi
        if (this.selected) {
            this.selected.plate.setStrokeStyle(2, 0x6d6d6d);
            this.selected = null;
        }
    }

    onItemClicked(item) {
        if (this.finished || this.busy || item.placed) return;

        if (this.selected === item) { // toinen klikkaus samaan flaskiin peruu valinnan
            this.deselect();
            return;
        }

        this.deselect();
        this.selected = item;
        item.plate.setStrokeStyle(4, 0xffd54f); // keltainen reuna = valittu
    }

    onSocketClicked(index) {
        if (this.finished || this.busy || !this.selected) return;

        const socket = this.sockets[index];
        if (socket.filled) return;

        const item = this.selected;
        this.deselect();

        if (item.flask === PUZZLE.order[index]) { // oikea pullo oikeaan paikkaan
            item.placed = true;
            socket.filled = true;
            this.placedCount += 1;
            playSfx(this, 'placeOk');

            item.plate.setStrokeStyle(3, 0x66bb6a);
            socket.rect.setStrokeStyle(3, 0x66bb6a);
            this.tweens.add({ targets: item.container, x: socket.x, y: socket.y, duration: 200 });

            if (this.placedCount === this.items.length) this.win();
        } else { // väärä: flask käy socketissa ja pomppaa takaisin, aikaa menee
            this.busy = true;
            playSfx(this, 'placeWrong');
            this.timeLeft -= PUZZLE.penaltyMs;
            this.cameras.main.shake(150, 0.006);
            this.showMessage(`Wrong! -${PUZZLE.penaltyMs / 1000} seconds`, 1800);

            socket.rect.setStrokeStyle(4, 0xff5252);
            item.plate.setStrokeStyle(4, 0xff5252);

            this.tweens.add({
                targets: item.container,
                x: socket.x, y: socket.y,
                duration: 150, hold: 300, yoyo: true, // menee sockettiin, odottaa, palaa takaisin
                onComplete: () => {
                    socket.rect.setStrokeStyle(3, 0x8d8d8d);
                    item.plate.setStrokeStyle(2, 0x6d6d6d);
                    this.busy = false;
                }
            });
        }
    }

    // -----------------------------------------------------------
    //                      VOITTO JA HÄVIÖ
    // -----------------------------------------------------------

    win() { // peli päättyy: kello pysäytetään, häivytetään voittoruutuun
        this.finished = true;
        playSfx(this, 'win');
        this.overlay.setAlpha(0);
        const seconds = gameState.elapsedSeconds(); // tämä on lopullinen peliaika
        this.cameras.main.flash(500, 255, 255, 255);

        this.time.delayedCall(900, () => {
            this.cameras.main.fadeOut(700, 0, 0, 0);
            this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
                this.scene.start('OutroScene', { seconds });
            });
        });
    }

    timeUp() { // aika loppui -> game over, uusi yritys alkaa huoneesta 1
        this.finished = true;
        this.overlay.setAlpha(0);
        this.showMessage('Time is up!', 0);

        this.cameras.main.fadeOut(800, 0, 0, 0);
        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
            this.scene.start('GameOverScene', { roomIndex: ROOMS.length, cause: 'time' }); // näytetään "Room 5"
        });
    }

    // -----------------------------------------------------------
    //                      TEKSTIT JA PAINE
    // -----------------------------------------------------------

    showMessage(text, duration = 1500) {
        this.messageText.setText(text);
        if (this.messageTimer) this.messageTimer.remove(false);
        if (duration > 0) {
            this.messageTimer = this.time.delayedCall(duration, () => this.messageText.setText(''));
        }
    }

    updateTimerText() {
        const seconds = Math.ceil(this.timeLeft / 1000);
        this.timerText.setText(formatTime(seconds));

        if (seconds <= 20 && !this.pulsing) { // alle 20 s: punainen ja sykkivä
            this.pulsing = true;
            this.timerText.setColor('#ff5252');
            this.tweens.add({ targets: this.timerText, scale: 1.2, duration: 400, yoyo: true, repeat: -1 });
        }
    }

    updateWalls() { // mitä vähemmän aikaa, sitä lähempänä seinät on
        const progress = Phaser.Math.Clamp(1 - this.timeLeft / PUZZLE.timeLimitMs, 0, 1);
        this.leftWall.x = WALL_START - WALL_W + progress * WALL_TRAVEL;      // oikea reuna = WALL_START + liike
        this.rightWall.x = GAME_WIDTH - WALL_START - progress * WALL_TRAVEL; // vasen reuna
    }

    updateFlicker(delta) { // vilkkuu 10 kertaa sekunnissa, voimakkaammin loppua kohti
        if (this.timeLeft > FLICKER_FROM) return;

        this.flickerTimer -= delta;
        if (this.flickerTimer > 0) return;
        this.flickerTimer = 100;

        const strength = 0.55 * (1 - this.timeLeft / FLICKER_FROM);
        this.overlay.setAlpha(Phaser.Math.FloatBetween(0, strength));
    }

    update(time, delta) { // delta = kuinka monta millisekuntia edellisestä framesta on kulunut
        if (this.finished) return;

        this.timeLeft -= delta;
        if (this.timeLeft <= 0) {
            this.timeLeft = 0;
            this.updateTimerText();
            this.timeUp();
            return;
        }

        this.updateTimerText();
        this.updateWalls();
        this.updateFlicker(delta);
    }
}