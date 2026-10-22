import { MAX_HEARTS } from '../config.js';
import { ROOMS } from '../data/rooms.js';

class GameState {
    constructor() {
        this.playerName = ''; // pelaajan nimi, ei nollaudu uuden pelin alussa
        this.resetAll();
    }

    // alota kokonaan uusi peli, resetoi tries ja timer
    resetAll() {
        this.tries = 1;
        this.startTime = Date.now();
        this.resetRun();
    }

    // alota uusi try: sydämet ja kerätyt esineet nollataan, koe ja timer jatkuvat
    resetRun() {
        this.hearts = MAX_HEARTS;
        this.taken = ROOMS.map(() => ({ key: false, object: false, note: false }));
    }

    nextTry() { // kun pelaaja kuolee, +1 try ja resetoi run
        this.tries += 1; 
        this.resetRun();
    }

    roomState(index) { // palauttaa tietyn huoneen tilan, onko key, object ja note kerätty
        return this.taken[index];
    }

    countObjects() { // laskee montako esinettä on kerätty
        return this.taken.filter((t) => t.object).length;
    }

    countNotes() { // laskee montako muistiinpanoa on kerätty
        return this.taken.filter((t) => t.note).length;
    }

    totalObjects() { // palauttaa kokonaislukuna, kuinka monta esinettä on olemassa
        return ROOMS.filter((r) => r.object).length;
    }

    totalNotes() { // palauttaa kokonaislukuna, kuinka monta notes on olemassa
        return ROOMS.filter((r) => r.note).length;
    }

    elapsedSeconds() { // palauttaa kuinka monta sekuntia on kulunut pelin alusta
        return Math.floor((Date.now() - this.startTime) / 1000);
    }
}

export default new GameState(); // singleton, jotta GameState on sama kaikissa sceneissä