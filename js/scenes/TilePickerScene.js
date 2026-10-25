import { GAME_WIDTH, GAME_HEIGHT } from '../config.js';

// kehitystyökalu: näyttää kuvat suurennettuna ja kertoo valitun alueen koordinaatit
// avataan osoitteella index.html?tool=picker

const SHEETS = [
    { key: 'szadiMain', file: 'assets/images/catacombs/mainlevbuild.png', label: 'Szadi mainlevbuild' },
    { key: 'szadiDeco', file: 'assets/images/catacombs/decorative.png', label: 'Szadi decorative' },
    { key: 'dungeonSheet', file: 'assets/images/dungeon/0x72_DungeonTilesetII_v1.7.png', label: '0x72 sheet' }
];
const ZOOMS = [1, 2, 3, 4];
const SNAPS = [16, 8, 4, 1]; // valinta pyöristyy näihin pikselirajoihin
const SCROLL_SPEED = 700;    // vieritysnopeus pikseliä sekunnissa

const TEXT_STYLE = {
    fontFamily: 'Arial', fontSize: '20px', color: '#ffffff',
    backgroundColor: 'rgba(0, 0, 0, 0.75)', padding: { x: 8, y: 4 }
};

export default class TilePickerScene extends Phaser.Scene {
    constructor() {
        super('TilePickerScene');
    }

    preload() {
        SHEETS.forEach((s) => this.load.image(s.key, s.file)); // ladataan kaikki kolme kuvaa
    }

    init() {
        this.sheetIndex = 0;
        this.zoomIndex = 1;  // alkuun 2x
        this.snapIndex = 0;  // alkuun 16 px
        this.showGrid = true;
        this.dragStart = null; // mistä hiirellä vedetty valinta alkoi
        this.selection = null; // valittu alue { x, y, w, h }
        this.hover = { x: 0, y: 0 };
    }

    create() {
        this.cameras.main.setBackgroundColor(0x3a3a4a); // harmaansininen tausta, jotta läpinäkyvät kohdat näkyy
        SHEETS.forEach((s) => this.textures.get(s.key).setFilter(Phaser.Textures.FilterMode.NEAREST)); // terävät pikselit

        this.image = this.add.image(0, 0, SHEETS[0].key).setOrigin(0, 0);
        this.gridGfx = this.add.graphics().setDepth(1);
        this.selectGfx = this.add.graphics().setDepth(2);

        this.infoText = this.add.text(10, 10, '', TEXT_STYLE).setScrollFactor(0).setDepth(10);
        this.add.text(10, GAME_HEIGHT - 10, '1 2 3: sheet   Z: zoom   N: snap   G: grid   arrows: scroll   drag: select', TEXT_STYLE)
            .setOrigin(0, 1).setScrollFactor(0).setDepth(10);

        this.cursors = this.input.keyboard.createCursorKeys();
        this.input.keyboard.on('keydown-ONE', () => this.setSheet(0));
        this.input.keyboard.on('keydown-TWO', () => this.setSheet(1));
        this.input.keyboard.on('keydown-THREE', () => this.setSheet(2));
        this.input.keyboard.on('keydown-Z', () => this.setZoom((this.zoomIndex + 1) % ZOOMS.length));
        this.input.keyboard.on('keydown-N', () => {
            this.snapIndex = (this.snapIndex + 1) % SNAPS.length;
            this.updateInfo();
        });
        this.input.keyboard.on('keydown-G', () => {
            this.showGrid = !this.showGrid;
            this.drawGrid();
        });

        this.input.on('pointerdown', (p) => { // valinta alkaa
            this.dragStart = this.toSheet(p);
            this.selection = this.makeRect(this.dragStart, this.dragStart);
            this.drawSelection();
            this.updateInfo();
        });
        this.input.on('pointermove', (p) => { // hiiri liikkuu, vedettäessä valinta kasvaa
            this.hover = this.toSheet(p);
            if (this.dragStart) this.selection = this.makeRect(this.dragStart, this.hover);
            this.drawSelection();
            this.updateInfo();
        });
        this.input.on('pointerup', () => { // valinta valmis, numerot myös konsoliin
            if (!this.dragStart) return;
            this.dragStart = null;
            const r = this.selection;
            console.log(`${SHEETS[this.sheetIndex].key}: { x: ${r.x}, y: ${r.y}, w: ${r.w}, h: ${r.h} }`);
        });

        this.refresh();
    }

    setSheet(i) { // vaihtaa kuvaa
        this.sheetIndex = i;
        this.selection = null;
        this.refresh();
    }

    setZoom(i) { // vaihtaa suurennusta
        this.zoomIndex = i;
        this.selection = null;
        this.refresh();
    }

    refresh() { // päivittää kuvan koon, kameran rajat, ruudukon ja tekstit
        const sheet = SHEETS[this.sheetIndex];
        this.zoom = ZOOMS[this.zoomIndex];
        this.image.setTexture(sheet.key).setScale(this.zoom);
        this.sheetW = this.image.width;  // kuvan alkuperäinen koko pikseleinä
        this.sheetH = this.image.height;
        this.cameras.main.setBounds(0, 0, Math.max(this.sheetW * this.zoom, GAME_WIDTH), Math.max(this.sheetH * this.zoom, GAME_HEIGHT));
        this.cameras.main.setScroll(0, 0);
        this.drawGrid();
        this.drawSelection();
        this.updateInfo();
    }

    drawGrid() { // valkoinen ruudukko 16 pikselin välein, joka neljäs viiva vahvempi
        const g = this.gridGfx;
        g.clear();
        if (!this.showGrid) return;

        const z = this.zoom;
        for (let x = 0; x <= this.sheetW; x += 16) {
            g.lineStyle(1, 0xffffff, x % 64 === 0 ? 0.3 : 0.12);
            g.lineBetween(x * z, 0, x * z, this.sheetH * z);
        }
        for (let y = 0; y <= this.sheetH; y += 16) {
            g.lineStyle(1, 0xffffff, y % 64 === 0 ? 0.3 : 0.12);
            g.lineBetween(0, y * z, this.sheetW * z, y * z);
        }
    }

    toSheet(p) { // hiiren paikka ruudulla -> pikseli kuvassa (suurennus huomioiden)
        return {
            x: Phaser.Math.Clamp(Math.floor(p.worldX / this.zoom), 0, this.sheetW - 1),
            y: Phaser.Math.Clamp(Math.floor(p.worldY / this.zoom), 0, this.sheetH - 1)
        };
    }

    makeRect(a, b) { // tekee valinnan kahdesta kulmasta ja pyöristää sen snap-ruudukkoon
        const snap = SNAPS[this.snapIndex];
        const x1 = Math.floor(Math.min(a.x, b.x) / snap) * snap;
        const y1 = Math.floor(Math.min(a.y, b.y) / snap) * snap;
        const x2 = (Math.floor(Math.max(a.x, b.x) / snap) + 1) * snap;
        const y2 = (Math.floor(Math.max(a.y, b.y) / snap) + 1) * snap;
        return { x: x1, y: y1, w: Math.min(x2, this.sheetW) - x1, h: Math.min(y2, this.sheetH) - y1 };
    }

    drawSelection() { // keltainen laatikko valitun alueen ympärille
        const g = this.selectGfx;
        g.clear();
        const r = this.selection;
        if (!r) return;

        const z = this.zoom;
        g.fillStyle(0xffd54f, 0.2);
        g.fillRect(r.x * z, r.y * z, r.w * z, r.h * z);
        g.lineStyle(2, 0xffd54f, 1);
        g.strokeRect(r.x * z, r.y * z, r.w * z, r.h * z);
    }

    updateInfo() { // yläkulman tekstit
        const sheet = SHEETS[this.sheetIndex];
        const r = this.selection;
        this.infoText.setText([
            `${sheet.label}  (${this.sheetW} x ${this.sheetH})   zoom ${this.zoom}x   snap ${SNAPS[this.snapIndex]} px   grid every 16 px`,
            `cursor: x ${this.hover.x}  y ${this.hover.y}`,
            r ? `selection:  x: ${r.x}, y: ${r.y}, w: ${r.w}, h: ${r.h}` : 'selection: drag a box over a tile'
        ]);
    }

    update(time, delta) { // nuolinäppäimet vierittävät kuvaa
        const step = SCROLL_SPEED * delta / 1000;
        const cam = this.cameras.main;
        if (this.cursors.left.isDown) cam.scrollX -= step;
        if (this.cursors.right.isDown) cam.scrollX += step;
        if (this.cursors.up.isDown) cam.scrollY -= step;
        if (this.cursors.down.isDown) cam.scrollY += step;
    }
}