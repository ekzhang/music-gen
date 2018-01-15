importScripts('https://unpkg.com/keras-js');

function get(url) {
  return new Promise((resolve, reject) => {
    const req = new XMLHttpRequest();
    req.open('GET', url);
    req.onload = () => req.status === 200 ? resolve(req.response) : reject(Error(req.statusText));
    req.onerror = (e) => reject(Error(`Network Error: ${e}`));
    req.send();
  });
}

class MusicRNN {
  constructor() {
    this.model = new KerasJS.Model({
      filepath: 'model/model.100.bin',
      headers: {},
      filesystem: false,
      gpu: false,
      transferLayerOutputs: false,
      pauseAfterLayerCalls: false,
      visualizations: []
    });
    this.gpu = false;
    this.ready = Promise.all([this.model.ready(), get('model/char_to_idx.json')]).then(result => {
      this.charToIdx = JSON.parse(result[1]);
      this.idxToChar = {};
      this.vocabSize = 0;
      for (let c of Object.keys(this.charToIdx)) {
        this.idxToChar[this.charToIdx[c]] = c;
        ++this.vocabSize;
      }
      this.sampled = [Math.floor(Math.random() * this.vocabSize)];
    }).then(async () => {
      // Give model time to warm up
      for (let i = 0; i < 128; i++) {
        await this._sampleNext();
      }
      await this.sample();
    });
  }

  static weightedRandom(prob) {
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

  async _sampleNext() {
    var input = new Float32Array(1);
    input[0] = this.sampled[this.sampled.length - 1];
    const output = (await this.model.predict({ input })).output;
    const ret = this.constructor.weightedRandom(output);
    this.sampled.push(ret);
    return ret;
  }

  async sample() {
    var ret = [];
    while (true) {
      ret.push(this.idxToChar[await this._sampleNext()]);
      if (ret.slice(-3).join('') === '\n\n\n') {
        break;
      }
    }
    return ret.join('');
  }

  toggleGPU() {
    this.gpu = !this.gpu;
    this.model.toggleGPU(this.gpu);
  }
}

const rnn = new MusicRNN();
rnn.ready.then(() => {
  postMessage({ type: 'ready' });
});

this.onmessage = async function(e) {
  await rnn.ready;
  if (e.data.type === 'sample') {
    const abc = await rnn.sample();
    postMessage({ type: 'song', payload: abc });
  }
  else if (e.data.type === 'toggle-gpu') {
    rnn.toggleGPU();
  }
}
