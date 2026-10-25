import { GAME_WIDTH, GAME_HEIGHT } from '../config.js';
import { ART } from '../data/art.js';

// kehitystyökalu: pieni testihuone, jossa Szadin ja 0x72:n kuvat ovat yhdessä
// avataan osoitteella index.html?tool=preview

const SHEET72 = 'dungeonSheet';
const WALL = 64;    // seinän paksuus testihuoneessa
const SPEED = 170;  // pelaajan nopeus testihuoneessa
const PLAYER_SCALES = [2, 3];
const SZADI_SCALES = [1, 2, 3];

// Szadin erilliset kuvatiedostot (torch ja candle ovat animaatioita)
const TORCH = ['torch_1', 'torch_2', 'torch_3', 'torch_4'];
const CANDLE_A = ['candleA_01', 'candleA_02', 'candleA_03', 'candleA_04'];
const CANDLE_B = ['candleB_01', 'candleB_02', 'candleB_03', 'candleB_04'];

// 0x72:n ruutujen paikat tiedostosta tile_list_v1.7: nimi: [x, y, leveys, korkeus]
const FRAMES_72 = {
    floor: [16, 64, 16, 16],
    wall: [32, 16, 16, 16],
    crate: [288, 408, 16, 24],
    chest: [304, 416, 16, 16],
    skull: [288, 432, 16, 16],
    flask_big_blue: [304, 336, 16, 16],
    flask_big_red: [288, 336, 16, 16],
    flask_big_green: [320, 336, 16, 16],
    flask_big_yellow: [336, 336, 16, 16],
    heart_full: [289, 370, 13, 12]
};

// hahmot: nimi ja rivin y-koordinaatti, jokaisella 4 idle-kuvaa (x alkaa 128) ja 4 run-kuvaa (x alkaa 192)
const CHARACTERS = [
    { name: 'elf_f', y: 4 }, { name: 'elf_m', y: 36 },
    { name: 'knight_f', y: 68 }, { name: 'knight_m', y: 100 },
    { name: 'wizard_f', y: 132 }, { name: 'wizard_m', y: 164 },
    { name: 'lizard_f', y: 196 }, { name: 'lizard_m', y: 228 },
    { name: 'dwarf_f', y: 260 }, { name: 'dwarf_m', y: 292 },
    { name: 'doc', y: 345, x: 368, runX: 432, h: 23 } // tohtori: eri kohdassa kuvaa ja 23 px korkea
];

export default class PreviewScene extends Phaser.Scene {
    constructor() {
        super('PreviewScene');
    }

    preload() {
        this.load.image('szadiMain', 'assets/images/catacombs/mainlevbuild.png');
        this.load.image('szadiDeco', 'assets/images/catacombs/decorative.png');
        this.load.image(SHEET72, 'assets/images/dungeon/0x72_DungeonTilesetII_v1.7.png');
        [...TORCH, ...CANDLE_A, ...CANDLE_B].forEach((name) => {
            this.load.image(name, `assets/images/catacombs/${name}.png`);
        });
    }

    init(data) { // P, C ja Z käynnistävät scenen uudestaan ja kertovat valinnat tässä
        this.playerScaleIndex = (data && data.playerScaleIndex) || 0;
        this.szadiScaleIndex = (data && data.szadiScaleIndex) || 0;
        this.charIndex = (data && data.charIndex) || 0;
        this.moving = false;
    }

    create() {
        ['szadiMain', 'szadiDeco', SHEET72, ...TORCH, ...CANDLE_A, ...CANDLE_B].forEach((key) => {
            this.textures.get(key).setFilter(Phaser.Textures.FilterMode.NEAREST); // terävät pikselit
        });

        this.szScale = SZADI_SCALES[this.szadiScaleIndex];
        this.playerScale = PLAYER_SCALES[this.playerScaleIndex];

        this.registerFrames();
        this.buildRoom();
        this.buildProps();
        this.buildPlayer();
        this.buildHud();

        this.input.keyboard.on('keydown-P', () => this.restartWith({ playerScaleIndex: (this.playerScaleIndex + 1) % PLAYER_SCALES.length }));
        this.input.keyboard.on('keydown-C', () => this.restartWith({ charIndex: (this.charIndex + 1) % CHARACTERS.length }));
        this.input.keyboard.on('keydown-Z', () => this.restartWith({ szadiScaleIndex: (this.szadiScaleIndex + 1) % SZADI_SCALES.length }));
    }

    restartWith(change) { // käynnistää scenen uudestaan yhdellä muutetulla valinnalla
        this.scene.restart({
            playerScaleIndex: this.playerScaleIndex,
            szadiScaleIndex: this.szadiScaleIndex,
            charIndex: this.charIndex,
            ...change
        });
    }

    // ---------- kuvien nimeäminen ja animaatiot ----------

    registerFrames() { // antaa kuvan paloille nimet, jotta niitä voi käyttää nimellä
        const t72 = this.textures.get(SHEET72);
        Object.entries(FRAMES_72).forEach(([name, [x, y, w, h]]) => t72.add(name, 0, x, y, w, h));

        CHARACTERS.forEach((c) => {
            for (let i = 0; i < 4; i++) {
                t72.add(`${c.name}_idle_${i}`, 0, (c.x || 128) + i * 16, c.y, 16, c.h || 28);
                t72.add(`${c.name}_run_${i}`, 0, (c.runX || 192) + i * 16, c.y, 16, c.h || 28);
            }
            ['idle', 'run'].forEach((kind) => {
                const key = `${c.name}_${kind}`;
                if (this.anims.exists(key)) return; // animaatio tehdään vain kerran
                this.anims.create({
                    key,
                    frames: [0, 1, 2, 3].map((i) => ({ key: SHEET72, frame: `${c.name}_${kind}_${i}` })),
                    frameRate: kind === 'idle' ? 6 : 10,
                    repeat: -1
                });
            });
        });

        this.makeAnim('torch', TORCH, 8);
        this.makeAnim('candleA', CANDLE_A, 6);
        this.makeAnim('candleB', CANDLE_B, 6);

        // Szadin palat jotka on valittu art.js-tiedostoon
        if (ART.szadiFloor) this.addCut('szadiFloor', { sheet: 'szadiMain', ...ART.szadiFloor });
        if (ART.szadiWall) this.addCut('szadiWall', { sheet: 'szadiMain', ...ART.szadiWall });
        ART.szadiProps.forEach((p, i) => this.addCut(`szadiProp_${i}`, p));
    }

    makeAnim(key, textureKeys, frameRate) { // animaatio erillisistä kuvatiedostoista
        if (this.anims.exists(key)) return;
        this.anims.create({ key, frames: textureKeys.map((k) => ({ key: k })), frameRate, repeat: -1 });
    }

    addCut(name, cut) { // lisää Szadin kuvaan nimetyn palan: cut = { sheet, x, y, w, h }
        this.textures.get(cut.sheet || 'szadiMain').add(name, 0, cut.x, cut.y, cut.w, cut.h);
    }

    // ---------- huoneen rakennus ----------

    fillArea(style, x, y, w, h, depth) { // täyttää alueen toistamalla yhtä ruutua, reunaruudut leikataan sopiviksi
        const frame = this.textures.getFrame(style.tex, style.frame);
        const tw = frame.width * style.scale;
        const th = frame.height * style.scale;

        for (let yy = y; yy < y + h; yy += th) {
            for (let xx = x; xx < x + w; xx += tw) {
                const img = this.add.image(xx, yy, style.tex, style.frame).setOrigin(0, 0).setScale(style.scale).setDepth(depth);
                const cropW = Math.min(tw, x + w - xx); // viimeinen ruutu voi olla leikattava
                const cropH = Math.min(th, y + h - yy);
                if (cropW < tw || cropH < th) img.setCrop(0, 0, cropW / style.scale, cropH / style.scale);
            }
        }
    }

    buildRoom() { // lattia ja neljä seinää, Szadin ruudut jos ne on valittu, muuten 0x72
        const floor = ART.szadiFloor
            ? { tex: 'szadiMain', frame: 'szadiFloor', scale: this.szScale }
            : { tex: SHEET72, frame: 'floor', scale: 2 };
        const wall = ART.szadiWall
            ? { tex: 'szadiMain', frame: 'szadiWall', scale: this.szScale }
            : { tex: SHEET72, frame: 'wall', scale: 2 };

        this.fillArea(floor, 0, 0, GAME_WIDTH, GAME_HEIGHT, 0);
        this.fillArea(wall, 0, 0, GAME_WIDTH, WALL, 1);                                   // yläseinä
        this.fillArea(wall, 0, GAME_HEIGHT - WALL, GAME_WIDTH, WALL, 1);                  // alaseinä
        this.fillArea(wall, 0, WALL, WALL, GAME_HEIGHT - 2 * WALL, 1);                    // vasen seinä
        this.fillArea(wall, GAME_WIDTH - WALL, WALL, WALL, GAME_HEIGHT - 2 * WALL, 1);    // oikea seinä

        [320, 640, 960].forEach((x) => { // soihdut yläseinällä
            this.add.sprite(x, 40, 'torch_1').setScale(this.szScale).setDepth(4).play('torch');
        });
        this.add.sprite(200, 180, 'candleA_01').setScale(this.szScale).setDepth(3).play('candleA');
        this.add.sprite(1080, 520, 'candleB_01').setScale(this.szScale).setDepth(3).play('candleB');
    }

    buildProps() { // esineitä riveissä: 0x72:n omat alhaalla, Szadin valitut ylhäällä
        const row72 = [['crate', 200], ['chest', 290], ['skull', 370],
            ['flask_big_blue', 460], ['flask_big_red', 530], ['flask_big_green', 600], ['flask_big_yellow', 670]];
        row72.forEach(([frame, x]) => this.add.image(x, 540, SHEET72, frame).setScale(2).setDepth(3));

        let px = 160;
        ART.szadiProps.forEach((p, i) => {
            this.add.image(px, 250, p.sheet || 'szadiMain', `szadiProp_${i}`).setScale(this.szScale).setDepth(3);
            px += Math.max(120, p.w * this.szScale + 30);
        });

        for (let i = 0; i < 3; i++) { // sydämet oikeaan yläkulmaan
            this.add.image(GAME_WIDTH - 40 - i * 36, 32, SHEET72, 'heart_full').setScale(2).setDepth(10);
        }
    }

    buildPlayer() {
        const ch = CHARACTERS[this.charIndex];
        this.charName = ch.name;
        this.charHeight = ch.h || 28; // hahmon korkeus pikseleinä, tohtori on matalampi
        this.player = this.add.sprite(GAME_WIDTH / 2, GAME_HEIGHT / 2, SHEET72, `${ch.name}_idle_0`);
        this.player.setScale(this.playerScale).setDepth(5).play(`${ch.name}_idle`);

        this.cursors = this.input.keyboard.createCursorKeys();
        this.keys = this.input.keyboard.addKeys('W,A,S,D');
    }

    buildHud() {
        const lines = [
            'WASD / arrows: move     P: player size     C: character     Z: Szadi tile scale',
            `character: ${this.charName} x${this.playerScale}     Szadi pieces: x${this.szScale}`
        ];
        if (!ART.szadiFloor && !ART.szadiWall) {
            lines.push('No Szadi floor or wall chosen yet. Showing 0x72 tiles. Fill in js/data/art.js');
        }
        this.add.text(10, GAME_HEIGHT - 8, lines, {
            fontFamily: 'Arial', fontSize: '18px', color: '#ffffff',
            backgroundColor: 'rgba(0, 0, 0, 0.75)', padding: { x: 8, y: 4 }
        }).setOrigin(0, 1).setDepth(20);
    }

    // ---------- liike ----------

    update(time, delta) {
        let dx = 0;
        let dy = 0;
        if (this.cursors.left.isDown || this.keys.A.isDown) dx -= 1;
        if (this.cursors.right.isDown || this.keys.D.isDown) dx += 1;
        if (this.cursors.up.isDown || this.keys.W.isDown) dy -= 1;
        if (this.cursors.down.isDown || this.keys.S.isDown) dy += 1;

        const moving = dx !== 0 || dy !== 0;
        if (moving) {
            const len = Math.hypot(dx, dy); // viistoon ei liikuta nopeammin
            const step = SPEED * delta / 1000;
            const halfW = (16 * this.playerScale) / 2;
            const halfH = (this.charHeight * this.playerScale) / 2;
            this.player.x = Phaser.Math.Clamp(this.player.x + (dx / len) * step, WALL + halfW, GAME_WIDTH - WALL - halfW);
            this.player.y = Phaser.Math.Clamp(this.player.y + (dy / len) * step, WALL + halfH, GAME_HEIGHT - WALL - halfH);
            if (dx !== 0) this.player.setFlipX(dx < 0);
        }

        if (moving !== this.moving) { // vaihdetaan animaatio vain kun liikkuminen alkaa tai loppuu
            this.moving = moving;
            this.player.play(`${this.charName}_${moving ? 'run' : 'idle'}`);
        }
    }
}