ABCJS.midi.soundfontUrl = "https://gleitz.github.io/midi-js-soundfonts/MusyngKite/";

const btn = document.getElementById('compose');
const message = document.getElementById('loading-message');
const container = document.getElementById('loading-container');

function display(song) {
  ABCJS.renderAbc('sheet-music', song);
  ABCJS.renderMidi('midi-music', song, {}, {qpm: 120});
}

function displayClear() {
  document.getElementById('sheet-music').innerHTML = '';
  document.getElementById('midi-music').innerHTML = '';
}

function showLoading(msg) {
  btn.style.display = 'none';
  message.innerHTML = msg;
  container.style.display = 'block';
}

function clearLoading() {
  btn.style.display = 'block';
  message.innerHTML = '';
  container.style.display = 'none';
}

function process(abc) {
  // Remove nonstandard Y: information fields
  var lines = abc.split('\n');
  for (let i = lines.length - 1; i >= 0; i--) {
    if (lines[i].startsWith('Y:')) {
      lines.splice(i, 1);
    }
  }
  return lines.join('\n');
}

async function main() {
  const worker = new Worker('worker.js');
  showLoading('Loading model...');

  worker.onmessage = function(e) {
    const d = e.data;
    if (d.type === 'ready') {
      clearLoading();
    }
    else if (d.type === 'song') {
      const song = process(d.payload);
      display(song);
      clearLoading();
    }
    else {
      console.error('Invalid message from worker: ' + d);
    }
  }

  btn.onclick = async function () {
    displayClear();
    showLoading('Composing...');
    worker.postMessage({ type: 'sample' });
  }
}

main();
