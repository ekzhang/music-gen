ABCJS.midi.soundfontUrl = "https://gleitz.github.io/midi-js-soundfonts/MusyngKite/";

function display(song) {
  ABCJS.renderAbc('sheet-music', song);
  ABCJS.renderMidi('midi-music', song);
}

async function main() {
  const worker = new Worker('worker.js');

  const btn = document.getElementById('compose');
  const message = document.getElementById('message');

  worker.onmessage = function(e) {
    const d = e.data;
    if (d.type === 'ready') {
      message.innerHTML = '';

      btn.onclick = async function () {
        btn.disabled = true;
        message.innerHTML = 'Composing...';
        worker.postMessage({ type: 'sample' });
      }
    }
    else if (d.type === 'song') {
      display(d.payload);
      message.innerHTML = '';
      btn.disabled = false;
    }
    else {
      console.error('Invalid message from worker: ' + d);
    }
  }
}

main();
