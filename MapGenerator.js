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

    this.colorEnum = [
      { index: 0, name: "red", rgba: "rgba(255, 0, 0, 0.5)" },
      { index: 1, name: "green", rgba: "rgba(0, 255, 0, 0.5)" },
      { index: 2, name: "yellow", rgba: "rgba(255, 255, 0, 0.5)" },
      { index: 3, name: "blue", rgba: "rgba(0, 0, 255, 0.5)" }
    ]

    return this;
  }
  on(event, callback) {
    this.emitter.on(event, callback);
  }
  once(event, callback) {
    this.emitter.once(event, callback);
  }

  convertCoords(x, y, center) {
    // width: 2000, height: 2000; r/place at stage 3 - x4 for 8k
    return (!center) ? [ x * 4, y * 4 ] : [ x * 4 + 2, y * 4 + 2];
  }
  getColor(pixel) {
    let trophy = (pixel.trophies.length > 0) ? pixel.trophies[0] : -1;
    return this.colorEnum[trophy + 1];
  }

  generateMap(data) {
    const canvas = createCanvas(8000, 8000);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, 8000, 8000); // black background
    ctx.globalAlpha = 0.5;
    ctx.drawImage(this.image, 0, 0, 8000, 8000); // resulting in dark tintent image

    ctx.globalAlpha = 1;
    for (let i = 0; i < data.pixels.length; i++) {
      ctx.save();
      ctx.beginPath();
      ctx.fillStyle = this.getColor(data.pixels[i]).rgba;
      ctx.strokeStyle = this.getColor(data.pixels[i]).name;

      ctx.arc(...this.convertCoords(data.pixels[i].x, data.pixels[i].y, true), 30, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.fill();

      ctx.fillStyle = "black";
      ctx.fillRect(...this.convertCoords(data.pixels[i].x, data.pixels[i].y), 4, 4);
      ctx.stroke();

      ctx.closePath();
      ctx.restore();
    }

    const buffer = canvas.toBuffer("image/png");
    return buffer;
    fs.writeFileSync("./test.png", buffer);
  }
}

module.exports = MapGenerator;
