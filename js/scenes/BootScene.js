export default class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    create() {
        const tool = new URLSearchParams(window.location.search).get('tool'); // ?tool=picker tai ?tool=preview avaa kehitystyökalun
        if (tool === 'picker') this.scene.start('TilePickerScene');
        else if (tool === 'preview') this.scene.start('PreviewScene');
        else this.scene.start('MenuScene'); // peli alkaa valikosta
    }
}