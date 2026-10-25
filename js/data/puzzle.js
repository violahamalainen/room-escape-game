export const PUZZLE = {
    timeLimitMs: 120000, // aikaraja millisekunteina (120 s)
    penaltyMs: 10000,    // väärästä sijoituksesta menetetty aika (10 s)
    order: ['green', 'yellow', 'red', 'blue'] // oikea järjestys vasemmalta oikealle, samat nimet kuin rooms.js:n flask-kentät
};