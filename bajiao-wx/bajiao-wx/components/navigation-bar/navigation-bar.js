Component({
  options: {
    multipleSlots: true
  },
  properties: {
    extClass: { type: String, value: '' },
    title: { type: String, value: '' },
    background: { type: String, value: '' },
    color: { type: String, value: '' },
    back: { type: Boolean, value: true },
    loading: { type: Boolean, value: false },
    homeButton: { type: Boolean, value: false },
    animated: { type: Boolean, value: true },
    show: {
      type: Boolean,
      value: true,
      observer: '_showChange'
    },
    delta: { type: Number, value: 1 }
  },
  data: {
    displayStyle: '',
    ios: false,
    innerStyle: '',
    innerPaddingRight: '',
    leftWidth: '',
    safeAreaTop: ''
  },
  observers: {
    'color, background, displayStyle, innerPaddingRight, safeAreaTop'(color, bg, display, padding, safe) {
      const style = [
        `color:${color || '#000'}`,
        `background:${bg || '#fff'}`,
        display || '',
        padding || '',
        safe || ''
      ].filter(Boolean).join(';');
      this.setData({ innerStyle: style });
    }
  },
  lifetimes: {
    attached() {
      const rect = wx.getMenuButtonBoundingClientRect()
      const platform = (wx.getDeviceInfo() || wx.getSystemInfoSync()).platform
      const isAndroid = platform === 'android'
      const isDevtools = platform === 'devtools'
      const { windowWidth, safeArea: { top = 0 } = {} } = wx.getWindowInfo() || wx.getSystemInfoSync()
      
      const paddingRight = `padding-right: ${windowWidth - rect.left}px`
      const leftWidth = `width: ${windowWidth - rect.left}px`
      const safeTop = isDevtools || isAndroid ? `height: calc(var(--height) + ${top}px); padding-top: ${top}px` : ''
      
      this.setData({
        ios: !isAndroid,
        innerPaddingRight: paddingRight,
        leftWidth: leftWidth,
        safeAreaTop: safeTop
      })
      // 触发一次 observers 计算 innerStyle
      this.setData({
        innerStyle: [
          `color:${this.properties.color || '#000'}`,
          `background:${this.properties.background || '#fff'}`,
          this.data.displayStyle || '',
          paddingRight,
          safeTop
        ].filter(Boolean).join(';')
      })
    }
  },
  methods: {
    _showChange(show) {
      const animated = this.data.animated
      let displayStyle = ''
      if (animated) {
        displayStyle = `opacity: ${show ? '1' : '0'};transition:opacity 0.5s;`
      } else {
        displayStyle = `display: ${show ? '' : 'none'}`
      }
      this.setData({ displayStyle })
    },
    back() {
      const data = this.data
      if (data.delta) {
        wx.navigateBack({ delta: data.delta })
      }
      this.triggerEvent('back', { delta: data.delta }, {})
    }
  }
})