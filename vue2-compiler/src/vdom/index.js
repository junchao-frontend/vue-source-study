import { createElement, createTextVnode } from './vnode';

function renderMixin (Vue) {
  Vue.prototype._c = function () {
    // 创建元素节点
    return createElement(...arguments);
  }

  Vue.prototype._s = function (value) {
    // 处理双大括号
    if (value === null) return;
    return typeof value === 'object' ? JSON.stringify(value) : value;
  }

  Vue.prototype._v = function (text) {
    // 文本节点
    return createTextVnode(text);
  }

  Vue.prototype._render = function () {
    const vm = this,
          render = vm.$options.render,
          vnode = render.call(vm);
    return vnode;
  }
}

export {
  renderMixin
}