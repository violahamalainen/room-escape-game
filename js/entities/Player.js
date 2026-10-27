import { PLAYER_SPEED, ART_SCALE } from '../config.js';
import { CHARACTERS, DEFAULT_CHARACTER } from '../data/characters.js';
import gameState from '../systems/GameState.js';

const FACES_RIGHT = true; // hahmokuva katsoo oikealle, jos hahmo kävelee takaperin vaihda tämä false
const BODY_SIZE = 16;     // hitboxin sivu kuvan pikseleinä, 16 x ART_SCALE (2) = 32 ruudulla

export default class Player extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y) {
        const wanted = gameState.character || DEFAULT_CHARACTER; // valittu hahmo, nyt oletus: velho
        const info = CHARACTERS.find((c) => c.name === wanted) || CHARACTERS[0];
        super(scene, x, y, 'dungeonSheet', `${info.name}_idle_0`);

        this.charName = info.name;
        this.moving = false; // juoksuanimaatio päällä vai ei

        this.cursors = scene.input.keyboard.createCursorKeys();
        this.keys = scene.input.keyboard.addKeys('W,A,S,D');

        const h = info.h || 28; // hahmon korkeus kuvassa
        this.setOrigin(0.5, (h - BODY_SIZE / 2) / h); // hahmon paikka (x, y) on jalkojen hitboxin keskellä
        this.setScale(ART_SCALE);
        this.setDepth(4); // seinien (1) ja soihtujen (2) päällä, kaapin tekstin (5) alla

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.body.setSize(BODY_SIZE, BODY_SIZE, false); // hitbox vain jalkojen kohdalle
        this.body.setOffset(0, h - BODY_SIZE);          // laatikko kuvan alareunaan

        this.play(`${this.charName}_idle`);
    }

    update() { // ajetaan joka framella: lukee näppäimet, liikuttaa ja vaihtaa animaation
        let dx = 0;
        let dy = 0;

        if (this.cursors.left.isDown || this.keys.A.isDown) dx -= 1;
        if (this.cursors.right.isDown || this.keys.D.isDown) dx += 1;
        if (this.cursors.up.isDown || this.keys.W.isDown) dy -= 1;
        if (this.cursors.down.isDown || this.keys.S.isDown) dy += 1;

        const touch = this.scene.touch; // joystick korvaa näppäimet kun sitä työnnetään
        if (touch && touch.isActive()) {
            dx = touch.direction.x;
            dy = touch.direction.y;
        }

        const direction = new Phaser.Math.Vector2(dx, dy).normalize().scale(PLAYER_SPEED);
        this.body.setVelocity(direction.x, direction.y);

        if (Math.abs(dx) > 0.25) this.setFlipX(FACES_RIGHT ? dx < 0 : dx > 0); // käännetään kuva kulkusuuntaan, pieni heilunta ei käännä
        this.setMoving(dx !== 0 || dy !== 0);
    }

    setMoving(moving) { // vaihtaa animaation vaan kun liikkuminen alkaa tai loppuu
        if (moving === this.moving) return;
        this.moving = moving;
        this.play(`${this.charName}_${moving ? 'run' : 'idle'}`);
    }

    freeze() { // pysäyttää hahmon ja vaihtaa seisomisanimaatioon esim kun huone vaihtuu
        this.body.setVelocity(0, 0);
        this.setMoving(false);
    }

    isTryingToMove() { // true jos jotain liikkumisnäppäintä painetaan, vaikka pelaaja olisi seinää vasten
        return this.cursors.left.isDown || this.cursors.right.isDown
            || this.cursors.up.isDown || this.cursors.down.isDown
            || this.keys.A.isDown || this.keys.D.isDown
            || this.keys.W.isDown || this.keys.S.isDown
            || (this.scene.touch && this.scene.touch.isActive()); // joystickin työntäminen on liikkumista, joten silmät näkee sen
    }
}