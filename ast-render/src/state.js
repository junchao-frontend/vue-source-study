import  observe  from "./observer/observe";
import { proxy } from './utils';
import Watcher from './observer/Watcher.js'
function initState (vm) {
  const options = vm.$options;

  if (options.props) {
    initProps(vm);
  }

  if (options.methods) {
    initMethods(vm);
  }

  if (options.data) {
    initData(vm);
  }

  if (options.computed) {
    initComputed(vm);
  }

  if (options.watch) {
    initWatch(vm);
  }
}

function initProps (vm) {}

function initMethods (vm) {}

function initData (vm) {
  let data = vm.$options.data;

  vm._data = data = typeof data === 'function' ? data.call(vm) : data;
  
  for (let key in data) {
    proxy(vm, '_data', key);
  }
  
  observe(data);
}

function initWatch (vm) {
  let watch = vm.$options.watch
  Object.keys(watch).forEach(key => {
    new Watcher(vm,key,watch[key])
  })
}

function initComputed (vm) {}

export {
  initState
}