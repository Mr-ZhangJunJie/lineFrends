const betaConfig = require('./beta.js')
const localConfig = require('./location.js')
const proConfig = require('./prod.js')
let env = process.env.VUE_APP_ENV
let config = null
console.log('process.env:', env);

if (env == 'development') {
  config = localConfig
} else if (env == 'staging') {
  config = betaConfig
} else {
  config = proConfig
}

module.exports = config;
