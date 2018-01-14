const s = `X: 8
T:Ftrhwls Hadkyeas
% Nottingham Music Database
S:Trad, arr Phil Rowe
M:6/8
K:A
"E7"ABd |[2"A"e2e e2e|"D7"d2B "A"c2A|"Bm"B2B "A7"EBc|"Bm"d2B "A7"ABG|
"D"F2D A2A|"G"B2G "A7"B2B|"D"A2F F2G|"Em"GAG "A7"A2G|
"D"d2A Bcd|"G"efg "A7"edc|"Em"Bee "A7"cBA|"D"A2c d2:|`

ABCJS.renderAbc('sheet-music', s);
ABCJS.midi.soundfontUrl = "https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/";
ABCJS.renderMidi('midi-music', s);
