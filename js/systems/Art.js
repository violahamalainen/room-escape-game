import { GAME_WIDTH, GAME_HEIGHT, ART_SCALE, FLOOR_TINT_ALPHA } from '../config.js';
import { ART } from '../data/art.js';
import { CHARACTERS } from '../data/characters.js';

const CATACOMBS = 'assets/images/catacombs/';
const TORCH = ['torch_1', 'torch_2', 'torch_3', 'torch_4'];
const CANDLE_A = ['candleA_01', 'candleA_02', 'candleA_03', 'candleA_04'];
const CANDLE_B = ['candleB_01', 'candleB_02', 'candleB_03', 'candleB_04'];
const TORCH_X = [520, 760, 960]; // soihtujen paikat yläseinällä, HUD-teksti jää vasemmalle ja sydämet oikealle

// ladataan kaikki kuvat kerran pelin alussa (BootScene kutsuu tätä)
export function loadArt(scene) {
    scene.load.image('szadiMain', `${CATACOMBS}mainlevbuild.png`);
    scene.load.image('szadiDeco', `${CATACOMBS}decorative.png`);
    scene.load.image('dungeonSheet', 'assets/images/dungeon/0x72_DungeonTilesetII_v1.7.png');
    [...TORCH, ...CANDLE_A, ...CANDLE_B].forEach((name) => {
        scene.load.image(name, `${CATACOMBS}${name}.png`);
    });
}

// nimetään kuvien palat ja tehdään animaatiot (BootScene kutsuu tätä kun kuvat on ladattu)
export function prepareArt(scene) {
    const keys = ['szadiMain', 'szadiDeco', 'dungeonSheet', ...TORCH, ...CANDLE_A, ...CANDLE_B];
    keys.forEach((key) => scene.textures.get(key).setFilter(Phaser.Textures.FilterMode.NEAREST)); // terävät pikselit

    const main = scene.textures.get('szadiMain');
    const f = ART.szadiFloor;
    const w = ART.szadiWall;
    if (f) main.add('szadiFloor', 0, f.x, f.y, f.w, f.h); // lattiaruudun palanen
    if (w) main.add('szadiWall', 0, w.x, w.y, w.w, w.h);  // seinäruudun palanen

    makeAnim(scene, 'torch', TORCH, 8);
    makeAnim(scene, 'candleA', CANDLE_A, 6);
    makeAnim(scene, 'candleB', CANDLE_B, 6);

    prepareCharacters(scene);
}

// jokaiselle hahmolle nimetyt kuvat (idle ja run, 4 kuvaa kumpikin) ja kaksi animaatiota
function prepareCharacters(scene) {
    const sheet = scene.textures.get('dungeonSheet');

    CHARACTERS.forEach((c) => {
        const h = c.h || 28; // hahmon korkeus kuvassa
        for (let i = 0; i < 4; i++) {
            sheet.add(`${c.name}_idle_${i}`, 0, (c.x || 128) + i * 16, c.y, 16, h);
            sheet.add(`${c.name}_run_${i}`, 0, (c.runX || 192) + i * 16, c.y, 16, h);
        }

        ['idle', 'run'].forEach((kind) => {
            const key = `${c.name}_${kind}`;
            if (scene.anims.exists(key)) return; // ei tehdä kahdesti
            scene.anims.create({
                key,
                frames: [0, 1, 2, 3].map((i) => ({ key: 'dungeonSheet', frame: `${c.name}_${kind}_${i}` })),
                frameRate: kind === 'idle' ? 6 : 10,
                repeat: -1
            });
        });
    });
}

function makeAnim(scene, key, textureKeys, frameRate) { // animaatio erillisistä kuvatiedostoista
    if (scene.anims.exists(key)) return; // ei tehdä kahdesti
    scene.anims.create({ key, frames: textureKeys.map((k) => ({ key: k })), frameRate, repeat: -1 });
}

// täyttää alueen toistamalla yhtä ruutua, reunoilla ylimenevä osa leikataan pois
function fillArea(scene, texture, frameName, x, y, w, h, depth) {
    const frame = scene.textures.getFrame(texture, frameName);
    const tw = frame.width * ART_SCALE;
    const th = frame.height * ART_SCALE;

    for (let yy = y; yy < y + h; yy += th) {
        for (let xx = x; xx < x + w; xx += tw) {
            const img = scene.add.image(xx, yy, texture, frameName)
                .setOrigin(0, 0).setScale(ART_SCALE).setDepth(depth);
            const cropW = Math.min(tw, x + w - xx);
            const cropH = Math.min(th, y + h - yy);
            if (cropW < tw || cropH < th) img.setCrop(0, 0, cropW / ART_SCALE, cropH / ART_SCALE);
        }
    }
}

// koko huoneen lattia, päälle huoneen oma väri läpinäkyvänä, jotta huoneet eroavat toisistaan
export function buildFloor(scene, tintColor) {
    fillArea(scene, 'szadiMain', 'szadiFloor', 0, 0, GAME_WIDTH, GAME_HEIGHT, 0);
    scene.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, tintColor, FLOOR_TINT_ALPHA).setDepth(0);
}

// yhden seinän kuva: keskipiste (cx, cy) ja koko (w, h), samat luvut kuin seinän fysiikkalaatikolla
export function paintWall(scene, cx, cy, w, h) {
    fillArea(scene, 'szadiMain', 'szadiWall', Math.round(cx - w / 2), Math.round(cy - h / 2), w, h, 1);
}

// soihdut yläseinälle ja kynttilät yläkulmiin, kaikki animoituja
export function addDecor(scene) {
    scene.add.sprite(74, 100, 'candleA_01').setScale(ART_SCALE).setDepth(0).play('candleA');
    scene.add.sprite(GAME_WIDTH - 74, 100, 'candleB_01').setScale(ART_SCALE).setDepth(0).play('candleB');

    TORCH_X.forEach((x) => {
        scene.add.sprite(x, 24, 'torch_1').setScale(ART_SCALE).setDepth(2).play('torch');
    });
}