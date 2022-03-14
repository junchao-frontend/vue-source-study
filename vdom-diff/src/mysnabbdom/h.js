import vnode from './vnode.js'

export default function (sel, data, c) {
    // 检查参数个数
    if (arguments.length != 3) {
        throw new Error('传入的参数必须是三个')
    }
    // c有三种情况
    // 1. 第三个参数传的是字符串或者数字 h('div',{},'文字')
    // 2. 第三个参数传的是数组 h('div',{},[])
    // 3. 第三个参数传的是对象 h('div',{}, h())
    if (typeof c === 'string' || typeof c === 'number') {
        return vnode(sel, data, undefined, c, undefined)
    } else if (Array.isArray(c)) {
        let children = []
        for (let i = 0; i < c.length; i++) {
            if (!(typeof c[i] == 'object' && c[i].hasOwnProperty('sel')))
                throw new Error('传入的参数有的不是h函数')
            children.push(c[i])
        }
        return vnode(sel, data, children, undefined, undefined)
    } else if (typeof c == 'object' && c.hasOwnProperty('sel')) {
        let children = [c]
        return vnode(sel, data, children, undefined, undefined)
    } else {
        throw new Error('传入的第三个参数类型不对')
    }
}