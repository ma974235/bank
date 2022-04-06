'use strict'
const Controller = require('egg').Controller
class BankController extends Controller { 
  async bank(){ 
    const ctx = this.ctx
    await ctx.render('bank.ejs', { 
      text: '如果沒有帳戶, 輸入即可註冊' 
    })
  }    
  async login(){ 
    const { ctx, service } = this
    let account = ctx.request.body.account
    let password = ctx.request.body.password
    if (account === '' || password === ''){
      await ctx.render('bank.ejs', { 
        text: '麻煩正當輸入您的帳號及密碼, 請勿非法進入' 
      }) 
    } else {
      await service.bank.login(account, password)
    }
  }
  async deposit(){ 
    const { ctx, service } = this
    let money = ctx.request.body.money
    let account = ctx.request.body.account
    if (money === '' || account === ''){
      await ctx.render('bank.ejs', { 
        text: '麻煩重新輸入帳號和密碼, 請勿非法操作'  
      }) 
    } else {
      await service.bank.deposit(account, money)
    }
  }
  async batchDeposit(){ 
    const { ctx, service } = this
    let money = ctx.request.body.money
    let account = ctx.request.body.account
    let number = ctx.request.body.number
    if (money === '' || number === '' || account === ''){
      await ctx.render('bank.ejs', { 
        text: '麻煩重新輸入帳號和密碼, 請勿非法操作' 
      }) 
    } else {
      await service.bank.batchDeposit(account, money, number)
    }
  }
  async withdraw(){ 
    const { ctx, service } = this
    let money = ctx.request.body.money
    let account = ctx.request.body.account
    if (account === '' || money === ''){
      await ctx.render('bank.ejs', { 
        text: '麻煩重新輸入帳號和密碼, 請勿非法操作' 
      }) 
    } else {
      await service.bank.withdraw(account, money)
    }
  }
}

module.exports = BankController
