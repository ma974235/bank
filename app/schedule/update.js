exports.schedule = { 
  type: 'worker', 
  interval: '1s', 
  immediate: true, 
}
exports.task = async function (ctx) {
  await ctx.service.redis.sqlBackup()
}
