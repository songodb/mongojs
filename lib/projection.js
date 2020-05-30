const jessy = require('jessy')
const nessy = require('nessy')
const finicky = require('finicky')
const sift = require('sift')

function projection(project) {
  return doc => {
    let startdoc = isInclude(project) && { } || JSON.parse(JSON.stringify(doc))
    let projected = Object.keys(project).reduce((projected, key) => {
      return field(projected, doc, [ ], key, project[key])
    }, startdoc)
    return projected
  }
}

function isInclude(project) {
  for (let val of Object.values(project)) {
    if (val === 1) { 
      return true
    } else if (val === 0) {
      return false
    }
  }
  return true // default is include
}

function field(projected, doc, path, key, val) {
  let keypath = path.concat([ key ]).join('.')
  if (val === 1) {
    nessy(keypath, jessy(keypath, doc), '.', projected)
  } else if (val === 0) {
    // finicky returns new doc with field deleted
    // does not mutate given doc
    projected = finicky(keypath, projected) 
  } else if (typeof val === 'object') {
    projected = operators(projected, doc, path.concat([ key ]), val)
  } else {
    throw new Error(`Invalid value: ${JSON.stringify(val)}`)
  }
  return projected
}

function operators(projected, doc, path, ops) {
  return Object.keys(ops).reduce((projected, op) => {
    switch (op) {
      case "$": // Projects the first element in an array that matches the query condition.
        throw new Error(`Not implemented: ${op}`)
      case "$elemMatch": // Projects the first element in an array that matches the specified $elemMatch condition.
        return elemMatch(projected, doc, path, ops[op])
      case "$meta": // Projects the document’s score assigned during $text operation.
        throw new Error(`Not implemented: ${op}`)
      case "$slice": // Limits the number of elements projected from an array. Supports skip and limit slices.
        return slice(projected, doc, path, ops[op])
      default: //
        throw new Error(`Unsupported operation: ${op}`)
    }
  }, projected)
}

function elemMatch(projected, doc, path, val) {
  let keypath = path.join('.')
  let arr = jessy(keypath, doc)
  if (!Array.isArray(arr)) {
    // not sure how mongo handles this
  }
  let first = arr.find(sift(val))
  let result = first && [ first ] || [ ]
  nessy(keypath, result , '.', projected)
  return projected
}

function slice(projected, doc, path, val) {
  let keypath = path.join('.')
  let arr = jessy(keypath, doc)
  let result = [ ]
  if (!Array.isArray(arr)) {
    // not sure how mongo handles this
  }
  if (typeof val === 'number') {
    if (val >= 0) {
      result = arr.slice(0, val)
    } else{
      result = arr.slice(val)
    }
  } else if (Array.isArray(val) && val.length == 2) {
    result = arr.slice(val[0], val[1]+1)
  } else {
    throw new Error(`Invalid argument to $slice operator: ${JSON.stringify(val)}`)
  } 
  nessy(keypath, result , '.', projected)
  return projected
}

module.exports = exports = {
  projection,
  isInclude
}