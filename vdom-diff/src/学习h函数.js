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
  
  var myVnode1 = h('a',  {props: {href: '1111'}}, '王军潮')
  var myVnode2 = h('ul',{},[
      h('li',{},1),
      h('li',{},2),
      h('li',{},3),
      h('li',{},4),
  ])
  console.log(myVnode1);

  // 让虚拟节点上树
  // const container = document.getElementById('container')
  // patch(container,myVnode2)