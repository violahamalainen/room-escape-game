export const ROOMS = [
    {
        name: 'Room 1',
        floorColor: 0x3b2f2a,
        quietMs: 6000, // hiljainen väli tapahtumien välillä
        playerStart: { x: 120, y: 360 },
        door: { y: 360, height: 120 },
        key: { x: 900, y: 140 },
        object: { x: 1100, y: 200, flask: 'red', color: 0xff5252 }, 
        note: { x: 350, y: 600, text: 'The blue flask is in the last socket.' },
        walls: [
            [640, 360, 40, 300]
        ],
        closets: [[56, 200], [1000, 656]], // laatikot seinien vieressä
        rush: { speed: 800, warn1Ms: 5000, warn2Ms: 2500, minGapMs: 25000, maxGapMs: 40000, firstDelayMs: 8000 } // rush hankaloituu mitä pitemmälle huoneissa liikutaan
    },
    {
        name: 'Room 2',
        floorColor: 0x26303a,
        quietMs: 5000,
        playerStart: { x: 120, y: 560 },
        door: { y: 360, height: 120 },
        backDoor: { y: 360, height: 120 },
        key: { x: 600, y: 120 },
        object: { x: 1100, y: 600, flask: 'blue', color: 0x42a5f5 },
        note: { x: 250, y: 120, text: 'The yellow flask sits right next to the green flask.' },
        walls: [
            [400, 200, 40, 320],
            [800, 520, 40, 320]
        ],
        closets: [[56, 620], [600, 656], [1224, 180]],
        rush: { speed: 950, warn1Ms: 4500, warn2Ms: 2200, minGapMs: 20000, maxGapMs: 32000, firstDelayMs: 8000 },
        screech: { reactMs: 2500, minGapMs: 14000, maxGapMs: 24000, firstDelayMs: 8000 }
    },
    {
        name: 'Room 3',
        floorColor: 0x2f3b2d,
        quietMs: 4000,
        playerStart: { x: 120, y: 360 },
        door: { y: 360, height: 120 },
        backDoor: { y: 360, height: 120 },
        key: { x: 560, y: 470 },
        object: { x: 1100, y: 520, flask: 'green', color: 0x66bb6a },
        note: { x: 160, y: 160, text: 'The red flask is between the yellow flask and the blue flask.' },
        walls: [
            [300, 360, 40, 400],
            [640, 200, 40, 300],
            [640, 560, 40, 300],
            [980, 360, 40, 400]
        ],
        closets: [[56, 600], [470, 64], [820, 656], [1224, 160]],
        rush: { speed: 1100, warn1Ms: 4000, warn2Ms: 2000, minGapMs: 14000, maxGapMs: 24000, firstDelayMs: 6000 },
        eyes: [
            // molemmat silmäparit vahtivat koko huonetta, director päästää vaan yhen kerrallaan hereille
            { x: 1190, y: 658, zone: { x: 40, y: 40, w: 1200, h: 640 }, warnMs: 1000, minOpenMs: 1500, maxOpenMs: 3500, minClosedMs: 7000, maxClosedMs: 16000, firstDelayMs: 6000 },
            { x: 390, y: 658, zone: { x: 40, y: 40, w: 1200, h: 640 }, warnMs: 1000, minOpenMs: 1500, maxOpenMs: 3500, minClosedMs: 7000, maxClosedMs: 16000, firstDelayMs: 12000 }
        ]
    },
    {
        name: 'Room 4',
        floorColor: 0x4a2430,
        quietMs: 3500,
        playerStart: { x: 120, y: 360 },
        door: { y: 360, height: 120 },
        backDoor: { y: 360, height: 120 },
        key: { x: 480, y: 620 },
        object: { x: 1150, y: 130, flask: 'yellow', color: 0xffd54f },
        note: { x: 200, y: 100, text: 'The green flask is at one of the two ends.' },
        walls: [
            [360, 300, 40, 520],
            [640, 420, 40, 520],
            [920, 300, 40, 520]
        ],
        closets: [[56, 600], [604, 260], [884, 420], [1224, 560]],
        rush: { speed: 1250, warn1Ms: 3500, warn2Ms: 1800, minGapMs: 9000, maxGapMs: 18000, firstDelayMs: 5000 },
        screech: { reactMs: 2000, minGapMs: 14000, maxGapMs: 24000, firstDelayMs: 7000 },
        eyes: [
            { x: 1060, y: 62, zone: { x: 40, y: 40, w: 1200, h: 640 }, warnMs: 1000, minOpenMs: 1500, maxOpenMs: 3500, minClosedMs: 15000, maxClosedMs: 35000, firstDelayMs: 12000 }
        ]
    }
];