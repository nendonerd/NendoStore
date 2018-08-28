module.exports = env => {
  switch(env) {
    case "production":
      return {
        envName: 'production',
        isHttps: true,
        hostname: "https://nendo.ml",
        httpPort: 80,
        httpsPort: 443,
        pid: '',
        static: './static'

      }
      break;
    default:
      return {
        envName: 'dev',
        isHttps: false,
        hostname: "http://localhost:8005",
        httpPort: 8005,
        httpsPort: 8006,
        pid: '',
        static: './static'
      }
  }
}