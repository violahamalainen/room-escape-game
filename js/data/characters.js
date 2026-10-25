// kaikki pelattavat hahmot kuvassa 0x72_DungeonTilesetII: nimi ja rivin y-koordinaatti
// idle-kuvat alkavat x:stä 128 ja run-kuvat x:stä 192, ellei hahmolla ole omia arvoja
export const DEFAULT_CHARACTER = 'wizard_m'; // pelin oletushahmo

export const CHARACTERS = [
    { name: 'elf_f', y: 4 }, { name: 'elf_m', y: 36 },
    { name: 'knight_f', y: 68 }, { name: 'knight_m', y: 100 },
    { name: 'wizard_f', y: 132 }, { name: 'wizard_m', y: 164 },
    { name: 'lizard_f', y: 196 }, { name: 'lizard_m', y: 228 },
    { name: 'dwarf_f', y: 260 }, { name: 'dwarf_m', y: 292 },
    { name: 'doc', y: 345, x: 368, runX: 432, h: 23 } // tohtori: eri kohdassa kuvaa ja 23 px korkea
];