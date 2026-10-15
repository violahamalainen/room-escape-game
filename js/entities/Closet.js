export default class Closet {
    constructor(scene, x, y) { 
        this.x = x; // kaapin sijainti
        this.y = y; 

        this.shape = scene.add.rectangle(x, y, 56, 90, 0x4e342e);
        this.shape.setStrokeStyle(3, 0x8d6e63); 

        this.prompt = scene.add.text(x, y - 65, 'E: hide', { // kun pelaaja on tarpeeksi lähellä kaappia, hän näkee tekstin, että voi piiloutua
            fontFamily: 'Arial', fontSize: '20px', color: '#ffd54f'
        }).setOrigin(0.5).setDepth(5).setVisible(false); 
    }

    isNear(player) {
        return Phaser.Math.Distance.Between(player.x, player.y, this.x, this.y) < 70; // onko pelaaja tarpeeksi lähellä kaappia?
    }

    setPromptVisible(visible) { // näytetään tai piilotetaan teksti
        this.prompt.setVisible(visible);
    }
}