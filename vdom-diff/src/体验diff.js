import {
    init,
    classModule,
    propsModule,
    styleModule,
    eventListenersModule,
    h,
  } from "snabbdom";
  
  const container = document.getElementById('container')
  const btn = document.getElementById('btn')
  // 创建patch函数
  const patch = init([
    // Init patch function with chosen modules
    classModule, // makes it easy to toggle classes
    propsModule, // for setting properties on DOM elements
    styleModule, // handles styling on elements with support for animations
    eventListenersModule, // attaches event listeners
  ]);
  const myNode1 = h('ul',[
      h('li',{key: 'A'},'A'),
      h('li',{key: 'B'},'B'),
      h('li',{key: 'C'},'C')
  ])
  patch(container,myNode1)
  const myNode2 = h('ul',[
    h('li',{key: 'E'}, 'E'),
    h('li',{key: 'A'},'A'),
    h('li',{key: 'B'},'B'),
    h('li',{key: 'C'},'C')
])
const myNode3 = h('ul',[
    h('li','E'),
    h('li','A'),
    h('li','B'),
    h('li','C')
])
  btn.onclick = function () {
      patch(myNode1,myNode2)
  }