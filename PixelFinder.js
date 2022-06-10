const EventEmitter = require("events");
const fetch = require("node-fetch");

class PixelDataConverter {
  constructor() {    
    this.trophyEnum = [
      { index: 0, name: "first placer" },
      { index: 1, name: "final canvas" },
      { index: 2, name: "endgame" }
    ];

    return this;
  }

  convertPixel(pixelString) {
    pixelString = pixelString.replace(".").split(";");
    return {
      date: Date.parse(pixelString[0]),
      x: parseInt(pixelString[1]),
      y: parseInt(pixelString[2]),
      color: pixelString[3],
      trophies: JSON.parse(pixelString[4])
    }
  }
  convert(data) {
    data = data.split(".");

    let hash = data[0];
    let pixels = data.slice(1, data.length - 1); // remove _end_
    pixels = pixels.map(pixel => this.convertPixel(pixel));
    let trophies = pixels.filter(pixel => pixel.trophies.length > 0);

    return {
      hash: hash,
      pixels: pixels,
      trophies: trophies,
      pixelCount: pixels.length
    }
  }
}

class PixelFinder extends PixelDataConverter {
  constructor() {
    super();

    this.emitter = new EventEmitter();

    this.states = {};

    return this;
  }
  on(event, callback) {
    this.emitter.on(event, callback);
  }
  once(event, callback) {
    this.emitter.once(event, callback);
  }
  emit(event, data) {
    this.emitter.emit(event, data);
  }

  getSiteContents(url) {
    return new Promise((res, rej) => {
      fetch(url).then((r) => {
        r.text().then(text => {
          res(text);
        })
      })
    });
  }

  async getResults(username) {
    let text = await this.getSiteContents("http://kisielo85.cba.pl/place2022/raw_result.php?nick=" + username);
    switch (text) {
      case "request_sent":
      case "processing":
        if (this.states[username] != text) {
          this.emitter.emit("statusUpdate", { user: username, status: text });
          this.states[username] = text;
        }
        return new Promise(async (res, rej) => {
          setTimeout(async () => {
            res(await this.getResults(username));
          }, 1000);
        });
      break;
      case "not_found":
        delete this.states[username];
        return { status: 0, reason: "not_found" };
      break;
      default:
        delete this.states[username];
        return { status: 1, data: text };
      break;
    }
  }
  requestData(username) {
    return new Promise(async (res, rej) => {
      this.states[username] = "init";
      let data = await this.getResults(username);
      this.emitter.emit("data", data.data);

      if (data.status == 0) return rej(data);
      res(data);
    });
  }
}

module.exports = {
  PixelFinder,
  PixelDataConverter
}