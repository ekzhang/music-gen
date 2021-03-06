const btn = document.getElementById('compose');
const message = document.getElementById('loading-message');
const container = document.getElementById('loading-container');

function colorRange(range, color) {
  if (range && range.elements) {
    for (const set of range.elements)
      for (const item of set)
        item.setAttribute('fill', color);
  }
}

function display(song) {
  document.getElementById('sheet-music').style.visibility = 'visible';
  const tunes = ABCJS.renderAbc('sheet-music', song);
  ABCJS.renderMidi('midi-music', song, {
    generateDownload: false,
    animate: {
      listener: function(lastRange, currentRange, context) {
        colorRange(lastRange, '#000000');
        colorRange(currentRange, '#3D9AFC');
      },
      target: tunes[0]
    }
  });
  document.getElementById('download-abc').onclick = function() {
    download('song.abc', song);
  };
  document.getElementById('download-midi').onclick = function() {
    download('song.mid', getMidi(song), true);
  };
}

function displayClear() {
  document.getElementById('sheet-music').style.visibility = 'hidden';
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

function download(name, contents, raw) {
  const element = document.createElement('a');
  const href = raw ? contents : 'data:text/plain;charset=utf-8,' + encodeURIComponent(contents);
  element.setAttribute('href', href);
  element.setAttribute('download', name);
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

function getMidi(abc) {
  var midi = abc2midi(abc);
  var b64encoded = btoa(String.fromCharCode.apply(null, midi));
  return "data:audio/midi;base64," + b64encoded;
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
}

main();
