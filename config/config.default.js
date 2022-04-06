'use strict'

module.exports = appInfo => {

  const config = exports = { }

  config.keys = appInfo.name + '_1645422226593_2394'
  exports.ipHeaders = 'X-Real-Ip, X-Forwarded-For'
  const userConfig = {
  }
  exports.view = {
    defaultViewEngine: 'nunjucks', 
    mapping: {
      '.ejs': 'ejs', 
    }, 
  }

  exports.sequelize = {
    dialect: 'mysql', 
    host: '127.0.0.1', 
    port: '3306', 
    user: 'root', 
    password: 'ma974232', 
    database: 'bank',
  }
  config.security = {
    csrf: {
      enable: false, 
      ignoreJSON: true
    },   
  }
  config.redis = {
    client: {
      port: 6379,          // Redis port
      host: '127.0.0.1',   // Redis host
      password: '', 
      db: 0
    }
  }
  config.cors = {
    origin: '*', 
    allowMethods: 'GET, HEAD, PUT, POST, DELETE, PATCH'
  }
  config.proxy = true
  config.httpproxy = {
    '/api': {
      target: 'http://127.0.0.1:7001', 
      changeOrigin: true, 
      secure: false, 
      pathRewrite: {
          '^/api': '/'  }
      }
    }
  config.cluster = {
    listen: {
      port: 7001, 
      hostname: '0.0.0.0', 
    }, 
  }
  return {
    ...config, 
    ...userConfig, 
  }
}
