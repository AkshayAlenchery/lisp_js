const env = {
  '+': input => input.reduce((a, b) => a + b),
  '-': input => input.length === 1 ? input[0] * -1 : input.reduce((a, b) => a - b),
  '*': input => input.reduce((a, b) => a * b),
  '/': input => input.reduce((a, b) => a / b),
  '>': input => input.reduce((a, b) => a > b),
  '<': input => input.reduce((a, b) => a < b),
  '>=': input => input.reduce((a, b) => a >= b),
  '<=': input => input.reduce((a, b) => a <= b),
  '=': input => input.reduce((a, b) => a === b),
  'pi': Math.PI
}

const numberParser = (jsonInput, match = null) => (match = jsonInput.match(/^-?(0|[1-9][0-9]*)(\.[0-9]+)?((e|E)(-|\+)?[0-9]+)?/)) === null ? null : [match[0] * 1, jsonInput.slice(match[0].length).trim()]

const variableParser = input => {
  const variable = input.slice(0, input.indexOf(' ')).trim()
  if (!variable.match(/^[a-zA-Z]*$/)) return null
  return [variable, input.slice(variable.length).trim()]
}

const findFromEnv = input => (env[input] === undefined) ? null : env[input]

const skipParser = inputExp => {
  if (!inputExp.startsWith('(')) return null
  inputExp = inputExp.slice(1)
  let count = 1
  let valid = '('
  while (count) {
    if (inputExp[0] === '(') count++
    if (inputExp[0] === ')') count--
    valid += inputExp[0]
    inputExp = inputExp.slice(1)
    if (count === 0) break
  }
  return [valid, inputExp.trim()]
}

// const lambdaParser = inputExp => {
//   if (!inputExp.startsWith('lambda')) return null
//   inputExp = inputExp.slice(6).trim()

// }

const quoteParser = inputExp => {
  if (!inputExp.startsWith('quote')) return null
  inputExp = inputExp.slice(5).trim()
  const result = skipParser(inputExp)
  if (!result) return null
  return result
}

const beginParser = inputExp => {
  if (!inputExp.startsWith('begin')) return null
  inputExp = inputExp.slice(5).trim()
  let result
  while (inputExp[0] !== ')') {
    result = lispParser(inputExp)
    if (!result) return null
    inputExp = result[1].trim()
  }
  if (!inputExp.startsWith(')')) return null
  return result
}

const defineParser = inputExp => {
  if (!inputExp.startsWith('define')) return null
  inputExp = inputExp.slice(6).trim()
  const varParseResult = variableParser(inputExp)
  if (!varParseResult) return null
  const variable = varParseResult[0]
  inputExp = varParseResult[1].trim()
  const expResult = lispParser(inputExp)
  if (!expResult) return null
  const value = expResult[0]
  if (!expResult[1].trim().startsWith(')')) return null
  inputExp = expResult[1].slice(1).trim()
  env[variable] = value
  return ['', inputExp]
}

const ifParser = inputExp => {
  if (!inputExp.startsWith('if')) return null
  inputExp = inputExp.slice(2).trim()
  const result = lispParser(inputExp)
  inputExp = result[1].trim()
  if (result[0]) return lispParser(inputExp)
  inputExp = skipParser(inputExp)[1]
  console.log(inputExp)
  if (inputExp[0] === '(') return lispParser(inputExp)
  return ['', inputExp]
}

const operatorParser = inputExp => {
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

const mainParsers = input => {
  if (!input.startsWith('(')) return null
  input = input.slice(1).trim()
  const result = quoteParser(input) || beginParser(input) || defineParser(input) || ifParser(input) || operatorParser(input)
  return result
}

const lispParser = input => {
  input.trim()
  let result = mainParsers(input) || numberParser(input)
  if (result) return result
  result = variableParser(input)
  if (result === null) return null
  return [findFromEnv(result[0]), result[1].trim()]
}

console.log(lispParser('( if ( > 5 10 ) ( * 1 4 ) ( - 2 1 ) )'))
console.log(env)