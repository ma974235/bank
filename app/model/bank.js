'use strict'

module.exports = app => { 
  const { STRING, INTEGER, FLOAT } = app.Sequelize
  const Bank = app.model.define('bank', { 
    id: { type: INTEGER, primaryKey: true, }, 
    account:  STRING(50), 
    password: STRING(50), 
    balance: FLOAT, 
    times: INTEGER
  }, { 
    timestamps: false,  //自动增加创建时间
    tableName: 'bank' //设置表名称
  })
  return Bank
}
