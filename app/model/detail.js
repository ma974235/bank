'use strict'

module.exports = app => { 
  const { STRING, INTEGER, TEXT, FLOAT } = app.Sequelize
  const Detail = app.model.define('detail', { 
    id: { type: INTEGER, primaryKey: true }, 
    account:  STRING(50), 
    category: STRING(50), 
    balance: FLOAT, 
    total: FLOAT, 
    time: TEXT, 
  }, { 
    timestamps: false,  //自动增加创建时间
    tableName: 'detail' //设置表名称
  })
  return Detail  
}