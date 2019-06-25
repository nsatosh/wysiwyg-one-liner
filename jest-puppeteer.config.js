module.exports = {
  launch: {
    dumpio: true,
    headless: process.env.HEADLESS !== 'false',
  },
  server: {
    command: 'npx parcel tests/assets/index.html --port 8080',
    port: 8080,
    launchTimeout: 10000,
    debug: true,
  },
}