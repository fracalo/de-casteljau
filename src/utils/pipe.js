const pipe = (...arr) => arg =>
  arr.reduce((ac, f) => f(ac), arg)

export default pipe
