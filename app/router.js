'use strict'
module.exports = app => {
  const { router, controller } = app 
  router.get('/bank', controller.bank.bank)
  router.post('/bank/login', controller.bank.login)
  router.post('/bank/atm/deposit', controller.bank.deposit)
  router.post('/bank/atm/batchdeposit', controller.bank.batchDeposit)
  router.post('/bank/atm/withdraw', controller.bank.withdraw)
}
