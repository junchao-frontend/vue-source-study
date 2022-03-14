import observe from './observe.js';
import Watcher from './Watcher.js';

var obj = {
    a: {
        m: {
            n: 5
        }
    },
    b: 10,
    c: {
        d: {
            e: {
                f: 6666
            }
        }
    },
    g: [22, 33, 44, 55]
};


observe(obj);
new Watcher(obj, 'a.m.n', (val) => {
    console.log('★我是watcher，我在监控a.m.n', val);
});
// obj.g.push(1)
// obj.g[4] = 10
console.log(obj);
// console.log(window);
// obj.a.m.n = 88;
// obj.g.push(66);
