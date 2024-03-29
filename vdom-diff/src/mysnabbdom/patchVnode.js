import createElement from "./createElement";
import updateChildren from "./updateChildren";
export default function patchVnode(oldVnode,newVnode) {
     // 判断新旧vnode是否是同一个对象
     if (oldVnode === newVnode) return
    // 判断vnode有没有text属性
    if (newVnode.text != undefined && (newVnode.children == undefined || newVnode.children.length == 0)) {
        // 新vnode有text属性
        console.log('新vnode有text属性');
        if (newVnode.text != oldVnode.text) {
            // 如果新虚拟节点中的text和老的虚拟节点text不同， 那么直接让新的text写入老的elm中即可。如果老的elm中是children，那么也会立即消失掉
            oldVnode.elm.innerText = newVnode.text
        }
    } else {
        // 新vnode没有text属性，有children
        console.log('新vnode没有text属性');
        // 判断老node有没有children
        if (oldVnode.children != undefined && oldVnode.children.length > 0) {
            // 老的有children新的也有 最麻烦的地方
            updateChildren(oldVnode.elm,oldVnode.children,newVnode.children)
        } else {
            // 老的没有children
            // 清空老的节点的内容
            console.log('老的没有children');
            oldVnode.elm.innerHTML = ''
            // 遍历新的vnode的子节点，创建DOM 上树
            for (let i = 0; i < newVnode.children.length; i++) {
                let dom = createElement(newVnode.children[i])
                oldVnode.elm.appendChild(dom)
            }
        }
    }
}