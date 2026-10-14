import { GAME_WIDTH, GAME_HEIGHT } from '../config.js';
import Player from '../entities/Player.js';

export default class RoomScene extends Phaser.Scene {
    constructor() {
        super('RoomScene');
    }

    create() {
        this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x2b2b2b);

        this.walls = this.physics.add.staticGroup();
        const t = 40;

        this.addWall(GAME_WIDTH / 2, t / 2, GAME_WIDTH, t);
        this.addWall(GAME_WIDTH / 2, GAME_HEIGHT - t / 2, GAME_WIDTH, t);
        this.addWall(t / 2, GAME_HEIGHT / 2, t, GAME_HEIGHT);
        this.addWall(GAME_WIDTH - t / 2, GAME_HEIGHT / 2, t, GAME_HEIGHT);

        this.addWall(640, 360, 300, 40);

        this.player = new Player(this, 160, 560);
        this.physics.add.collider(this.player, this.walls);

        this.add.text(60, 60, 'Room 1 (test) - move with WASD or arrow keys', {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#ffffff'
        });
    }

    addWall(x, y, width, height) {
        const wall = this.add.rectangle(x, y, width, height, 0x6d6d6d);
        this.walls.add(wall);
    }

    update() {
        this.player.update();
    }
}