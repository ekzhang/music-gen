ABCJS.midi.soundfontUrl = "https://gleitz.github.io/midi-js-soundfonts/MusyngKite/";

const btn = document.getElementById('compose');
const message = document.getElementById('loading-message');
const container = document.getElementById('loading-container');

function display(song) {
  ABCJS.renderAbc('sheet-music', song);
  ABCJS.renderMidi('midi-music', song);
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

async function main() {
  const worker = new Worker('worker.js');
  showLoading('Loading model...');

  worker.onmessage = function(e) {
    const d = e.data;
    if (d.type === 'ready') {
      clearLoading();
    }
    else if (d.type === 'song') {
      display(d.payload);
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
