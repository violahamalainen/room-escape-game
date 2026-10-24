import gameState from './GameState.js';

const DEFAULT_QUIET_MS = 4000; // jos huoneella ei ole omaa quietMs-arvoa

// ohjaaja: huoneessa saa tapahtua vain yksi pelottava tapahtuma kerrallaan (rush, screech tai silmät)
export default class Director {
    constructor(scene) {
        this.scene = scene;
        this.busy = false; // true kun jokin tapahtuma on käynnissä
        this.current = null; // mikä tapahtuma on käynnissä, esim. 'rush'
        this.quietUntil = 0; // ennen tätä hetkeä mikään uusi tapahtuma ei saa alkaa
    }

    canStart() { // saako tapahtuma alkaa nyt?
        return !this.busy && this.scene.time.now >= this.quietUntil;
    }

    start(name) { // tapahtuma alkaa, muut joutuvat odottamaan
        this.busy = true;
        this.current = name;
    }

    end() { // tapahtuma loppui, alkaa hiljainen väli ennen seuraavaa
        this.busy = false;
        this.current = null;
        const quiet = this.scene.room.quietMs || DEFAULT_QUIET_MS;
        this.quietUntil = this.scene.time.now + quiet;
    }

    firstTime(key) { // true vain ensimmäisellä kerralla koko pelin aikana, esim. silmien ensimmäinen kupla
        if (gameState.seen[key]) return false;
        gameState.seen[key] = true;
        return true;
    }
}