// kaikki pelin tekstit yhdessä paikassa, täältä voi muokata niitä
export const TEXTS = {
    controlsHint: 'WASD / arrows: move     E: hide',

    key: 'A key. This should open the door.',
    doorLocked: 'Locked. There must be a key somewhere.',
    object: 'This might be important.',
    note: "A note. I'll keep it.",
    gateLocked: "I can't leave yet. I haven't found everything.",
    gateClosing: 'The door locks behind me...',

    rushWarning1: 'What was that..? Are the lights broken?', 
    rushWarning2: 'Oh no... something is coming. Hide!',
    rushPassedHiding: "It's gone... for now.",

    screechWarning: 'Something is right behind me...',
    screechBanished: "It's gone!",
    screechMissed: 'It got me!',

    eyesFirst: 'What are those giant eyes..? They must not see me move.', 
    eyesWarning: "They're opening...",
    eyesOpen: "Don't move.",
    eyesSaw: 'It saw me move!',

    // game over -ruudun otsikko ja vinkki sen mukaan, mikä pelaajan tappoi
    death: {
        rush: { title: 'You died to Rush.', tip: 'Hide in a closet (E) when the lights flicker.' },
        screech: { title: 'You died to Screech.', tip: 'Click it quickly when it appears.' },
        eyes: { title: 'You died to the Eyes.', tip: 'When they open, stand perfectly still.' },
        time: { title: 'You ran out of time.', tip: 'Read the clues quickly. Wrong guesses cost time.' },
        unknown: { title: 'You died.', tip: 'Be careful and try again.' }
    },

    howToPlayTitle: 'HOW TO PLAY',
    howToPlay: [
        'Move with WASD or the arrow keys.',
        'Press E next to a closet to hide. Press E again to come out.',
        'Find the key in each room to open the door. You can go back through the left door.',
        'Collect every object and note. You will need them in the final room.',
        'Something dangerous lives in these rooms. Watch, listen and learn.'
    ]
};