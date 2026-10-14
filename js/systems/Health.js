import { INVULNERABLE_MS } from '../config.js';

export default class Health {
    constructor(scene, startHearts) {
        this.scene = scene;
        this.hearts = startHearts;
        this.invulnerable = false;
    }

    takeDamage() {
        if (this.invulnerable || this.hearts <= 0) return false; // jos pelaaja on invulnerable tai kuollut, ei oteta vahinkoa

        this.hearts -= 1; 
        this.invulnerable = true; 
        this.scene.time.delayedCall(INVULNERABLE_MS, () => { // invulnerable kestää tietyn ajan, jonka jälkeen pelaaja voi taas ottaa vahinkoa
            this.invulnerable = false; // invulnerable pois päältä
        });
        return true;
    }

    isDead() { // tarkistaa onko pelaaja kuollut
        return this.hearts <= 0; 
    } 
}