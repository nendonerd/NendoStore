const config = require("./config")(process.env.NODE_ENV)

module.exports = {
  "/": (req, res) => {
    res.writeHead(302, {
      "Location": `${config.hostname}/index.html`
    })
    res.end('redirect')
  },
  "/pid": (req, res) => {
    res.end(process.pid + '')
  }
}