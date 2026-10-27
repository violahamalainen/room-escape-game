import { ART_SCALE } from '../config.js';

// laatikko, jonka sisään pelaaja voi piiloutua
export default class Closet {
    constructor(scene, x, y) {
        this.x = x;
        this.y = y;

        this.crate = scene.add.image(x, y, 'dungeonSheet', 'crate'); // laatikon kuva 0x72 art packistä
        this.crate.setScale(ART_SCALE).setDepth(2);

        const above = y > 120; // ylhäällä seinän vieressä olevan laatikon teksti tulee laatikon alapuolelle
        this.prompt = scene.add.text(x, above ? y - 46 : y + 46, 'E: hide', {
            fontFamily: 'Arial', fontSize: '20px', color: '#ffd54f'
        }).setOrigin(0.5).setDepth(5).setVisible(false);
    }

    isNear(player) { // true jos pelaaja on tarpeeksi lähellä laatikkoa
        return Phaser.Math.Distance.Between(player.x, player.y, this.x, this.y) < 70;
    }

    setPrompt(text, visible) { // vaihtaa laatikon päällä olevan tekstin ("E: hide" tai "E: come out") ja näyttää tai piilottaa sen
        this.prompt.setText(text);
        this.prompt.setVisible(visible);
    }
}