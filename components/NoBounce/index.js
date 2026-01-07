import React, { Component } from 'react'

export class NoBounce extends Component {
  static getDerivedStateFromProps(nextProps, prevState){
    //该方法内禁止访问this
    return {
      scrollEleSelector: nextProps.scrollEleSelector || '.shangJi-welcome-page-wrap',
      excludeSelectors: Object.assign([], prevState.excludeSelectors, nextProps.excludeSelectors || [])
    }
  }

  state = {
    startY: 0,
    endY: 0,
    scrollEleSelector: '.shangJi-welcome-page-wrap',
    excludeSelectors: [
      '.am-list-view-scrollview',
      '.am-picker-popup-wrap',
      '.am-modal'
    ],
  }

  componentDidMount() {
    document.body.addEventListener('touchstart', this.handleTouchStart, { passive: false })
    document.body.addEventListener('touchmove', this.handleTouchMove, { passive: false })
  }

  componentWillUnmount() {
    document.body.removeEventListener('touchstart', this.handleTouchStart)
    document.body.removeEventListener('touchmove', this.handleTouchMove)
  }

  handleTouchStart = (e) => {
    this.setState({
      startY: e.touches[0].pageY
    })
  }

  handleTouchMove = (e) => {
    // 记录手指触摸的移动中的坐标
    const endY = e.touches[0].pageY
    const { startY } = this.state
    const scrollEle = document.querySelector(this.state.scrollEleSelector)
    const { scrollTop: top, scrollHeight: bodyScrollTop } = scrollEle
    const { innerHeight: windowHeight } = window
    const isExclude = this.isExclude(e.target)
    this.setState({
      endY
    })
    if (
      !isExclude
      && endY > startY
      && top <= 0
    ) {
      // 手指下滑，页面到达顶端不能继续下滑
      e.preventDefault()
    }
    if (
      !isExclude
      && endY < startY
      && (top + windowHeight) >= bodyScrollTop
    ) {
      // 手指上滑，页面到达底部能继续上滑
      e.preventDefault()
    }
  }

  isExclude(target) {
    const { excludeSelectors } = this.state
    let isContains = false
    excludeSelectors.forEach((selector) => {
      const elems = document.querySelectorAll(selector)
      if (elems && elems.length > 0) {
        elems.forEach((item) => {
          if (item.contains(target)) {
            isContains = true
          }
        })
      }
    })

    return isContains
  }
  
  render() {
    return (
      <div></div>
    )
  }
}

export default NoBounce

