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

    let trophies = [];
    let trophyCounts = [0, 0, 0];
    pixels.filter(pixel => pixel.trophies.length > 0).map(el => {
      el.trophies.forEach(trophy => {
        if (!trophies.includes(trophy)) {
          trophies.push(trophy);
        }
        trophyCounts[trophy]++;
      });
      //trophies.push(...el.trophies);
      return el;
    });
    trophies.sort().filter((trophy, pos, arr) => { // remove duplicate trophies
      return !pos || trophy != arr[pos - 1];
    });

    return {
      hash: hash,
      pixels: pixels,
      trophies: trophies,
      trophyPixels: trophyCounts,
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

  async getResults(username, trophies, iterations=0) {
    let text = await this.getSiteContents("http://kisielo85.cba.pl/place2022/raw_result.php?nick=" + username + "&tr=" + (trophies ? "true" : "false"));
    switch (text) {
      case "request_sent":
      case "processing":
        if (this.states[username] != text) {
          this.emitter.emit("statusUpdate", { user: username, status: text });
          this.states[username] = text;
        }
        return (iterations < 70) ? new Promise(async (res, rej) => {
          setTimeout(async () => {
            res(await this.getResults(username, trophies, ++iterations));
          }, 1000);
        }) : { status: -1, data: "database_not_responding" };
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
  requestData(username, trophies) {
    return new Promise(async (res, rej) => {
      this.states[username] = "init";
      let data = await this.getResults(username, trophies);
      this.emitter.emit("data", data.data);

      if (data.status <= 0) return rej(data);
      res(data);
    });
  }
}

module.exports = {
  PixelFinder,
  PixelDataConverter
}
