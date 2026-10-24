import { MAX_HEARTS } from '../config.js';
import { ROOMS } from '../data/rooms.js';

class GameState {
    constructor() {
        this.playerName = ''; // pelaajan nimi, ei nollaudu uuden pelin alussa
        this.runActive = false; // onko keskeneräinen peli käynnissä
        this.runName = ''; // keskeneräisen pelin nimi pienillä kirjaimilla
        this.resetAll();
    }

    // aloittaa kokonaan uuden pelin tällä nimellä
    beginRun(name) {
        this.playerName = name;
        this.runName = name.trim().toLowerCase();
        this.runActive = true;
        this.resetAll();
    }

    // true jos tällä nimellä on keskeneräinen peli, jota voi jatkaa
    canContinue(name) {
        return this.runActive && this.runName === name.trim().toLowerCase();
    }

    // peli päättyi voittoon, seuraava Start aloittaa uuden pelin
    endRun() {
        this.runActive = false;
    }

    // nollaa yritykset, kellon ja nähdyt vihjeet
    resetAll() {
        this.tries = 1;
        this.activeMs = 0; // kertynyt peliaika millisekunteina
        this.clockStart = null; // null = kello ei käy
        this.seen = {}; // mitkä "ensimmäinen kerta" -kuplat on jo nähty tässä pelissä
        this.resetRun();
    }

    // uusi yritys: sydämet ja kerätyt esineet nollataan, yritykset ja kello jatkuvat
    resetRun() {
        this.hearts = MAX_HEARTS;
        this.taken = ROOMS.map(() => ({ key: false, object: false, note: false }));
    }

    nextTry() {
        this.tries += 1;
        this.resetRun();
    }

    startClock() { // kello käynnistyy kun pelaaja on huoneessa
        if (this.clockStart === null) this.clockStart = Date.now();
    }

    stopClock() { // kello pysähtyy ja kertynyt aika tallennetaan
        if (this.clockStart !== null) {
            this.activeMs += Date.now() - this.clockStart;
            this.clockStart = null;
        }
    }

    roomState(index) {
        return this.taken[index];
    }

    countObjects() {
        return this.taken.filter((t) => t.object).length;
    }

    countNotes() {
        return this.taken.filter((t) => t.note).length;
    }

    totalObjects() {
        return ROOMS.filter((r) => r.object).length;
    }

    totalNotes() {
        return ROOMS.filter((r) => r.note).length;
    }

    elapsedSeconds() { // kertynyt aika + käynnissä olevan jakson aika
        const running = this.clockStart !== null ? Date.now() - this.clockStart : 0;
        return Math.floor((this.activeMs + running) / 1000);
    }
}

export default new GameState();