ABCJS.midi.soundfontUrl = "https://gleitz.github.io/midi-js-soundfonts/MusyngKite/";

function display(song) {
  ABCJS.renderAbc('sheet-music', song);
  ABCJS.renderMidi('midi-music', song);
}

display(`X: 8
T:Ftrhwls Hadkyeas
% Nottingham Music Database
S:Trad, arr Phil Rowe
M:6/8
K:A
"E7"ABd |[2"A"e2e e2e|"D7"d2B "A"c2A|"Bm"B2B "A7"EBc|"Bm"d2B "A7"ABG|
"D"F2D A2A|"G"B2G "A7"B2B|"D"A2F F2G|"Em"GAG "A7"A2G|
"D"d2A Bcd|"G"efg "A7"edc|"Em"Bee "A7"cBA|"D"A2c d2:|`);

function get(url) {
  return new Promise((resolve, reject) => {
    const req = new XMLHttpRequest();
    req.open('GET', url);
    req.onload = () => req.status === 200 ? resolve(req.response) : reject(Error(req.statusText));
    req.onerror = (e) => reject(Error(`Network Error: ${e}`));
    req.send();
  });
}

const model = new KerasJS.Model({
  filepath: '/model/model.100.bin',
  headers: {},
  filesystem: false,
  gpu: true,
  transferLayerOutputs: false,
  pauseAfterLayerCalls: false,
  visualizations: []
});

function weightedRandom(prob) {
  var total = 0;
  for (let p of prob) {
    total += p;
  }
  const r = total * Math.random();
  var cur = 0;
  for (let i = 0; i < prob.length; i++) {
    cur += prob[i];
    if (cur > r) {
      return i;
    }
  }
  return -1;
}

async function sample() {
  const char_to_idx = JSON.parse(await get('model/char_to_idx.json'));
  var idx_to_char = {};
  var vocab_size = 0;
  for (let c of Object.keys(char_to_idx)) {
    idx_to_char[char_to_idx[c]] = c;
    ++vocab_size;
  }

  await model.ready();

  sampled = [];

  for (let i = 0; i < 512; i++) {
    var input = new Float32Array(1);
    if (sampled.length) {
      input[0] = sampled[sampled.length - 1];
    }
    else {
      input[0] = Math.floor(Math.random() * vocab_size);
    }
    const outputData = await model.predict({ input });
    const output = outputData.output;

    sampled.push(weightedRandom(output));
  }
  return sampled.map(idx => idx_to_char[idx]).join('');
}

async function main() {
  console.log(await sample());
}

main();
