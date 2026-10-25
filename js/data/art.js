// Szadin ruudut: täytä nämä TilePickerin antamilla arvoilla (x, y, w, h)
// null tai tyhjä lista = PreviewScene käyttää 0x72:n ruutuja tilalla
export const ART = {
    szadiFloor: { x: 880, y: 208, w: 32, h: 48 }, // yksi lattiaruutu, muoto esim. { x: 0, y: 0, w: 32, h: 32 }
    szadiWall: { x: 304, y: 400, w: 64, h: 48 },  // yksi toistettava seinäpala, samaa muotoa
    szadiProps: [{ sheet: 'szadiDeco', x: 144, y: 144, w: 16, h: 16 }]    // esineet, muoto esim. { sheet: 'szadiDeco', x: 0, y: 0, w: 32, h: 48 }
};