export const ROOMS = [
    {
        name: 'Room 1',
        floorColor: 0x2b2b2b,
        playerStart: { x: 120, y: 360 },
        door: { y: 360, height: 120 },
        key: { x: 900, y: 140 },
        walls: [
            [640, 360, 40, 300]
        ],
        closets: [[260, 150], [1000, 560]],
        rush: { speed: 800, warningMs: 2800, minGapMs: 25000, maxGapMs: 40000, firstDelayMs: 8000 } // rush hirviö hankaloituu mitä pitemmälle huoneissa mennään
    },
    {
        name: 'Room 2',
        floorColor: 0x26303a,
        playerStart: { x: 120, y: 560 },
        door: { y: 360, height: 120 },
        key: { x: 600, y: 120 },
        walls: [
            [400, 200, 40, 320],
            [800, 520, 40, 320]
        ],
        closets: [[250, 600], [600, 450], [1000, 200]],
        rush: { speed: 950, warningMs: 2500, minGapMs: 22000, maxGapMs: 35000, firstDelayMs: 8000 }
    },
    {
        name: 'Room 3',
        floorColor: 0x2a2a35,
        playerStart: { x: 120, y: 360 },
        door: { y: 360, height: 120 },
        key: { x: 500, y: 120 },
        walls: [
            [300, 360, 40, 400],
            [640, 200, 40, 300],
            [640, 560, 40, 300],
            [980, 360, 40, 400]
        ],
        closets: [[180, 150], [470, 360], [820, 360], [1130, 200]],
        rush: { speed: 1100, warningMs: 2300, minGapMs: 20000, maxGapMs: 32000, firstDelayMs: 8000 }
    },
    {
        name: 'Room 4',
        floorColor: 0x2e2430,
        playerStart: { x: 120, y: 360 },
        door: { y: 360, height: 120 },
        key: { x: 780, y: 600 },
        walls: [
            [360, 300, 40, 520],
            [640, 420, 40, 520],
            [920, 300, 40, 520]
        ],
        closets: [[200, 600], [500, 150], [780, 150], [1100, 500]],
        rush: { speed: 1250, warningMs: 2000, minGapMs: 15000, maxGapMs: 28000, firstDelayMs: 8000 }
    }
];