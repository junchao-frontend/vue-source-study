---
Vue响应式原理
---

**Vue在生命周期beforeCreate和created期间会初始化data**

会执行Observe函数

### observe(data)

**执行observe函数会定义一个ob，之后实例化Observer这个类**

**在Observer类里面会调用def函数给每一个value绑定一个__ob__ ， 这个__ob__指向Observe实例**

**紧接着会判断传进来的value是对象还是数组，如果是对象则walk函数，如果是数组则进行数组的特殊遍历**

### Observer类

![Observer](C:\Users\hp\Desktop\Observer.png)

### defineReactive()

```js
import observe from './observe.js';
import Dep from './Dep.js';

export default function defineReactive(data, key, val) {
    const dep = new Dep();
    // console.log(dep, 'dep');
    // console.log('我是defineReactive', key);
    if (arguments.length == 2) {
        val = data[key];
    }

    // 子元素要进行observe，至此形成了递归。这个递归不是函数自己调用自己，而是多个函数、类循环调用
    let childOb = observe(val);

    Object.defineProperty(data, key, {
        // 可枚举
        enumerable: true,
        // 可以被配置，比如可以被delete
        configurable: true,
        // getter
        get() {
            console.log('你试图访问' + key + '属性');
            // 如果现在处于依赖收集阶段
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
            val = newValue;
            // 当设置了新值，这个新值也要被observe
            childOb = observe(newValue);
            // 发布订阅模式，通知dep
            dep.notify();
        }
    });
};
```



`Vue`使用`Object.defineProperty`来进行数据劫持。

**遍历value执行defineReactive函数, vue2的响应式都是围绕Object.defineProperty实现的，defineReactive函数负责将数据转换成getter/setter形式**

![reactive](C:\Users\hp\Desktop\reactive.png)

![Snipaste_2022-03-07_09-19-13](C:\Users\hp\Desktop\Snipaste_2022-03-07_09-19-13.png)

他们三个之间形成递归

```js
执行observe(obj)
├── new Observer(obj),并执行this.walk()遍历obj的属性，执行defineReactive()
    ├── defineReactive(obj, a)
        ├── 执行observe(obj.a) 发现obj.a不是对象，直接返回
        ├── 执行defineReactive(obj, a) 的剩余代码
    ├── defineReactive(obj, b) 
	    ├── 执行observe(obj.b) 发现obj.b是对象
	        ├── 执行 new Observer(obj.b)，遍历obj.b的属性，执行defineReactive()
                    ├── 执行defineReactive(obj.b, c)
                        ├── 执行observe(obj.b.c) 发现obj.b.c不是对象，直接返回
                        ├── 执行defineReactive(obj.b, c)的剩余代码
            ├── 执行defineReactive(obj, b)的剩余代码
代码执行结束

```



### Array

为什么要对数组特殊处理

上一篇文章讲到了`vue`数据响应式的基本原理，结尾提到，我们要对数组进行一个单独的处理。很多人可能会有疑问了，为什么要对数组做特殊处理呢？数组不就是`key`为数值的对象吗？那我们不妨来尝试一下

```js
function defineReactive(obj, key, val) {
  Object.defineProperty(obj, key, {
    get() {
      console.log('get: ', val)
      return val
    },
    set(newVal) {
      console.log('set: ', newVal)
      newVal = val
    }
  })
}

const arr = [1, 2, 3]
arr.forEach((val, index, arr) => {
  defineReactive(arr, index, val)
})

```

如果我们访问和获取`arr`的值，`getter`和`setter`也会被触发，这不是可以吗？但是如果`arr.unshift(0)`呢？数组的每个元素要依次向后移动一位，这就会触发`getter`和`setter`，导致依赖发生变化。由于数组是顺序结构，所以索引(key)和值不是绑定的，因此这种护理方法是有问题的

#### 重写数组方法

改写数组的原型通过Object.setPrototypeOf

![Array](C:\Users\hp\Desktop\Array.png)

实现思路

- 将数组的原型存到对象`arrayMethods`中
- 找到Array上能够改变数组自身的7个方法 `push`, `pop`, `shift`, `unshift`, `splice`, `sort`, `reverse`
- 将这7个方法进行响应式处理
- 处理完成后，用它们把`arrayMethods`中对应的方法覆盖掉
- 将需要进行响应式处理的数组`arr`的`__proto__`指向`arrayMethods`，如果浏览器不支持访问`__proto__`，则直接将响应式处理后的7个方法添加到数组`arr`上

**如果是数组，要非常强行的蛮干：将这个数组的原型，指向arrayMethods**

**Object.setPrototypeOf(*value*, arrayMethods);**

#### 实现代码

```js
import { def } from './utils.js';

// 得到Array.prototype
const arrayPrototype = Array.prototype;

// 以Array.prototype为原型创建arrayMethods对象，并暴露
export const arrayMethods = Object.create(arrayPrototype);

// 要被改写的7个数组方法
const methodsNeedChange = [
    'push',
    'pop',
    'shift',
    'unshift',
    'splice',
    'sort',
    'reverse'
];

methodsNeedChange.forEach(methodName => {
    // 备份原来的方法，因为push、pop等7个函数的功能不能被剥夺
    const original = arrayPrototype[methodName];
    // 定义新的方法
    def(arrayMethods, methodName, function () {
        // 恢复原来的功能
        const result = original.apply(this, arguments);
        // 把类数组对象变为数组
        const args = [...arguments];
        // 把这个数组身上的__ob__取出来，__ob__已经被添加了，为什么已经被添加了？因为数组肯定不是最高层，比如obj.g属性是数组，obj不能是数组，第一次遍历obj这个对象的第一层的时候，已经给g属性（就是这个数组）添加了__ob__属性。
        const ob = this.__ob__;

        // 有三种方法push\unshift\splice能够插入新项，现在要把插入的新项也要变为observe的
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
        }

        // 判断有没有要插入的新项，让新项也变为响应的
        if (inserted) {
            ob.observeArray(inserted);
        }

        console.log('啦啦啦');

        ob.dep.notify();

        return result;
    }, false);
});
```



### Dep

**Dep - 依赖收集器（不是官方的名字）**

用两个例子说明一下

```javascript
const vm = new Vue({
    data() {
        return {
            text: 'hello world',
            text2: 'hey',
        }
    }
})
```

当`vm.text2`的值发生变化时，会再次调用`render`，而`template`中却没有使用`text2`，所以这里处理`render`是不是毫无意义？

针对这个例子还记得我们上面模拟实现的没，在`Vue`的`render`函数中，我们调用了本次渲染相关的值，所以，与渲染无关的值，并不会触发`get`，也就不会在依赖收集器中添加到监听(`addSub`方法不会触发)，即使调用`set`赋值，`notify`中的`subs`也是空的。OK，继续回归demo，来一小波测试去印证下我说的吧。

```js
const vue = new Vue({
  data() {
    return {
      text: 'hello world',
      text2: 'hey'
    };
  }
})

vue.mount(); // in get
vue._data.text = '456'; // in watcher update /n in get
vue._data.text2 = '123'; // nothing

```

例子2，多个Vue实例引用同一个data时，通知谁？是不是应该俩都通知？

```js

let commonData = {
  text: 'hello world'
};

const vm1 = new Vue({
  data() {
    return commonData;
  }
})

const vm2 = new Vue({
  data() {
    return commonData;
  }
})

vm1.mount(); // in get
vm2.mount(); // in get
commonData.text = 'hey' // 输出了两次 in watcher update /n in get

```

希望通过这两个例子，你已经大概清楚了`Dep`的作用，有没有原来就那么回事的感觉？有就对了。总结一下吧(以下依赖收集器实为`Dep`)：

- `vue`将`data`初始化为一个`Observer`并对对象中的每个值，重写了其中的`get`、`set`，`data`中的每个`key`，都有一个独立的依赖收集器。

- 在`get`中，向依赖收集器添加了监听

- 在mount时，实例了一个`Watcher`，将收集器的目标指向了当前`Watcher`

- 在`data`值发生变更时，触发`set`，触发了依赖收集器中的所有监听的更新，来触发`Watcher.update`

  ![QQ图片20220307092948](C:\Users\hp\Desktop\QQ图片20220307092948.png)



#### Dep的实现

```js
var uid = 0;
// Dep 依赖收集器
export default class Dep {
    constructor() {
        // console.log('我是DEP类的构造器');
        this.id = uid++;

        // 用数组存储自己的订阅者。subs是英语subscribes订阅者的意思。
        // 这个数组里面放的是Watcher的实例
        this.subs = [];
    }
    // 添加订阅
    addSub(sub) {
        this.subs.push(sub);
    }
    // 添加依赖
    depend() {
        // Dep.target就是一个我们自己指定的全局的位置，你用window.target也行，只要是全剧唯一，没有歧义就行
        // console.log(Dep.target, '---');
        if (Dep.target) {
            this.addSub(Dep.target);
        }
    }
    // 通知更新
    notify() {
        console.log('我是notify');
        // 浅克隆一份
        const subs = this.subs.slice();
        // 遍历
        for (let i = 0, l = subs.length; i < l; i++) {
            subs[i].update();
        }
    }
};
```

### 依赖收集和派发更新

#### 依赖

在正式讲解依赖收集之前，我们先看看什么是依赖。举一个生活中的例子：淘宝购物。现在淘宝某店铺上有一块显卡(~~空气~~)处于预售阶段，如果我们想买的话，我们可以点击`预售提醒`，当显卡开始卖的时候，淘宝为我们推送一条消息，我们看到消息后，可以开始购买。

将这个例子抽象一下就是发布-订阅模式：买家点击预售提醒，就相当于在淘宝上登记了自己的信息(订阅)，淘宝则会将买家的信息保存在一个数据结构中(比如数组)。显卡正式开放购买时，淘宝会通知所有的买家：显卡开卖了(发布)，买家会根据这个消息进行一些动作(~~比如买回来挖矿~~)。

在`Vue`响应式系统中，显卡对应数据，那么例子中的买家对应什么呢？就是一个抽象的类: `Watcher`。大家不必纠结这个名字的含义，只需要知道它做什么事情：每个`Watcher`实例订阅一个或者多个数据，这些数据也被称为`wacther`的依赖(商品就是买家的依赖)；当依赖发生变化，`Watcher`实例会接收到数据发生变化这条消息，之后会执行一个回调函数来实现某些功能，比如更新页面(买家进行一些动作)。

![Snipaste_2022-03-07_09-22-54](C:\Users\hp\Desktop\Snipaste_2022-03-07_09-22-54.png)

### Watcher

![QQ图片20220307092944](C:\Users\hp\Desktop\QQ图片20220307092944.png)

1.**为什么引入Watcher**
当属性发生变化时，我们要通知用到此数据属性的地方，而使用此数据的地方很多且类型不一样，需要抽象出一个类集中处理这些情况，然后在依赖收集阶段只收集这个封装好的实例，通知也只需要通知这一个，然后它在负责通知其他地方

![Snipaste_2022-03-07_09-24-07](C:\Users\hp\Desktop\Snipaste_2022-03-07_09-24-07.png)

##### 收集依赖

**在getter中通过dep.depend();收集依赖，在setter中通过dep.notify()触发依赖**

当外界通过Watcher读取数据时，便会触发getter将Watcher添加至依赖中，将触发getter的Watcher收集到Dep中，当数据发生变化时，会循环依赖列表，遍历所有的Watcher

![Dep和Watcher](C:\Users\hp\Desktop\Dep和Watcher.png)

##### Watcher的实现

```js
import Dep from "./Dep";

var uid = 0;
export default class Watcher {
    constructor(target, expression, callback) {
        // expression是表达式 a.m.n  即要watch数据 的位置
        // callback是实例化watcher的回调函数
        console.log(target,'target',expression, 'expression',callback);
        // console.log('我是Watcher类的构造器');
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
        var value;

        // 只要能找，就一直找
        try {
            value = this.getter(obj);
        } finally {
            Dep.target = null;
        }
        console.log(value,'value');
        return value;
    }
    run() {
        this.getAndInvoke(this.callback);
    }
    getAndInvoke(cb) {
        const value = this.get();

        if (value !== this.value || typeof value == 'object') {
            const oldValue = this.value;
            this.value = value;
            cb.call(this.target, value, oldValue);
        }
    }
};
// 找到对象.最后的位置
function parsePath(str) {
    var segments = str.split('.');

    return (obj) => {
        for (let i = 0; i < segments.length; i++) {
            if (!obj) return;
            obj = obj[segments[i]]
        }
        return obj;
    };
}
```



### 总结

- new Vue创建vue实例后，Vue调用_init函数进行初始化，此时Data通过Observer转换为setter/getter形式，追踪数据的变化。当外界读取数据时触发getter函数，而当被赋值的时候执行setter函数
  当Render Function执行时，读取对象的值触发getter函数从而将Watcher添加至依赖中，进行依赖收集
  修改对象值的时候，触发setter函数，setter通知之前收集依赖得到的订阅者Dep中的每一个Watcher，通知组件更新。此时Watcher开始调用update更新视图
- Observer负责将数据转换成getter/setter形式； Dep负责管理数据的依赖列表；是一个发布订阅模式，上游对接Observer，下游对接Watcher Watcher是实际上的数据依赖，负责将数据的变化转发到外界(渲染、回调)； 首先将data传入Observer转成getter/setter形式；当Watcher实例读取数据时，会触发getter，被收集到Dep仓库中；当数据更新时，触发setter，通知Dep仓库中的所有Watcher实例更新，Watcher实例负责通知外界

