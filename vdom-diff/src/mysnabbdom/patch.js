import vnode from "./vnode";
import createElement from "./createElement";
import patchVnode from "./patchVnode";
export default function patch(oldVnode, newVnode) {
    // console.log(oldVnode,newVnode);
    // 首先判断oldVnode是dom节点还是虚拟节点
    if (oldVnode.sel == '' || oldVnode.sel == undefined) {
        oldVnode = vnode(oldVnode.tagName.toLowerCase(), {}, [], undefined, oldVnode)
        // console.log(oldVnode);
    }
    // oldVnode和newVnode是不是key和sel都相同
    if (oldVnode.sel === newVnode.sel && oldVnode.key === newVnode.key) {
        console.log('是同一个节点');
        patchVnode(oldVnode, newVnode)

    } else {
        // 暴力删除旧的,插入新的
        console.log('不是同一个节点， 暴力删除旧的插入新的');
        let newVnodeElm = createElement(newVnode)
        if (oldVnode.elm.parentNode && newVnodeElm) {
            oldVnode.elm.parentNode.insertBefore(newVnodeElm, oldVnode.elm)
        }
        oldVnode.elm.parentNode.removeChild(oldVnode.elm)
    }
}