const { createCanvas, loadImage } = require('canvas');
const EventEmitter = require("events");
const fs = require("fs");

class MapGenerator {
  constructor() {
    this.emitter = new EventEmitter();

    loadImage("./data/placemap8k.png").then(image => {
      this.image = image;
      this.emitter.emit("load");
    });

    return this;
  }
  on(event, callback) {
    this.emitter.on(event, callback);
  }
  once(event, callback) {
    this.emitter.once(event, callback);
  }

  convertCoords(x, y) {
    // width: 2000, height: 2000; r/place at stage 3
    return [ x * 4, y * 4 ];
  }

  generateMap(data) {
    const canvas = createCanvas(8000, 8000);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, 8000, 8000); // black background
    ctx.globalAlpha = 0.5;
    ctx.drawImage(this.image, 0, 0, 8000, 8000); // resulting in dark tintent image

    ctx.globalAlpha = 1;
    ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
    ctx.strokeStyle = "red";
    for (let i = 0; i < data.pixels.length; i++) {
      ctx.save();
      ctx.beginPath();

      ctx.arc(...this.convertCoords(data.pixels[i].x, data.pixels[i].y), 30, 0, 2 * Math.PI);
      ctx.stroke();

      ctx.fill();

      ctx.closePath();
      ctx.restore();
    }

    const buffer = canvas.toBuffer("image/png");
    return buffer;
    fs.writeFileSync("./test.png", buffer);
  }
}

module.exports = MapGenerator;
