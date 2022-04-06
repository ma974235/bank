'use strict'
const sd = require('silly-datetime')
const Service = require('egg').Service
class BankService extends Service { 
  async login(account, password) { 
    const { ctx, app, service } = this
    let check = await app.redis.sismember('account', account)
    if (check){ 
      let hashPassword = await app.redis.hget(account, 'password')
      if (password != hashPassword){ 
        await ctx.render('bank.ejs', { 
          text: '密碼錯誤, 請重新輸入'  
        }) 
      } else { 
        let balance = await app.redis.hget(account, 'balance')
        await service.redis.redisBackup(account)
        await ctx.render('atm.ejs', { 
          text: '目前餘額有' + balance + '元', 
          account: account, 
          show: false, 
          batch: false
        })
      }
    } else { 
      let sqlCheck = await ctx.model.Bank.findOne({ 
        where: { 
          'account': account
        } 
      })
      if (sqlCheck === null){ 
        await app.redis.sadd('account', account)
        await app.redis.hset(account, 'account', account) 
        await app.redis.hset(account, 'password', password)
        await app.redis.hset(account, 'balance', 0) 
        await app.redis.hset(account, 'times', 0)
        await app.redis.rpush('detailAccount', account)
        await ctx.render('bank.ejs', { 
          text: '註冊成功, 請再次輸入您的帳戶資訊' 
        }) 
      } else { 
        await this.service.redis.redisAccount(account)
        await this.login(account, password)
      }
    }
  }
  async deposit(account, money){ 
    const { ctx, app } = this
    let times = await app.redis.hget(account, 'times')
    let balance = await app.redis.hincrbyfloat(account, 'balance', money)    
    let total = (parseFloat(balance)).toFixed(4)
    let updateTime = sd.format(new Date(), 'YYYY-MM-DD HH:mm:ss')
    await app.redis.hset(account + times, 'account', account)
    await app.redis.hset(account + times, 'category', 'deposit')
    await app.redis.hset(account + times, 'balance', money)
    await app.redis.hset(account + times, 'time', updateTime)
    await app.redis.hincrby(account, 'times', 1)
    let check = await app.redis.hget(account, 'times')
    if (parseInt(check) === parseInt(times) + 1){ 
      await app.redis.sadd('change', account)
      await app.redis.rpush('detail', account + times)
      await app.redis.hset(account + times, 'total', total)
      await ctx.render('atm.ejs', { 
        money: '存款金額: ' + money, 
        total: '總金額: ' + total, 
        time: '存款時間: ' + updateTime, 
        accounts: '帳號: ' + account, 
        category: '交易類型: 存款', 
        result: '存款成功', 
        account: account, 
        show: true, 
        batch: false
      }) 
    } else { 
      await app.redis.hincrby(account, 'times', -1)
      await app.redis.hincrbyfloat(account, 'balance', -money)    
      await this.service.bank.deposit(account, money)
    } 
  }
  async batchDeposit(account, money, number){ 
    const { ctx, app } = this
    let total = new Array(number)
    let time = new Array(number)
    let check = await app.redis.hget(account, 'times')
    for (let i = 0; i < number; i++){ 
      await app.redis.hincrby(account, 'times', 1)
      let times = await app.redis.hget(account, 'times')
      let plus = await app.redis.hincrbyfloat(account, 'balance', money)
      let updateTime = sd.format(new Date(), 'YYYY-MM-DD HH:mm:ss')
      total[i] = new Array('總金額: ' + plus)
      time[i] = new Array('存款時間: ' + updateTime)
      await app.redis.hset(account + times, 'account', account)
      await app.redis.hset(account + times, 'category', 'deposit')
      await app.redis.hset(account + times, 'balance', money)
      await app.redis.hset(account + times, 'total', plus)
      await app.redis.hset(account + times, 'time', updateTime)
    }
    let times = await app.redis.hget(account, 'times')
    if (parseInt(times) === (parseInt(check) + parseInt(number))){ 
      await app.redis.sadd('change', account)
      let temp = parseInt(check)
      while (temp < parseInt(times)){ 
        temp = temp + 1
        await app.redis.rpush('detail', account + temp)
      }
      await ctx.render('atm.ejs', { 
        times: number, 
        money: '存款金額: ' + money, 
        total: total, 
        time: time, 
        accounts: '帳號: ' + account, 
        category: '交易類型: 存款', 
        result: '存款成功', 
        account: account, 
        show: true, 
        batch: true
      })
    } else { 
      await app.redis.hincrby(account, 'times', -number)
      await app.redis.hincrbyfloat(account, 'balance', -money * number)    
      await this.service.bank.batchDeposit(account, money, number)
    }
  }
  async withdraw(account, money){ 
    const { ctx, app } = this
    let balance = await app.redis.hget(account, 'balance')
    let updateTime = sd.format(new Date(), 'YYYY-MM-DD HH:mm:ss')
    if (money > balance){ 
      await ctx.render('atm.ejs', { 
        money: '提款金額: ' + money, 
        total: '總金額: ' + balance, 
        time: '提款時間: ' + updateTime, 
        accounts: '帳號: ' + account, 
        category: '交易類型: 提款', 
        result: '提款失敗, 餘額不足',  
        account: account, 
        show: true, 
        batch: false
      }) 
    } else { 
      let times = await app.redis.hget(account, 'times')
      let withdraw = await app.redis.hincrbyfloat(account, 'balance', -money)    
      let total = (parseFloat(withdraw)).toFixed(4)
      await app.redis.hset(account + times, 'account', account)
      await app.redis.hset(account + times, 'category', 'withdraw')
      await app.redis.hset(account + times, 'balance', money)
      await app.redis.hset(account + times, 'time', updateTime)
      await app.redis.hincrby(account, 'times', 1)
      let check = await app.redis.hget(account, 'times')
      if (parseInt(check) === parseInt(times) + 1){ 
        await app.redis.sadd('change', account)
        await app.redis.rpush('detail', account + times)
        await app.redis.hset(account + times, 'total', total)
        await ctx.render('atm.ejs', { 
          money: '存款金額: ' + money, 
          total: '總金額: ' + total, 
          time: '存款時間: ' + updateTime, 
          accounts: '帳號: ' + account, 
          category: '交易類型: 提款', 
          result: '存款成功', 
          account: account, 
          show: true, 
          batch: false
        }) 
      } else { 
        await app.redis.hincrby(account, 'times', -1)
        await app.redis.hincrbyfloat(account, 'balance', money)    
        await this.service.bank.withdraw(account, money)
      } 
    }
  }
}

module.exports = BankService
