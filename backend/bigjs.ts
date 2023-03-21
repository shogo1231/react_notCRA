import Big from 'big.js';

function add(base: number, trgt: number) {
  const a = new Big(base)
  const b = a.plus(trgt)
  const result = b.toNumber()
  return result;
}

function subtract(base: number, trgt: number) {
  const a = new Big(base)
  const b = a.minus(trgt)
  const result = b.toNumber()
  return result;
}

function times(base: number, trgt: number) {
  const a = new Big(base)
  const b = a.times(trgt)
  const result = b.toNumber()
  return result;
}

function div(base: number, trgt: number) {
  const a = new Big(base)
  const b = a.div(trgt)
  const result = b.toNumber()
  return result;
}

// 四捨五入 桁がマイナスなら整数部分が該当
function round (num: number, digit: number) {
  let trgtNum = new Big(num);
  return trgtNum.round(digit, Big.roundHalfUp).toNumber();
}

// 切り上げ 桁がマイナスなら整数部分が該当
function roundUp (num: number, digit: number) {
  let trgtNum = new Big(num);
  return trgtNum.round(digit, Big.roundHalfUp).toNumber();
}

// 切り捨て 桁がマイナスなら整数部分が該当
function trunc (num: number, digit: number) {
  let trgtNum = new Big(num);
  return trgtNum.round(digit, Big.roundHalfUp).toNumber();
}

export {
  add,
  subtract,
  times,
  div,
  round,
  roundUp,
  trunc,
}