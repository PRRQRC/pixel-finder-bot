const { PixelFinder } = require("./PixelFinder");


const finder = new PixelFinder();
finder.on("statusUpdate", (data) => {
  console.log(data);
});

finder.requestData("ShadowLp174").then((data) => {
  console.log(finder.convert(data.data));
}).catch(err => {
  console.log(err);
});
