// import h from './mysnabbdom/h.js'
// import patch from './mysnabbdom/patch.js'
// const myNode1 = h('ul',{},[
//     h('li',{key: 'A'}, 'A'),
//     h('li',{key: 'B'}, 'B'),
//     h('li',{key: 'C'}, 'C'),
//     h('li',{key: 'D'}, 'D'),
//     h('li',{key: 'E'}, 'E'),
// ])


// const newNode = h('ul',{},[
//     h('li',{key: 'A'}, [
//         h('p',{},'hahah')
//     ]),
//     h('li',{key: 'C'}, 'C'),
//     h('li',{key: 'B'}, 'B'),
//     h('li',{key: 'D'}, 'D'),
// ])



// const container = document.getElementById('container')
// const btn = document.getElementById('btn')
// patch(container,myNode1)


// btn.onclick = function() {
//     patch(myNode1,newNode)
// }
import {
    init,
    classModule,
    propsModule,
    styleModule,
    eventListenersModule,
    h,
  } from "snabbdom";
  // 创建patch函数
  const patch = init([
    // Init patch function with chosen modules
    classModule, // makes it easy to toggle classes
    propsModule, // for setting properties on DOM elements
    styleModule, // handles styling on elements with support for animations
    eventListenersModule, // attaches event listeners
  ]);
  
  var myVnode1 = h('div',{props:{id:'app'}},[
      h('ul',{},[
          h('li','A'),
          h('li','B'),
          h('li','C'),
      ])
  ])
  var myVnode2 = h('ul',{},[
      h('li',{},1),
      h('li',{},2),
      h('li',{},3),
      h('li',{},4),
  ])
const container = document.getElementById('container')
patch(container,myVnode1)
  console.log(myVnode1);