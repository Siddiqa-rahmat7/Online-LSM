// Async route mein error aaye to Express ke error handler tak pahunchata hai
module.exports = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);