import React from 'react'

// 高阶组件（HOC），用于控制 touchmove 事件
const withTouchMoveControlHoc = (WrappedComponent) => {
  return class extends React.Component {
    isPickerVisibleRef = React.createRef(false)

    componentDidMount() {
      document.addEventListener('touchmove', this.handleTouchMove, { passive: false })
    }

    componentWillUnmount() {
      document.removeEventListener('touchmove', this.handleTouchMove)
    }

    // 处理 touchmove 事件，根据 isPickerVisibleRef 的值决定是否阻止默认行为
    handleTouchMove = (event) => {
      if (this.isPickerVisibleRef.current) {
        event.preventDefault()
      }
    }

    // 更新 isPickerVisibleRef 的值
    handlePickerVisible = (visible) => {
      this.isPickerVisibleRef.current = visible
    }

    // 渲染被包裹的组件，并传递 onVisibleChange 回调函数
    render() {
      return <WrappedComponent {...this.props} onVisibleChange={this.handlePickerVisible} />
    }
  }
}

export default withTouchMoveControlHoc
