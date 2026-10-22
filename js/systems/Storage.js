const SCORES_KEY = 'roomEscape.scores';     // avain jolla tulokset tallennetaan selaimeen
const SETTINGS_KEY = 'roomEscape.settings';
const DEFAULT_SETTINGS = { musicVolume: 0.7, sfxVolume: 0.7 };

// järjestää tulokset: vähiten yrityksiä ensin, sitten nopein aika
export function sortScores(list) {
    return [...list].sort((a, b) => (a.tries - b.tries) || (a.seconds - b.seconds));
}

export function loadScores() {
    try {
        const list = JSON.parse(localStorage.getItem(SCORES_KEY));
        return Array.isArray(list) ? list : []; // jos ei tuloksia tai data on rikki -> tyhjä lista
    } catch (e) {
        return [];
    }
}

export function saveScore(name, tries, seconds) { // tallentaa yhden valmiin pelin, palauttaa tallennetun rivin
    const entry = { id: Date.now(), name, tries, seconds };
    const list = sortScores([...loadScores(), entry]).slice(0, 100); // säilytetään max 100 parasta
    try {
        localStorage.setItem(SCORES_KEY, JSON.stringify(list));
    } catch (e) {
        // jos selain ei salli tallennusta, peli jatkuu silti
    }
    return entry;
}

export function loadSettings() {
    try {
        const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY));
        return { ...DEFAULT_SETTINGS, ...(saved || {}) }; // oletukset + tallennetut päälle
    } catch (e) {
        return { ...DEFAULT_SETTINGS };
    }
}

export function saveSettings(settings) {
    try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
        // ei tehdä mitään
    }
}