import ZVue from './zvue.ts';

const vm = (new ZVue({
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
}) as any);
Object.assign(window, { vm });