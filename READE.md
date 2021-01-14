### 虚假的MVVM

>html
```html

  <div id="app">
    <span>{{msg}}_{{count}}</span>
    <br>
    <span>点击我{{count}}</span>
    <p><span @click="handleTap">CLICK</span></p>
  </div>

```
>TS
```ts
new ZVue({
  el: '#app',
  data() {
    return {
      msg: '消息',
      count: 11
    };
  },
  methods: {
    handleTap() {
      const that = this as any;
      that.coumt = ++that.count;
    }
  }
}) ;

```

## Feature
✅ Reactive



## 未完待续