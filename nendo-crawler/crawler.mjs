const axios = require("axios");
const jsdom = require("jsdom");
const JSDOM = jsdom.JSDOM;

// class CustomResourceLoader extends jsdom.ResourceLoader {
//   fetch(url, options) {
//     // Override the contents of this script to do something unusual.
//     if (!url.contains('http')) {
//       url = 'http' + url
//       return super.fetch(url, options);
//     } else {
//       return super.fetch(url, options)
//     }
//   }
// }

// const resourceLoader = new jsdom.ResourceLoader({
//   proxy: "http://127.0.0.1:10001",
//   strictSSL: false,
//   // userAgent: "Mellblomenator/9000"
// });

console.log("loaded");
axios
  .get("https://goodsmile.tmall.com/")
  .then(res => res.data)
  .then(
    html =>
      new JSDOM(html, {
        resources: "usable",
        runScripts: "dangerously",
        pretendToBeVisual: true
      }).window.document
  )
  .then(doc => doc.querySelectorAll("img[width='244']"))
  .then(imgs => console.log(imgs[0]["data-ks-lazyload-custom"]));
