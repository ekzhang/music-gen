const btn = document.getElementById('compose');
const message = document.getElementById('loading-message');
const container = document.getElementById('loading-container');

function display(song) {
  ABCJS.renderAbc('sheet-music', song);
  ABCJS.renderMidi('midi-music', song, { qpm: 180 });
  document.getElementById('download').onclick = function() {
    download('song.abc', song);
  };
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

function download(name, contents) {
  const element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(contents));
  element.setAttribute('download', name);
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
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

  btn.onclick = function() {
    displayClear();
    showLoading('Composing...');
    worker.postMessage({ type: 'sample' });
  }

  document.getElementById('toggle-gpu').onclick = function() {
    worker.postMessage({ type: 'toggle-gpu' });
  }
}

main();
