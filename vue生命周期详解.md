---
vue生命周期详解
---

![lifecycle](C:\Users\hp\Desktop\lifecycle.png)



### 1.beforeCreate和created之间

**在这个生命周期之间，进行初始化事件，进行数据的观测，可以看到在created的时候数据已经和data属性进行绑定（放在data中的属性当值发生改变的同时，视图也会改变）。**

**注意：此时还是没有el选项**

### 2.created钩子函数和beforeMount间的生命周期

**首先，会判断对象是否有el选项：如果有的话就继续向下编译，如果没有el选项，则停止编译，也就意味着停止了生命周期，直到在该vue实例上调用vm.$mount(el)。**

（1）如果vue实例对象中有template参数选项，则将其作为模板编译成render函数。

（2）如果没有template选项，则将外部HTML作为模板编译。

（3）可以看到template中的模板优先级要高于outer HTML的优先级。

**所以综合排名优先级：render函数选项 > template选项 > outer HTML**(el)

### 3.beforeMount和mounted 钩子函数间的生命周期

**可以看到此时是给vue实例对象添加$el成员，并且替换掉挂在的DOM元素。因为在之前console中打印的结果可以看到beforeMount之前el上还是undefined。**

### 4.mounted

**在mounted之前p中还是通过{{message}}进行占位的，因为此时还没有挂在到页面上，还是JavaScript中的虚拟DOM形式存在的。在mounted之后可以看到h1中的内容发生了变化。**

### 5.beforeUpdate钩子函数和updated钩子函数间的生命周期

##### 当vue发现data中的数据发生了改变，会触发对应组件的重新渲染，先后调用beforeUpdate和updated钩子函数。

**在beforeUpdate可以监听到data的变化，但是view层没有被重新渲染，view层的数据没有变化。等到updated的时候，view层才被重新渲染，数据更新。**

### 6.beforeDestroy和destroyed钩子函数间的生命周期

**beforeDestroy钩子函数在实例销毁之前调用。在这一步，实例仍然完全可用。**

**destroyed钩子函数在Vue 实例销毁后调用。调用后，Vue 实例指示的所有东西都会解绑定，所有的事件监听器会被移除，所有的子实例也会被销毁**



