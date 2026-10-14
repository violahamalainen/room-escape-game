import { GAME_WIDTH, GAME_HEIGHT } from '../config.js';
import { ROOMS } from '../data/rooms.js';
import Player from '../entities/Player.js';

const WALL = 40;

export default class RoomScene extends Phaser.Scene {
    constructor() {
        super('RoomScene');
    }

    init(data) { 
        this.roomIndex = (data && data.roomIndex) || 0; // kertoo mikä huone rakennetaan
        this.room = ROOMS[this.roomIndex]; // valitsee huoneen datan, jonka jälkeen create() rakentaa huoneen sen perusteella
        this.hasKey = false;
        this.changingRoom = false;
    }

    create() {
        this.cameras.main.fadeIn(500, 0, 0, 0);

        this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, this.room.floorColor);

        this.walls = this.physics.add.staticGroup();
        this.buildBorder();
        this.room.walls.forEach(([x, y, w, h]) => this.addWall(x, y, w, h));

        this.createDoor();
        this.createKey();

        this.player = new Player(this, this.room.playerStart.x, this.room.playerStart.y);

        this.hudText = this.add.text(20, 8, '', {
            fontFamily: 'Arial', fontSize: '22px', color: '#ffffff'
        });
        this.messageText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 20, '', {
            fontFamily: 'Arial', fontSize: '22px', color: '#ffd54f'
        }).setOrigin(0.5);
        this.updateHud();

        this.physics.add.collider(this.player, this.walls);
        this.physics.add.collider(this.player, this.door, () => this.onDoorTouched());
        this.physics.add.overlap(this.player, this.key, () => this.collectKey());
    }

    buildBorder() {
        const gapTop = this.room.door.y - this.room.door.height / 2;
        const gapBottom = this.room.door.y + this.room.door.height / 2;

        this.addWall(GAME_WIDTH / 2, WALL / 2, GAME_WIDTH, WALL);
        this.addWall(GAME_WIDTH / 2, GAME_HEIGHT - WALL / 2, GAME_WIDTH, WALL);
        this.addWall(WALL / 2, GAME_HEIGHT / 2, WALL, GAME_HEIGHT);

        this.addWall(GAME_WIDTH - WALL / 2, gapTop / 2, WALL, gapTop);
        this.addWall(GAME_WIDTH - WALL / 2, (gapBottom + GAME_HEIGHT) / 2, WALL, GAME_HEIGHT - gapBottom);
    }

    addWall(x, y, width, height) {
        const wall = this.add.rectangle(x, y, width, height, 0x6d6d6d);
        this.walls.add(wall);
    }

    createDoor() {
        const d = this.room.door;
        this.door = this.add.rectangle(GAME_WIDTH - WALL / 2, d.y, WALL, d.height, 0x8d6e63);
        this.physics.add.existing(this.door, true);
    }

    createKey() {
        const k = this.room.key;
        this.key = this.add.rectangle(k.x, k.y, 22, 22, 0xffd54f);
        this.physics.add.existing(this.key, true);
    }

    collectKey() {
        if (this.hasKey) return;
        this.hasKey = true;
        this.key.destroy();
        this.door.setFillStyle(0x66bb6a);
        this.updateHud();
        this.showMessage('You got the key!');
    }

    onDoorTouched() {
        if (this.changingRoom) return;

        if (!this.hasKey) {
            this.showMessage('The door is locked. Find the key!');
            return;
        }

        this.changingRoom = true;
        this.player.body.setVelocity(0, 0);

        // temporary: after the last room, loop back to room 1
        const next = (this.roomIndex + 1) % ROOMS.length;

        this.cameras.main.fadeOut(500, 0, 0, 0);
        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
            this.scene.restart({ roomIndex: next });
        });
    }

    updateHud() {
        this.hudText.setText(
            `Room ${this.roomIndex + 1} of ${ROOMS.length}    Key: ${this.hasKey ? 'yes' : 'no'}`
        );
    }

    showMessage(text) {
        this.messageText.setText(text);
        if (this.messageTimer) this.messageTimer.remove(false);
        this.messageTimer = this.time.delayedCall(1500, () => this.messageText.setText(''));
    }

    update() {
        if (this.changingRoom) return;
        this.player.update();
    }
}