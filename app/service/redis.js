'use strict'
const Service = require('egg').Service

class RedisService extends Service {  
  async sqlBackup() { 
    const { app, ctx } = this
    let key = await app.redis.lpop('detailAccount')
    if (key !== null){ 
      let password = await app.redis.hget(key, 'password')
      let balance = await app.redis.hget(key, 'balance')
      let times = await app.redis.hget(key, 'times')      
      let accountData = { 
        account: key, 
        password: password, 
        balance: balance, 
        times: times
      }
      await ctx.model.Bank.create(accountData)
    }
    let detail = await app.redis.llen('detail')
    let arr = []
    if (detail !== 0){ 
      for (let x = 0; x < detail; x++){ 
        let data = await app.redis.lpop('detail')
        let account = await app.redis.hget(data, 'account')
        let category = await app.redis.hget(data, 'category')
        let balance = await app.redis.hget(data, 'balance')
        let total = await app.redis.hget(data, 'total')
        let time = await app.redis.hget(data, 'time')
        let detailData = { 
          account: account, 
          category: category, 
          balance: balance, 
          total: total, 
          time: time
        } 
        arr.push(detailData)
      }
      let change = await app.redis.scard('change')
      for (let i = 0; i < change; i++){ 
        let account = await app.redis.spop('change')
        let password = await app.redis.hget(account, 'password')
        let balance = await app.redis.hget(account, 'balance')
        let times = await app.redis.hget(account, 'times')
        let bank = { 
          account: account, 
          password: password, 
          balance: balance, 
          times: times
        }
        await ctx.model.Bank.upsert(bank)
      }
      await ctx.model.Detail.bulkCreate(arr)
    }
  }
  async redisBackup(account){ 
    const { app, ctx } = this
    let redis = await app.redis.hget(account, 'times')
    let sql = await ctx.model.Bank.findOne({ 
      where: { 
        'account': account
      }
    })
    if (sql !== null){ 
      if (sql['times'] > redis){ 
        await app.redis.hset(account, 'account', sql['account'])
        await app.redis.hset(account, 'password', sql['password'])
        await app.redis.hset(account, 'balance', sql['balance'])
        await app.redis.hset(account, 'times', sql['times'])
      } 
    } else { 
      let password = await app.redis.hget(account, 'password')
      let balance = await app.redis.hget(account, 'balance')
      let times = await app.redis.hget(account, 'times')

      let bank = { 
        account: account, 
        password: password, 
        balance: balance, 
        times: times
      }      
      await ctx.model.Bank.create(bank)
    }
  }
  async redisAccount(account){ 
    const { app, ctx } = this
    let sql = await ctx.model.Bank.findOne({ 
      where: { 
        'account': account
      }
    })
    await app.redis.hset(account, 'account', sql['account'])
    await app.redis.hset(account, 'password', sql['password'])
    await app.redis.hset(account, 'balance', sql['balance'])
    await app.redis.hset(account, 'times', sql['times'])  
    await app.redis.sadd('account', account)
  }
}
module.exports = RedisService
