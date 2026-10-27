import gameState from './GameState.js';

// sivutason asiat: peli pysähtyy kun puhelin on pystyssä, ja pelikello pysähtyy aina kun peli on pysähtyneenä
export function setupPage(game) {
    game.events.on('pause', () => gameState.pauseClock());   // pause tulee myös kun välilehti piilotetaan
    game.events.on('resume', () => gameState.resumeClock());

    const portrait = window.matchMedia('(orientation: portrait) and (pointer: coarse)'); // sama ehto kuin CSS:ssä
    const apply = () => {
        if (portrait.matches) game.pause();
        else game.resume();
    };
    portrait.addEventListener('change', apply); // kun puhelinta käännetään
    apply();
}