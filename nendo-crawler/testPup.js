// const puppeteer = require('puppeteer');

// (async() => {
// const browser = await puppeteer.launch();
// const page = await browser.newPage();
// await page.goto('https://www.taobao.com', {waitUntil: 'networkidle2'});
// await page.screenshot({path: 'page.png', fullPage: true});

// await browser.close();
// })();

const puppeteer = require("puppeteer");

function wait(ms) {
  return new Promise(resolve => setTimeout(() => resolve(), ms));
}

async function capture(url) {
  // Load the specified page
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1920, height: 1080 }
  });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "load" });

  // Get the height of the rendered page
  const bodyHandle = await page.$("body");
  const { height } = await bodyHandle.boundingBox();
  await bodyHandle.dispose();

  // Scroll one viewport at a time, pausing to let content load
  const viewportHeight = page.viewport().height;
  let viewportIncr = 0;
  while (viewportIncr + viewportHeight < height) {
    await page.evaluate(_viewportHeight => {
      window.scrollBy(0, _viewportHeight);
    }, viewportHeight);
    await wait(100);
    viewportIncr = viewportIncr + viewportHeight;
  }

  // Scroll back to top
  await page.evaluate(_ => {
    window.scrollTo(0, 0);
  });

  // Some extra delay to let images load
  await wait(200);

  const lis = await page.$$('li[style*="width:244px;"]');

  const imgs = await Promise.all(lis.map(li => li.$("img")));

  const imgSrcs = await Promise.all(imgs.map(img =>
    img.getProperty("src").then(src => src.jsonValue())
  ))

  const details = await Promise.all(
    lis.map(li => li.$eval("p:nth-child(2) > a", node => node.innerText))
  );

  const prices = await Promise.all(
    lis.map(li => li.$eval("p:nth-child(4)", node => node.innerText))
  );

  const infos = []

  for (let i = 0; i < imgSrcs.length; i++) {
    infos.push({
      src: imgSrcs[i],
      detail: details[i],
      price: prices[i]
    })
  }

  console.log(infos)

  // write infos into database

  // await page.screenshot({ path: "page.png", fullPage: true });

  await browser.close();
}

capture("https://goodsmile.tmall.com/");
