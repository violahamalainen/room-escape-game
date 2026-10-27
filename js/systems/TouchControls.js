import { GAME_WIDTH, GAME_HEIGHT } from '../config.js';

const STICK_X = 190;                 // joystickin keskipiste ruudulla
const STICK_Y = GAME_HEIGHT - 150;
const STICK_RADIUS = 90;             // joystickin pohjan säde
const KNOB_RADIUS = 38;              // peukalon kohdan säde
const GRAB_RADIUS = 170;             // kuinka läheltä pohjaa sormi tarttuu joystickiin
const DEAD_ZONE = 0.22;              // osuus säteestä jonka sisällä ei liikuta (estää pienen sormen heilunnan)

const BUTTON_X = GAME_WIDTH - 150;   // HIDE-napin keskipiste
const BUTTON_Y = GAME_HEIGHT - 150;
const BUTTON_RADIUS = 70;

// true jos laite tukee kosketusta, tai osoitteessa on ?touch=1 (testaamiseen työpöydällä)
export function touchSupported() {
    const forced = new URLSearchParams(window.location.search).get('touch') === '1';
    return forced || navigator.maxTouchPoints > 0 || 'ontouchstart' in window;
}

// palauttaa kosketusohjaimet, tai null jos laite ei tue kosketusta
export function createTouchControls(scene) {
    return touchSupported() ? new TouchControls(scene) : null;
}

class TouchControls {
    constructor(scene) {
        this.scene = scene;
        this.direction = { x: 0, y: 0 }; // joystickin suunta, pituus 1 tai 0
        this.pointerId = null;           // minkä sormen joystick on ottanut, null = ei kukaan
        this.hideState = null;

        // joystick: pohja ja peukalon kohta
        this.base = scene.add.circle(STICK_X, STICK_Y, STICK_RADIUS, 0xffffff, 0.10)
            .setStrokeStyle(3, 0xffffff, 0.35).setDepth(35);
        this.knob = scene.add.circle(STICK_X, STICK_Y, KNOB_RADIUS, 0xffffff, 0.30).setDepth(36);

        // HIDE-nappi
        this.hideButton = scene.add.circle(BUTTON_X, BUTTON_Y, BUTTON_RADIUS, 0xffffff, 0.10)
            .setDepth(35).setInteractive();
        this.hideLabel = scene.add.text(BUTTON_X, BUTTON_Y, 'HIDE', {
            fontFamily: 'Arial', fontSize: '22px', fontStyle: 'bold', color: '#ffffff'
        }).setOrigin(0.5).setDepth(36);
        this.hideButton.on('pointerdown', () => scene.toggleHide()); // sama funktio kuin E-näppäimellä
        this.setHideState('off');

        scene.input.on('pointerdown', (pointer) => this.onDown(pointer));
        scene.input.on('pointermove', (pointer) => {
            if (pointer.id === this.pointerId) this.follow(pointer);
        });
        scene.input.on('pointerup', (pointer) => {
            if (pointer.id === this.pointerId) this.release();
        });
        scene.input.on('pointerupoutside', (pointer) => {
            if (pointer.id === this.pointerId) this.release();
        });
    }

    isActive() { // true kun joystickia työnnetään
        return this.direction.x !== 0 || this.direction.y !== 0;
    }

    onDown(pointer) { // sormi koskee ruutuun
        if (this.pointerId !== null) return; // joystick on jo yhden sormen käytössä
        if (Math.hypot(pointer.x - STICK_X, pointer.y - STICK_Y) > GRAB_RADIUS) return; // ei joystickin alueella
        this.pointerId = pointer.id;
        this.follow(pointer);
    }

    follow(pointer) { // peukalon kohta seuraa sormea, ja suunta lasketaan siitä
        const dx = pointer.x - STICK_X;
        const dy = pointer.y - STICK_Y;
        const len = Math.hypot(dx, dy);

        const shown = Math.min(len, STICK_RADIUS); // peukalon kohta ei mene pohjan ulkopuolelle
        const kx = len > 0 ? dx / len : 0;
        const ky = len > 0 ? dy / len : 0;
        this.knob.setPosition(STICK_X + kx * shown, STICK_Y + ky * shown);

        if (len / STICK_RADIUS < DEAD_ZONE) this.direction = { x: 0, y: 0 };
        else this.direction = { x: kx, y: ky };
    }

    release() { // sormi nousi: joystick palaa keskelle ja pelaaja pysähtyy
        this.pointerId = null;
        this.direction = { x: 0, y: 0 };
        this.knob.setPosition(STICK_X, STICK_Y);
    }

    setHideState(state) { // 'off' = ei laatikkoa lähellä, 'ready' = laatikon vieressä, 'out' = piilossa
        if (state === this.hideState) return; // ei tehdä mitään jos tila ei muutu
        this.hideState = state;

        const bright = state !== 'off';
        this.hideButton.setFillStyle(state === 'out' ? 0xffd54f : 0xffffff, bright ? 0.35 : 0.10);
        this.hideButton.setStrokeStyle(4, bright ? 0xffd54f : 0xffffff, bright ? 0.9 : 0.35);
        this.hideLabel.setText(state === 'out' ? 'COME OUT' : 'HIDE').setAlpha(bright ? 1 : 0.5);
    }
}