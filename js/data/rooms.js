export const ROOMS = [
    {
        name: 'Room 1',
        floorColor: 0x3b2f2a, //0x2b2b2b,
        quietMs: 6000, // hiljainen väli tapahtumien välillä
        playerStart: { x: 120, y: 360 },
        door: { y: 360, height: 120 },
        key: { x: 900, y: 140 },
        object: { x: 900, y: 620, shape: 'circle', color: 0xab47bc },
        note: { x: 350, y: 600, text: 'The square is in the last socket.' },
        walls: [
            [640, 360, 40, 300]
        ],
        closets: [[260, 150], [1000, 560]],
        rush: { speed: 800, warn1Ms: 5000, warn2Ms: 3000, minGapMs: 25000, maxGapMs: 40000, firstDelayMs: 8000 } // rush hankaloituu mitä pitemmälle huoneissa liikutaan
    },
    {
        name: 'Room 2',
        floorColor: 0x26303a,
        quietMs: 5000,
        playerStart: { x: 120, y: 560 },
        door: { y: 360, height: 120 },
        backDoor: { y: 360, height: 120 },
        key: { x: 600, y: 120 },
        object: { x: 1050, y: 600, shape: 'square', color: 0x42a5f5 },
        note: { x: 250, y: 460, text: 'The star sits right next to the triangle.' },
        walls: [
            [400, 200, 40, 320],
            [800, 520, 40, 320]
        ],
        closets: [[250, 600], [600, 450], [1000, 200]],
        rush: { speed: 950, warn1Ms: 4500, warn2Ms: 2800, minGapMs: 20000, maxGapMs: 32000, firstDelayMs: 8000 },
        screech: { reactMs: 2500, minGapMs: 25000, maxGapMs: 40000, firstDelayMs: 12000 }
    },
    {
        name: 'Room 3',
        floorColor: 0x2f3b2d, //0x2a2a35,
        quietMs: 4000,
        playerStart: { x: 120, y: 360 },
        door: { y: 360, height: 120 },
        backDoor: { y: 360, height: 120 },
        key: { x: 500, y: 120 },
        object: { x: 1100, y: 620, shape: 'triangle', color: 0xff7043 },
        note: { x: 470, y: 610, text: 'The circle is between the star and the square.' },
        walls: [
            [300, 360, 40, 400],
            [640, 200, 40, 300],
            [640, 560, 40, 300],
            [980, 360, 40, 400]
        ],
        closets: [[180, 150], [470, 360], [820, 360], [1130, 200]],
        rush: { speed: 1100, warn1Ms: 4000, warn2Ms: 2400, minGapMs: 14000, maxGapMs: 24000, firstDelayMs: 6000 },
        eyes: [
            // ensimmäinen pari vahtii esinettä, toinen noten ympäristöä
            { x: 1190, y: 658, zone: { x: 40, y: 40, w: 1200, h: 640 }, warnMs: 1000, minOpenMs: 1500, maxOpenMs: 3500, minClosedMs: 12000, maxClosedMs: 30000, firstDelayMs: 10000 },
            { x: 390, y: 658, zone: { x: 40, y: 40, w: 1200, h: 640 }, warnMs: 1000, minOpenMs: 1500, maxOpenMs: 3500, minClosedMs: 12000, maxClosedMs: 30000, firstDelayMs: 20000 }
        ]
    },
    {
        name: 'Room 4',
        floorColor: 0x4a2430, //0x2e2430,
        quietMs: 3500,
        playerStart: { x: 120, y: 360 },
        door: { y: 360, height: 120 },
        backDoor: { y: 360, height: 120 },
        key: { x: 780, y: 600 },
        object: { x: 1150, y: 130, shape: 'star', color: 0x26c6da },
        note: { x: 480, y: 380, text: 'The triangle is at one of the two ends.' },
        walls: [
            [360, 300, 40, 520],
            [640, 420, 40, 520],
            [920, 300, 40, 520]
        ],
        closets: [[200, 600], [500, 150], [780, 150], [1100, 500]],
        rush: { speed: 1250, warn1Ms: 3500, warn2Ms: 2200, minGapMs: 9000, maxGapMs: 18000, firstDelayMs: 5000 },
        screech: { reactMs: 2000, minGapMs: 20000, maxGapMs: 30000, firstDelayMs: 10000 },
        eyes: [
            // yksi pari vahtii esinettä oikeassa yläkulmassa
            { x: 1060, y: 62, zone: { x: 40, y: 40, w: 1200, h: 640 }, warnMs: 1000, minOpenMs: 1500, maxOpenMs: 3500, minClosedMs: 15000, maxClosedMs: 35000, firstDelayMs: 12000 }
        ]
    }
];




