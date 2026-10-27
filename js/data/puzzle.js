export const PUZZLE = {
    timeLimitMs: 90000, // aikaraja millisekunteina
    penaltyMs: 10000,    // väärästä sijoituksesta menetetty aika (10 s)
    order: ['green', 'yellow', 'red', 'blue'] // oikea järjestys vasemmalta oikealle, samat nimet kuin rooms.js:n flask-kentät
};