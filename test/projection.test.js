require('dotenv').config()

const { 
  projection,
  isInclude
} = require('../lib/projection')

describe('isInclude', () => {
  it ('should return true for a simple include projection', async () => {
    let project = { a: 1 }
    expect(isInclude(project)).toBe(true)
  })
  it ('should return false for a simple exclude projection', async () => {
    let project = { a: 0 }
    expect(isInclude(project)).toBe(false)
  })
  it ('should default to true', async () => {
    let project = { a: { "$elemMatch": { school: 102 } } }
    expect(isInclude(project)).toBe(true)
  })
})

describe('include', () => {
  it ('should include a single field', async () => {
    let docs = [ { a: "hello", b: "world" } ]
    let project = { a: 1 }
    let result = docs.map(projection(project))
    expect(result).toEqual([ { a: "hello" } ])
  })
  it ('should include multiple fields', async () => {
    let docs = [ { a: "hello", b: "world", c: "foo", d: "bar" } ]
    let project = { a: 1, c: 1 }
    let result = docs.map(projection(project))
    expect(result).toEqual([ { a: "hello", c: "foo" } ])
  })
})

describe('exclude', () => {
  it ('should exclude a single field', async () => {
    let docs = [ { a: "hello", b: "world" } ]
    let project = { a: 0 }
    let result = docs.map(projection(project))
    expect(result).toEqual([ { b: "world" } ])
  })
  it ('should exclude multiple fields', async () => {
    let docs = [ { a: "hello", b: "world", c: "foo", d: "bar" } ]
    let project = { a: 0, c: 0 }
    let result = docs.map(projection(project))
    expect(result).toEqual([ { b: "world", d: "bar" } ])
  })
})

describe('slice', () => {
  it ('should return first n values of array', async () => {
    let docs = [ { a: [ 1, 2, 3, 4, 5 ]} ]
    let project = { a: { "$slice": 2 } }
    let result = docs.map(projection(project))
    expect(result).toEqual([ { a: [ 1, 2 ] } ])
  })
  it ('should return last n values of array', async () => {
    let docs = [ { a: [ 1, 2, 3, 4, 5 ]} ]
    let project = { a: { "$slice": -2 } }
    let result = docs.map(projection(project))
    expect(result).toEqual([ { a: [ 4, 5 ] } ])
  })
  it ('should return using skip and limit', async () => {
    let docs = [ { a: [ 1, 2, 3, 4, 5 ]} ]
    let project = { a: { "$slice": [ 1, 3 ] } }
    let result = docs.map(projection(project))
    expect(result).toEqual([ { a: [ 2, 3, 4 ] } ])
  })
  it ('should throw if only one arg supplied to skip and limit', async () => {
    let docs = [ { a: [ 1, 2, 3, 4, 5 ]} ]
    let project = { a: { "$slice": [ 1 ] } }
    let error = null
    try {
      docs.map(projection(project))
    } catch (err) {
      error = err
    }
    expect(error).toBeTruthy()
    expect(error.message).toMatch(/Invalid argument to \$slice operator:/)
  })
  it('should throw if non-numberical value supplied', async () => {
    let docs = [ { a: [ 1, 2, 3, 4, 5 ]} ]
    let project = { a: { "$slice": "badval" } }
    let error = null
    try {
      docs.map(projection(project))
    } catch (err) {
      error = err
    }
    expect(error).toBeTruthy()
    expect(error.message).toMatch(/Invalid argument to \$slice operator:/)
  })
})

describe('elemMatch', () => {
  it ('should return first matching simple equality', async () => {
    let docs = [ { a: [  { n: 1 }, { n: 2 }, { n: 3 } ] } ]
    let project = { a: { "$elemMatch": { n: 2 } } }
    let result = docs.map(projection(project))
    expect(result).toEqual([ { a: [ { n: 2 } ] } ])
  })
  it ('should return first matching using query operator', async () => {
    let docs = [ { a: [  { n: 1 }, { n: 2 }, { n: 3 } ] } ]
    let project = { a: { "$elemMatch": { n: { "$gte": 2 } } } }
    let result = docs.map(projection(project))
    expect(result).toEqual([ { a: [ { n: 2 } ] } ])
  })
  it ('should return empty if no match', async () => {
    let docs = [ { a: [  { n: 1 }, { n: 2 }, { n: 3 } ] } ]
    let project = { a: { "$elemMatch": { n: 4 } } }
    let result = docs.map(projection(project))
    expect(result).toEqual([ { a: [ ] } ])
  })
})