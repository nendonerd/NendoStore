const readline = require('readline')
const events = require('events')
const http = require('http')
const https = require('https')
const StringDecoder = require('string_decoder').StringDecoder
const decoder = new StringDecoder('utf-8')
const config = require('./config')(process.env.NODE_ENV)
const { spawn } = require('child_process')
const path = require('path')
const fsP = require('fs').promises

class myEvent extends events {}

let e = new myEvent()

let validInputs = ['exit', 'start', 'status', 'pid']

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: 'pleaseTypeShit >'
})

rl.prompt()


rl.on('line', str => {
  // console.log(str)
  if (validInputs.includes(str)) {
    // console.log('congrats!')
    // console.log(str)
    e.emit(str, str)
    // console.log('event invoked')
  } else {
    console.log('stupid shit')
  }

  rl.prompt()
})



e.on('pid', (callback) => {
  // console.log('running')
  let fetch = res => {
    // res.setEncoding('utf8')
    let buffer = ''
    res.on('data', data => {
      buffer += decoder.write(data)
    })
    res.on('end', () => {
      buffer += decoder.end()
      config.pid = buffer
      console.log(config.pid)

      // storing pid for err recovery
      // fsP.writeFile('./errHandling/prevPid.tmp', config.pid, 'w')

      if (typeof callback == 'function') {callback()}
      rl.prompt()
    })

  }
  if (config.isHttps) {
    https.get(`${config.hostname}/pid`, fetch)
  } else {
    http.get(`${config.hostname}/pid`, fetch)
  }


})

e.on('exit', () => {
  process.kill(config.pid)
  console.log('node server closed')
  // process.exit(0)
  rl.prompt()
})

e.on('start', () => {
  try {
    spawn(`NODE_ENV=${config.envName} node ${path.join(__dirname, 'main.js')} &`, {detached: true, shell: true})
  } catch (err) {
    console.log(err)
    // if error, set config.pid to prevPid.tmp
    // fsP.readFile('./errHandling/prevPid.tmp', {encoding: 'utf8'})
    //   .then(prevPid => config.pid = prevPid)
  }
  setTimeout(() => e.emit('status'), 200)
})

e.on('status', () => {

  let callback = () => {
    drawRow('SERVER  STATUS')
    console.log('')
    console.log('NODE PID:'.padStart(15, ' ').padEnd(50, ' ') + config.pid)
    console.log('')
    drawRow(`${new Date().toDateString()}`)
  }

  if(config.pid == '') {e.emit('pid', callback)}
  else { callback(); rl.prompt()}

})

// rl.on('close', () => {
//   if (config.pid != '') {
//     process.kill(config.pid)
//     console.log('node server closed')
//   }
// })


function drawRow(msg) {
  let width = process.stdout.columns
  console.log('-'.repeat(width))
  console.log('')
  console.log(msg.padStart(Math.round(width/2 + msg.length/2), ' '))
  console.log('')
  console.log('-'.repeat(width))
}

// process.on('uncaughtException', err => {
//   // write err & pid to temp file
//   let msg = {
//     err,
//     pid: config.pid
//   }
//   fsP.writeFile('./errHandling/errMsg.tmp', msg, 'w')
// })