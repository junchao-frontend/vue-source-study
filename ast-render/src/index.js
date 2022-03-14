import { initMixin } from './init';
import { lifecycleMixin } from './lifecycle';
import { renderMixin } from './vdom';

function Vue (options) {
  this._init(options);
}

initMixin(Vue);
lifecycleMixin(Vue); // 生命周期
renderMixin(Vue); // 渲染函数

export default Vue;

