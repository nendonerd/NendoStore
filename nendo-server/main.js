const http = require("http");
const https = require("https");
const url = require("url");
const fs = require("fs");
const path = require("path");
const router = require("./router");
// const port = process.argv[2] || 8002;
const config = require("./config")(process.env.NODE_ENV);

// module.exports = process.pid

const routing = (pathname, req, res) => {
  if (router[pathname]) {
    router[pathname](req, res);
    return true;
  } else {
    return false;
  }
};

const server = (req, res) => {
  const parsedUrl = url.parse(req.url);

  let pathname = parsedUrl.pathname;

  const contentTypes = {
    ".ico": "image/x-icon",
    ".html": "text/html",
    ".js": "text/javascript",
    ".json": "application/json",
    ".css": "text/css",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".wav": "audio/wav",
    ".mp3": "audio/mpeg",
    ".svg": "image/svg+xml",
    ".pdf": "application/pdf",
    ".doc": "application/msword"
  };

  // routing logic
  let isExist = fs.existsSync(`.${pathname}`);

  if (!routing(pathname, req, res)) {
    if (!isExist) {

      res.statusCode = 404;
      res.end(`File ${pathname} not found`);

    } else {

      fs.readFile(`.${pathname}`, (err, data) => {
        if (err) {
          res.statusCode = 500;
          res.end(`Error getting the file: ${err}`);
        } else {
          let ext = path.parse(`.${pathname}`).ext;
          res.setHeader("Content-type", contentTypes[ext] || "text/plain");
          res.end(data);
        }
      });

    }
  }
};


// redirect all http traffic to HTTPS SERVER
if (config.isHttps) {

  http.createServer((req, res) => {
    console.log('​`${config.hostname}${req.url}`', `${config.hostname}${req.url}`);
    res.writeHead(302, {
      "Location": `${config.hostname}${req.url}`
    })
    res.end('redirect')
  }).listen(config.httpPort);

  console.log(`http server listening at port ${config.httpPort}`);


  const serverOpts = {
    cert: fs.readFileSync(__dirname + "/cert/fullchain.pem"),
    key: fs.readFileSync(__dirname + "/cert/privkey.pem")
  };

  https.createServer(serverOpts, server).listen(config.httpsPort);

  console.log(`https server listening at port ${config.httpsPort}`);

} else {
  http.createServer(server).listen(config.httpPort)
  console.log(`http server listening at port ${config.httpPort}`)
}


// to-do list:
// 1. move cert to local
// 2. forward http to https
// 3. add an exit command & start command
// 3. show status in cli
// 4. summary nodejs doc
// 5. read git doc

// 5. refactor code to nendo-store
// 5. integrate mongodb & puppeteer
// 6. writing vue
// 7. build data structure
// 8. read vue doc


// setting CORS headers
/*
  // Website you wish to allow to connect
  response.setHeader('Access-Control-Allow-Origin', '*');

  // Request methods you wish to allow
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  // Request headers you wish to allow
  response.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  response.setHeader('Access-Control-Allow-Credentials', true);
*/
