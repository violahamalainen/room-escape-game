export default class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    create() {
        this.scene.start('RoomScene');
    }
}
// lataa kuvii ja äänii ja muit kamoi täällä

