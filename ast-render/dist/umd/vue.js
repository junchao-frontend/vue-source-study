(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
})(this, (function () { 'use strict';

    const def = function (obj, key, value, enumerable) {
      Object.defineProperty(obj, key, {
        value,
        enumerable,
        writable: true,
        configurable: true
      });
    };

    var uid$1 = 0; // Dep 依赖收集器

    class Dep {
      constructor() {
        // console.log('我是DEP类的构造器');
        this.id = uid$1++; // 用数组存储自己的订阅者。subs是英语subscribes订阅者的意思。
        // 这个数组里面放的是Watcher的实例

        this.subs = [];
      } // 添加订阅


      addSub(sub) {
        this.subs.push(sub);
      } // 添加依赖


      depend() {
        // Dep.target就是一个我们自己指定的全局的位置，你用window.target也行，只要是全剧唯一，没有歧义就行
        // console.log(Dep.target, '---');
        if (Dep.target) {
          this.addSub(Dep.target);
        }
      } // 通知更新


      notify() {
        console.log('我是notify'); // 浅克隆一份

        const subs = this.subs.slice(); // 遍历

        for (let i = 0, l = subs.length; i < l; i++) {
          subs[i].update();
        }
      }

    }

    function defineReactive(data, key, val) {
      const dep = new Dep(); // console.log(dep, 'dep');
      // console.log('我是defineReactive', key);

      if (arguments.length == 2) {
        val = data[key];
      } // 子元素要进行observe，至此形成了递归。这个递归不是函数自己调用自己，而是多个函数、类循环调用


      let childOb = observe(val);
      Object.defineProperty(data, key, {
        // 可枚举
        enumerable: true,
        // 可以被配置，比如可以被delete
        configurable: true,

        // getter
        get() {
          console.log('你试图访问' + key + '属性'); // 如果现在处于依赖收集阶段

          if (Dep.target) {
            dep.depend();

            if (childOb) {
              childOb.dep.depend();
            }
          }

          return val;
        },

        // setter
        set(newValue) {
          console.log('你试图改变' + key + '属性', newValue);

          if (val === newValue) {
            return;
          }

          val = newValue; // 当设置了新值，这个新值也要被observe

          childOb = observe(newValue); // 发布订阅模式，通知dep

          dep.notify();
        }

      });
    }

    const arrayPrototype = Array.prototype; // 以Array.prototype为原型创建arrayMethods对象，并暴露

    const arrayMethods = Object.create(arrayPrototype); // 要被改写的7个数组方法

    const methodsNeedChange = ['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse'];
    methodsNeedChange.forEach(methodName => {
      // 备份原来的方法，因为push、pop等7个函数的功能不能被剥夺
      const original = arrayPrototype[methodName]; // 定义新的方法

      def(arrayMethods, methodName, function () {
        // 恢复原来的功能
        const result = original.apply(this, arguments); // 把类数组对象变为数组

        const args = [...arguments]; // 把这个数组身上的__ob__取出来，__ob__已经被添加了，为什么已经被添加了？因为数组肯定不是最高层，比如obj.g属性是数组，obj不能是数组，第一次遍历obj这个对象的第一层的时候，已经给g属性（就是这个数组）添加了__ob__属性。

        const ob = this.__ob__; // 有三种方法push\unshift\splice能够插入新项，现在要把插入的新项也要变为observe的

        let inserted = [];

        switch (methodName) {
          case 'push':
          case 'unshift':
            inserted = args;
            break;

          case 'splice':
            // splice格式是splice(下标, 数量, 插入的新项)
            inserted = args.slice(2);
            break;
        } // 判断有没有要插入的新项，让新项也变为响应的


        if (inserted) {
          ob.observeArray(inserted);
        }

        console.log('啦啦啦');
        ob.dep.notify();
        return result;
      }, false);
    });

    class Observer {
      constructor(value) {
        // 每一个Observer的实例身上，都有一个dep
        this.dep = new Dep(); // 给实例（this，一定要注意，构造函数中的this不是表示类本身，而是表示实例）添加了__ob__属性，值是这次new的实例

        def(value, '__ob__', this, false); // console.log('我是Observer构造器', value);
        // 不要忘记初心，Observer类的目的是：将一个正常的object转换为每个层级的属性都是响应式（可以被侦测的）的object
        // 检查它是数组还是对象

        if (Array.isArray(value)) {
          // 如果是数组，要非常强行的蛮干：将这个数组的原型，指向arrayMethods
          Object.setPrototypeOf(value, arrayMethods); // 让这个数组变的observe

          this.observeArray(value);
        } else {
          this.walk(value);
        }
      } // 遍历


      walk(value) {
        for (let k in value) {
          defineReactive(value, k);
        }
      } // 数组的特殊遍历


      observeArray(arr) {
        for (let i = 0, l = arr.length; i < l; i++) {
          // 逐项进行observe
          observe(arr[i]);
        }
      }

    }

    function observe (value) {
      // 如果value不是对象，什么都不做
      if (typeof value != 'object') return; // 定义ob

      var ob;

      if (typeof value.__ob__ !== 'undefined') {
        ob = value.__ob__;
      } else {
        ob = new Observer(value);
      }

      return ob;
    }

    function proxy(vm, target, key) {
      Object.defineProperty(vm, key, {
        get() {
          return vm[target][key];
        },

        set(newValue) {
          if (vm[target][key] === newValue) return;
          vm[target][key] = newValue;
        }

      });
    }

    var uid = 0;
    class Watcher {
      constructor(target, expression, callback) {
        // expression是表达式 a.m.n  即要watch数据 的位置
        // callback是实例化watcher的回调函数
        console.log(target, 'target', expression, 'expression', callback); // console.log('我是Watcher类的构造器');

        this.id = uid++;
        this.target = target; // target是 data 此处是obj

        this.getter = parsePath(expression);
        this.callback = callback;
        this.value = this.get();
      }

      update() {
        this.run();
      }

      get() {
        // 进入依赖收集阶段。让全局的Dep.target设置为Watcher本身，那么就是进入依赖收集阶段
        Dep.target = this; // 把watcher对象记录到Dep类的静态属性target

        const obj = this.target;
        var value; // 只要能找，就一直找

        try {
          value = this.getter(obj);
        } finally {
          Dep.target = null;
        }

        console.log(value, 'value');
        return value;
      }

      run() {
        this.getAndInvoke(this.callback);
      }

      getAndInvoke(cb) {
        console.log(cb, 'cb');
        const value = this.get();

        if (value !== this.value || typeof value == 'object') {
          const oldValue = this.value;
          this.value = value;
          cb.call(this.target, value, oldValue);
        }
      }

    }

    function parsePath(str) {
      var segments = str.split('.');
      return obj => {
        for (let i = 0; i < segments.length; i++) {
          if (!obj) return;
          obj = obj[segments[i]];
        }

        return obj;
      };
    }

    function initState(vm) {
      const options = vm.$options;

      if (options.props) ;

      if (options.methods) ;

      if (options.data) {
        initData(vm);
      }

      if (options.computed) ;

      if (options.watch) {
        initWatch(vm);
      }
    }

    function initData(vm) {
      let data = vm.$options.data;
      vm._data = data = typeof data === 'function' ? data.call(vm) : data;

      for (let key in data) {
        proxy(vm, '_data', key);
      }

      observe(data);
    }

    function initWatch(vm) {
      let watch = vm.$options.watch;
      Object.keys(watch).forEach(key => {
        new Watcher(vm, key, watch[key]);
      });
    }

    // id="app" id='app' id=app
    const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; //标签名  <my-header></my-header>

    const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`; // <my:header></my:header>

    const qnameCapture = `((?:${ncname}\\:)?${ncname})`; // <div

    const startTagOpen = new RegExp(`^<${qnameCapture}`); // > />

    const startTagClose = /^\s*(\/?)>/; // </div>

    const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`);
    /*
    <div id="app" style="color: red;font-size: 20px;">
        你好，{{ name }}
        <span class="text" style="color: green">{{age}}</span>
      </div>
    */

    function parseHtmlToAst(html) {
      let text,
          root,
          currentParent,
          stack = [];

      while (html) {
        let textEnd = html.indexOf('<');

        if (textEnd === 0) {
          const startTagMatch = parseStartTag();

          if (startTagMatch) {
            start(startTagMatch.tagName, startTagMatch.attrs);
            continue;
          }

          const endTagMatch = html.match(endTag);

          if (endTagMatch) {
            advance(endTagMatch[0].length);
            end(endTagMatch[1]);
            continue;
          }
        }

        if (textEnd > 0) {
          text = html.substring(0, textEnd);
        }

        if (text) {
          advance(text.length);
          chars(text);
        }
      }

      function parseStartTag() {
        const start = html.match(startTagOpen);
        let end, attr;

        if (start) {
          const match = {
            tagName: start[1],
            attrs: []
          };
          advance(start[0].length);

          while (!(end = html.match(startTagClose)) && (attr = html.match(attribute))) {
            match.attrs.push({
              name: attr[1],
              value: attr[3] || attr[4] || attr[5]
            });
            advance(attr[0].length);
          }

          if (end) {
            advance(end[0].length);
            return match;
          }
        }
      }

      function advance(n) {
        html = html.substring(n);
      } // currentParent div
      //stack [div]


      function start(tagName, attrs) {
        const element = createASTElement(tagName, attrs);

        if (!root) {
          root = element;
        }

        currentParent = element;
        stack.push(element);
      }

      function end(tagName) {
        // span
        const element = stack.pop(); // div

        currentParent = stack[stack.length - 1];

        if (currentParent) {
          // span => parent => div
          element.parent = currentParent; // div => children => push => span

          currentParent.children.push(element);
        }
      }

      function chars(text) {
        text = text.trim();

        if (text.length > 0) {
          currentParent.children.push({
            type: 3,
            text
          });
        }
      }

      function createASTElement(tagName, attrs) {
        return {
          tag: tagName,
          type: 1,
          children: [],
          attrs,
          parent
        };
      }

      return root;
    }

    /*
    <div id="app" style="color: red;font-size: 20px;">
      你好，{{ name }}
      <span class="text" style="color: green">{{age}}</span>
    </div>

    _c() => createElement()
    _v() => createTextNode()
    _s() => {{name}} => _s(name)
    */
    // function render() {
    //   return `
    //     _c(
    //       "div", 
    //       {
    //         id: "app", 
    //         style: { 
    //           "color": "red", 
    //           "font-size": "20px" 
    //         }
    //       },
    //       _v("你好，"+_s(name)),
    //       _c(
    //         "span",
    //         {
    //           "class": "text",
    //           "style": {
    //             "color": "green"
    //           }
    //         },
    //         _v(_s(age))
    //       )  
    //     )
    //   `;
    // }
    const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g;

    function formatProps(attrs) {
      let attrStr = '';

      for (var i = 0; i < attrs.length; i++) {
        let attr = attrs[i];

        if (attr.name === 'style') {
          let styleAttrs = {};
          attr.value.split(';').map(styleAttr => {
            let [key, value] = styleAttr.split(':');
            styleAttrs[key] = value;
          });
          attr.value = styleAttrs;
        }

        attrStr += `${attr.name}:${JSON.stringify(attr.value)},`;
      }

      return `{${attrStr.slice(0, -1)}}`;
    }

    function generateChild(node) {
      if (node.type === 1) {
        return generate(node);
      } else if (node.type === 3) {
        let text = node.text;

        if (!defaultTagRE.test(text)) {
          return `_v(${JSON.stringify(text)})`;
        }

        let match,
            index,
            lastIndex = defaultTagRE.lastIndex = 0,
            textArr = [];

        while (match = defaultTagRE.exec(text)) {
          index = match.index;

          if (index > lastIndex) {
            textArr.push(JSON.stringify(text.slice(lastIndex, index)));
          }

          textArr.push(`_s(${match[1].trim()})`);
          lastIndex = index + match[0].length;
        }

        if (lastIndex < text.length) {
          textArr.push(JSON.stringify(text.slice(lastIndex)));
        }

        return `_v(${textArr.join('+')})`;
      }
    }

    function geChildren(el) {
      const children = el.children;

      if (children) {
        return children.map(c => generateChild(c)).join(',');
      }
    }

    function generate(el) {
      let children = geChildren(el);
      let code = `_c('${el.tag}', ${el.attrs.length > 0 ? `${formatProps(el.attrs)}` : 'undefined'}${children ? `,${children}` : ''})`;
      return code;
    }

    function compileToRenderFunction(html) {
      const ast = parseHtmlToAst(html),
            code = generate(ast),
            render = new Function(`
          with(this){ return ${code} }
        `);
      return render;
    }

    function patch(oldNode, vNode) {
      let el = createElement$1(vNode),
          parentElement = oldNode.parentNode;
      parentElement.insertBefore(el, oldNode.nextSibling);
      parentElement.removeChild(oldNode);
    }

    function createElement$1(vnode) {
      const {
        tag,
        props,
        children,
        text
      } = vnode;

      if (typeof tag === 'string') {
        vnode.el = document.createElement(tag);
        updateProps(vnode);
        children.map(child => {
          vnode.el.appendChild(createElement$1(child));
        });
      } else {
        vnode.el = document.createTextNode(text);
      }

      return vnode.el;
    }

    function updateProps(vnode) {
      const el = vnode.el,
            newProps = vnode.props || {};

      for (let key in newProps) {
        if (key === 'style') {
          for (let sKey in newProps.style) {
            el.style[sKey] = newProps.style[sKey];
          }
        } else if (key === 'class') {
          el.className = el.class;
        } else {
          el.setAttribute(key, newProps[key]);
        }
      }
    }

    function mountComponent(vm) {
      // vnode
      vm._update(vm._render());
    }

    function lifecycleMixin(Vue) {
      Vue.prototype._update = function (vnode) {
        const vm = this;
        patch(vm.$el, vnode);
      };
    }

    function initMixin(Vue) {
      Vue.prototype._init = function (options) {
        const vm = this;
        vm.$options = options;
        initState(vm);

        if (vm.$options.el) {
          // 挂载函数   Vue.prototype.$mount
          vm.$mount(vm.$options.el);
        }
      };

      Vue.prototype.$mount = function (el) {
        const vm = this,
              options = vm.$options;
        el = document.querySelector(el), vm.$el = el;

        if (!options.render) {
          let template = options.template;

          if (!template && el) {
            template = el.outerHTML;
          }

          const render = compileToRenderFunction(template);
          options.render = render;
        }

        mountComponent(vm);
      };
    }

    function createElement(tag, attrs = {}, ...children) {
      return vnode(tag, attrs, children);
    }

    function createTextVnode(text) {
      return vnode(undefined, undefined, undefined, text);
    }

    function vnode(tag, props, children, text) {
      return {
        tag,
        props,
        children,
        text
      };
    }

    function renderMixin(Vue) {
      Vue.prototype._c = function () {
        return createElement(...arguments);
      };

      Vue.prototype._s = function (value) {
        if (value === null) return;
        return typeof value === 'object' ? JSON.stringify(value) : value;
      };

      Vue.prototype._v = function (text) {
        return createTextVnode(text);
      };

      Vue.prototype._render = function () {
        const vm = this,
              render = vm.$options.render,
              vnode = render.call(vm);
        return vnode;
      };
    }

    function Vue(options) {
      this._init(options);
    }

    initMixin(Vue);
    lifecycleMixin(Vue); // 生命周期

    renderMixin(Vue); // 渲染函数

    return Vue;

}));
//# sourceMappingURL=vue.js.map
