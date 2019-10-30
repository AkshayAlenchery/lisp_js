const numberParser = (jsonInput, match = null) => (match = jsonInput.match(/^-?(0|[1-9][0-9]*)(\.[0-9]+)?((e|E)(-|\+)?[0-9]+)?/)) === null ? null : [match[0] * 1, jsonInput.slice(match[0].length).trim()]

const env = {
  '+': input => input.reduce((a, b) => a + b),
  '-': input => input.length === 1 ? input[0] * -1 : input.reduce((a, b) => a - b),
  '*': input => input.reduce((a, b) => a * b),
  '/': input => input.reduce((a, b) => a / b),
  '>': input => input.reduce((a, b) => a > b)
}

const operatorParser = inputExp => {
  if (!inputExp.startsWith('(')) return null
  inputExp = inputExp.slice(1).trim()
  const op = inputExp[0]
  const operands = []
  if (!env[op]) return null
  inputExp = inputExp.slice(1).trim()
  let operand
  while (inputExp[0] !== ')') {
    if (!(operand = lispParser(inputExp))) return null
    operands.push(operand[0])
    inputExp = operand[1].trim()
  }
  return [env[op](operands), inputExp.slice(1).trim()]
}

const lispParser = input => {
  input.trim()
  const result = operatorParser(input) || numberParser(input)
  return result
}

console.log(lispParser('(+ 2 3 (* 4 5 (/ 6 3)) (- 4 2))')[0])