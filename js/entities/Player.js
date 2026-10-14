import { PLAYER_SPEED } from '../config.js';

export default class Player extends Phaser.GameObjects.Rectangle {
    constructor(scene, x, y) {
        super(scene, x, y, 32, 32, 0x4fc3f7);

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.cursors = scene.input.keyboard.createCursorKeys();
        this.keys = scene.input.keyboard.addKeys('W,A,S,D');
    }

    update() {
        let dx = 0;
        let dy = 0;

        if (this.cursors.left.isDown || this.keys.A.isDown) dx -= 1;
        if (this.cursors.right.isDown || this.keys.D.isDown) dx += 1;
        if (this.cursors.up.isDown || this.keys.W.isDown) dy -= 1;
        if (this.cursors.down.isDown || this.keys.S.isDown) dy += 1;

        const direction = new Phaser.Math.Vector2(dx, dy).normalize().scale(PLAYER_SPEED);
        this.body.setVelocity(direction.x, direction.y);
    }
}