// kaikki pelin tekstit yhdessä paikassa, täältä voi muokata niitä
export const TEXTS = {
    controlsHint: 'WASD / arrows: move     E: hide',
    controlsHintTouch: 'Joystick: move     HIDE button: hide',

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
        rush: { title: 'You died to Rush.', tip: 'Flickering lights mean visitors. Get into a crate (E) and be very quiet.' },
        screech: { title: 'You died to Screech.', tip: 'It just wants attention. Click it fast and it will go away.' },
        eyes: { title: 'You died to the Eyes.', tip: 'They saw you move. Stand perfectly still, until they close.' },
        time: { title: 'You ran out of time.', tip: 'The walls were patient, but not that patient. Read the clues faster, and guess less.' },
        unknown: { title: 'You died.', tip: 'The catacombs will still be here. Try again.' }
    },

    howToPlayTitle: 'HOW TO PLAY',
    howToPlay: [
        'Move with WASD or the arrow keys. On a phone, drag the joystick.',
        'Next to a crate, press E (or tap HIDE) to hide inside. Do it again to come out.',
        'Find the key in each room to open the next door',
        'Collect every flask and note. You will need them in the final room.',
        'When the lights flicker, hide. When a creature appears, click it. When the eyes open, stand still.',

    ]
};