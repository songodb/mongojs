// create something like sift, but it takes the MongDB sort format [['a', 1], ['b', -1 ]] and 
// creates a javascript sort function that can be passed into .sort(...)
const jessy = require('jessy')

function sort(indexes) {
  return (a, b) => {
    for (let i=0; i<indexes.length; i++) {
      let field = indexes[i][0]
      let order = indexes[i][1]
      let a_val = jessy(field, a) || null // undefined -> null
      let b_val = jessy(field, b) || null
      if (a_val < b_val) return (-1 * order) 
      if (a_val > b_val) return order
    }
    return 0
  }
}

module.exports = exports = { sort }


// Error: error: {
// 	"operationTime" : Timestamp(1590348971, 1),
// 	"ok" : 0,
// 	"errmsg" : "bad sort specification",
// 	"code" : 2,
// 	"codeName" : "BadValue",
// 	"$clusterTime" : {
// 		"clusterTime" : Timestamp(1590348971, 1),
// 		"signature" : {
// 			"hash" : BinData(0,"20qCHt1O1fUDD5/T5SbjFGnvbuc="),
// 			"keyId" : NumberLong("6800076575631998977")
// 		}
// 	}
// }
