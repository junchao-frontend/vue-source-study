// 真正创建节点，将vnode转化为DOM
export default function createElement(vnode) {
    console.log(vnode);
    // 创建一个节点，现在为孤儿节点
    let domNode = document.createElement(vnode.sel)
    // 先判断这个虚拟节点为文本的时候
    if(vnode.text != '' && (vnode.children == undefined || vnode.children.length == 0)) {
        // 它的内部是文字
        domNode.innerText = vnode.text
    } else if (Array.isArray(vnode.children) && vnode.children.length>0) {
        // 它内部是子节点 ，  要递归创建节点
        // console.log(vnode.children);
        for(let i = 0; i < vnode.children.length; i++) {
            // 得到当前这个children
            let ch = vnode.children[i];
            // 创建出他的dom，一旦调用createElement就意味着创建出DOM来了，并且它的elm属性指向了创建的dom，但是还没有上树，是孤儿节点
            let chDOM = createElement(ch)
            domNode.appendChild(chDOM)
        }
    }
    // console.log(domNode);
    vnode.elm = domNode
    return vnode.elm
}