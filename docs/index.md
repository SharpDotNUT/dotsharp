---
layout: home

hero:
  name: dotsharp
  text: 面向 Vue 3 的组件库
  tagline: 一个采用 Material You 设计的，开箱即用的轻量化组件库
  actions:
    - theme: brand
      text: 开始使用
      link: /guide/getting-started
    - theme: alt
      text: 浏览组件
      link: /components/button

features:
  - title: 动态取色
    details: 单个源色经 HCT 生成 Material 3 全套色调，调用 setSourceColor() 即可运行时整体换色；明暗主题可跟随系统或手动切换。
  - title: 国际化
    details: 日期、时间等组件的内置文案集中维护，setLocale() 切换语言，缺语言时补一份 LocaleMessages 即可接入。
  - title: 自定义性
    details: 样式全部绑定 --ds-* 自定义属性，覆盖 token 就能整体换肤；纯文本交给属性，富内容交给插槽。
  - title: 轻量化
    details: 运行时只有 @iconify/vue 与色彩工具两个依赖，vue 作为 peer dependency，不额外引入样式框架。
  - title: TS 优先
    details: props 与事件用类型化声明编写，类型随产物一起发布，TabsValue、SelectValue 这类值类型也从入口统一导出。
  - title: 组件丰富
    details: 覆盖按钮、表单、选择、导航、浮层与反馈等常用场景，交互元素基于原生标签，状态通过 ARIA 表达。
  - title: 按需引入
    details: ESM 单文件输出，sideEffects 只声明 CSS，使用方未引用的组件会被构建工具摇树删除。
  - title: 文档完善
    details: 每个组件的说明、实时演示与代码片段都写在组件目录的 README.md 里，文档站直接引入同一份文件，示例不会与实现脱节。
---
