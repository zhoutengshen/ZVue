interface ZVueOption {
  data: Function | Object;
  el: string,
  methods: object,
}

class Utils {
  static observe(target: any): void {
    if (!Utils.isRef(target)) {
      return;
    }
    Object.keys(target).forEach((key) => {
      Utils.defineReactive(target, key, target[key]);
    });
  }
  static set(target: any, key: string, value: any): void {
    Utils.defineReactive(target, key, value);
  }
  static isRef(value: any): boolean {
    return !!value && (typeof value == 'object');
  }
  static defineReactive(target: any, key: string, value: any): void {
    if (!Utils.isRef(target)) {
      return;
    }
    if (!Array.isArray(target)) {
      const dep: Dep = new Dep();
      target[`$$${key}`] = dep;
      Object.defineProperty(target, key, {
        get() {
          return value;
        },
        set(newValue) {
          dep.remove();
          value = newValue;
          dep.watchers.forEach(watcher => {
            watcher.update();
          });
          if (Utils.isRef(newValue)) {
            Utils.observe(newValue);
          }
        }
      });
    } else {
      // 数组变异方法
      ['push', 'shift', 'unshift', 'pop', 'sort', 'splice', 'reverse']
    }
    Utils.observe(value);
  }
  static proxy(target: any, source: any): void {
    if (!Utils.isRef(target) || !Utils.isRef(source)) {
      console.warn('被代理的值必须是对象');
      return;
    }
    Object.keys(source).forEach((key: string) => {
      Object.defineProperty(target, key, {
        get(): any {
          return source[key];
        },
        set(value) {
          source[key] = value;
        }
      });
    });
  }
}

export default class ZVue {
  $option: ZVueOption;
  private $data: Function | Object;
  private compiler: Compiler;
  constructor(option: ZVueOption) {

    if (typeof option.data == 'function') {
      this.$data = option.data() || {};
    } else {
      this.$data = option.data || {};
    }
    if (!option.methods) {
      option.methods = {};
    }
    this.$option = option;
    Utils.proxy(this, this.$data);
    Utils.observe(this.$data);
    this.compiler = new Compiler(this);
    if (!!option.el) {
      this.mount(option.el);
    }
  }
  $set(target: any, key: string, value: any): void {
    // TODO:
    Utils.set(target, key, value);
    let source = { [key]: value };
    Utils.proxy(this, source);
  }
  mount(selector: string): void {
    const element: Element | null = document.querySelector(selector);
    if (!!element) {
      this.compiler.complie(element)
    }
  }
}

class Compiler {
  private vm: ZVue;
  constructor(vm: any) {
    this.vm = vm;
  }
  complie(element: Element): void {

    Array.from(element.childNodes).forEach(node => {
      if (node.nodeType == 1) {
        // Element
        this.complieEle(node as Element);
        this.complie(node as Element);
      } else if (node.nodeType == 3) {
        this.compileTxt(node);
      }
    });
  }
  complieEle(element: Element): void {
    // 
    const attrs = element.attributes;
    this.zOn(attrs, element);
  }
  compileTxt(txtNode: Node): void {
    let template: string = txtNode.nodeValue || '';
    const matchs = template.match(/{{(.*?)}}/g)?.map(item => item.replace(/{{(.*?)}}/g, '$1'));

    let replaceTemplate = template;
    if (matchs?.length) {
      matchs.forEach(key => {
        const $data = (this.vm as any)['$data'];

        if ($data) {
          const dep = $data[`$$${key}`];
          if (dep instanceof Dep) {
            dep.add(new TxtWatcher(txtNode, this.vm, template));
          }
        }
        const value = (this.vm as any)[key] as any || '';
        const reg = RegExp(`{{${key}}}`, 'g');
        replaceTemplate = replaceTemplate.replace(`{{${key}}}`, value);
      });
      txtNode.nodeValue = replaceTemplate;
    }
  }
  zOn(attrs: NamedNodeMap, element: Element): void {
    Array.from(attrs).forEach(item => {
      const name: string = item.name;
      const value: string = item.value;
      const methods = this.vm.$option.methods as any;
      let handel = methods[value];

      if (handel instanceof Function) {
        handel = handel.bind(this.vm);
      } else {
        const funcReg = /^[$_A-Za-z][\dA-Za-z]*\((.*)\)$/;
        if (funcReg.test(value)) {
          const args = RegExp.$1;
        }
      }

      // TODO name 语法检查
      if (/^@(.*)?/.test(name)) {
        element.addEventListener(RegExp.$1, function (...args) {
          handel();
        });
      } else if (/z-on:(.*)/.test(name)) {
        element.addEventListener(RegExp.$1, function (...args) {
          handel();
        });
      }
    });

    const attrVal = attrs.getNamedItem('z-on')?.value;

    if (attrVal) {
      const methods = this.vm.$option?.methods as any;
      const handle = methods[attrVal];
      handle();
    }
  }
}

class Dep {
  watchers: Array<WatcherInterface> = [];
  add(watcher: WatcherInterface): void {
    const mapTable: Map<any, boolean> = new Map();
    this.watchers = [...this.watchers, watcher].filter(el => {
      if (mapTable.get(el.el)) {
        return false;
      } else {
        mapTable.set(el.el, true);
        return true;
      }
    });
  }
  // TODO:如何释放
  remove(): void {
    // 解除对dom的引用
    this.watchers = this.watchers.filter(watcher => {
      return watcher.el.isConnected;
    });
  }
}

interface WatcherInterface {
  el: Node;
  update(): void;
}
class TxtWatcher implements WatcherInterface {
  el: Node;
  template: string;
  vm: ZVue;
  constructor(el: Node, vm: ZVue, template: string) {
    this.el = el;
    this.template = template;
    this.vm = vm;
  }
  update(): void {
    const matchs = this.template.match(/{{(.*?)}}/g)?.map(item => item.replace(/{{(.*?)}}/g, '$1'));
    let replaceTemplate = this.template;
    if (matchs) {
      matchs.forEach(key => {
        const value = (this.vm as any)[key] as any || '';
        const reg = RegExp(`{{${key}}}`, 'g');

        replaceTemplate = replaceTemplate.replace(reg, value);
      });
      this.el.nodeValue = replaceTemplate;
    }
  }

}

