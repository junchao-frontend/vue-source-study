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