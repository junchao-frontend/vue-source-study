import h from './mysnabbdom/h.js'

var myNode = h('div',{},[
    h('p',{},'第一段'),
    h('p',{},'第二段')
])
var myVnode1 = h('a',  {}, h('p',{},'111'))

console.log(myVnode1);