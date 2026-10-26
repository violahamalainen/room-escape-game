import { loadSettings } from './Storage.js';

const FOLDER = 'assets/audio/';
const FADE_IN_MS = 1500;  // musiikki tulee esiin näin hitaasti
const FADE_OUT_MS = 800;  // vanha musiikki hiljenee näin hitaasti

// äänitehosteet: tapahtuman nimi -> tiedosto ja voimakkuus (gain 1 = normaali, 0.5 = puolet hiljaisempi)
export const SFX = {
    pickup:     { file: 'pickup.mp3', gain: 1 },
    doorOpen:   { file: 'door_open.mp3', gain: 1 },
    doorLocked: { file: 'door_locked.mp3', gain: 1 },
    hide:       { file: 'hide.mp3', gain: 1 },
    hurt:       { file: 'hurt.mp3', gain: 1 },
    rushWarn:   { file: 'rush_pass.mp3', gain: 1 },
    screech:    { file: 'screech.mp3', gain: 1.5 },
    banish:     { file: 'banish.mp3', gain: 2 },
    eyes:       { file: 'eyes.mp3', gain: 2 },
    placeOk:    { file: 'place_ok.mp3', gain: 1 },
    placeWrong: { file: 'place_wrong.mp3', gain: 1 },
    win:        { file: 'win.mp3', gain: 1 }
};

// musiikkipaikat: paikan nimi -> tiedosto ja voimakkuus. Vaihda tiedostoja tästä, esim. menu: null = ei musiikkia
export const MUSIC = {
    menu:  { file: 'something_freaky.ogg', gain: 0.6 },  // valikko ja alkuteksti
    rooms: { file: 'symmetry.mp3', gain: 0.5 },          // huoneet 1-4
    final: { file: 'dark_techno.mp3', gain: 0.6 },       // viimeinen huone
    win:   { file: 'ominous_menu.ogg', gain: 0.6 }       // voittoruutu
};

let current = null; // musiikki joka soi nyt: { slot, sound, gain }
let wanted = null;  // minkä paikan musiikkia halutaan juuri nyt

function musicVolume(gain) { // asetusten musiikin voimakkuus kerrottuna kappaleen omalla gainilla
    return loadSettings().musicVolume * gain;
}

// äänitehosteet ladataan kerran pelin alussa (BootScene kutsuu tätä)
export function loadSfx(scene) {
    Object.entries(SFX).forEach(([name, info]) => {
        scene.load.audio(`sfx_${name}`, FOLDER + info.file);
    });
}

export function playSfx(scene, name) {
    const info = SFX[name];
    const key = `sfx_${name}`;
    const game = scene.game; // game-olio säilyy vaikka scene vaihtuu
    if (!info || !game.cache.audio.exists(key)) return; // tiedosto puuttuu -> ei ääntä, ei kaatumista

    const volume = loadSettings().sfxVolume * info.gain;
    if (volume > 0) game.sound.play(key, { volume }); // Phaser siivoaa äänen itse kun se loppuu
}

// muuttaa äänenvoimakkuutta pehmeästi, ei riipu scenestä (setInterval jatkuu vaikka scene vaihtuu)
function fade(sound, to, ms, done) {
    if (sound.fadeTimer) clearInterval(sound.fadeTimer); // lopetetaan edellinen häivytys
    const from = sound.volume;
    const startTime = performance.now();

    sound.fadeTimer = setInterval(() => {
        const t = Math.min(1, (performance.now() - startTime) / ms); // 0 -> 1
        sound.volume = from + (to - from) * t;
        if (t >= 1) {
            clearInterval(sound.fadeTimer);
            sound.fadeTimer = null;
            if (done) done();
        }
    }, 50);
}

// lataa musiikin vasta kun sitä tarvitaan. BootScene on yhä käynnissä, joten sen lataaja ei katoa kun ruutu vaihtuu
function loadMusic(scene, key, url, onReady) {
    if (scene.game.cache.audio.exists(key)) { onReady(); return; } // jo ladattu

    const loader = scene.game.scene.getScene('BootScene').load;
    loader.once(`filecomplete-audio-${key}`, onReady);
    loader.audio(key, url);
    if (!loader.isLoading()) loader.start();
}

// lataa musiikin valmiiksi taustalla ilman että se alkaa soida
export function prefetchMusic(scene, slot) {
    const info = MUSIC[slot];
    if (info) loadMusic(scene, `music_${slot}`, FOLDER + info.file, () => {});
}

// vaihtaa musiikin: vanha hiljenee, uusi tulee esiin. slot = null hiljentää kaiken
export function playMusic(scene, slot) {
    if (current && current.slot === slot) return; // sama musiikki soi jo
    wanted = slot;

    if (current) { // vanha musiikki pois
        const old = current.sound;
        current = null;
        fade(old, 0, FADE_OUT_MS, () => old.destroy());
    }

    const info = slot ? MUSIC[slot] : null;
    if (!info) return; // tälle paikalle ei ole musiikkia

    loadMusic(scene, `music_${slot}`, FOLDER + info.file, () => {
        if (wanted !== slot) return;                  // ehdittiin vaihtaa mieltä lataamisen aikana
        if (current && current.slot === slot) return; // jo käynnissä
        const sound = scene.game.sound.add(`music_${slot}`, { loop: true, volume: 0 });
        sound.play();
        current = { slot, sound, gain: info.gain };
        fade(sound, musicVolume(info.gain), FADE_IN_MS);
    });
}

// asetukset-ruutu kutsuu tätä kun musiikin voimakkuutta muutetaan
export function refreshMusicVolume() {
    if (current) fade(current.sound, musicVolume(current.gain), 150);
}