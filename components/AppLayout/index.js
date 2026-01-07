/**
 * 【LAYOUT】强制端内访问组件
 * 功能: 该部分为基础layout组件，限制必须端内访问，作为高阶组件使用
 * 使用方式: router中对页面组件包装，参考router/index.js内的使用方式
 * props参数: children 子组件
 */
import React, { Fragment, useEffect, useState } from 'react'
import { withRouter } from 'react-router-dom'

export default withRouter(props => {
  const [workStatus, setWorkStatus] = useState(1) // 0加载中，1bridge完成，2bridge失败

  useEffect(() => {
    // 通过端内判断，是否加载下一步
    if (window.$ljBridge && window.$ljBridge.ready) {
      window.$ljBridge.ready((bridge, webStatus) => {
        let flag = 0

        // 方便开发与测试，只有线上环境才禁止使用浏览器访问
        if (webStatus.isApp || location.host !== 'mbrand.ke.com') {
          flag = 1
        } else {
          flag = 2
        }

        setWorkStatus(flag)
      })
    }
  }, [])

  // 加载完成，确认在端内，渲染后续内容
  if (workStatus === 1) {
    const { children } = props
    return (
      <Fragment>
        {React.Children.map(children, child => React.cloneElement(child, { ...props }))}
      </Fragment>
    )
  }
  // 加载完成，确认不在端内，展示APP访问
  if (workStatus === 2) {
    return (
      <div className="noapp">
        <img src="//s2.ljcdn.com/mensa/static/m/images/error/404.png" />
        <p>该功能的网页版已经下线</p>
        <p>请通过移动端APP打开</p>
        <p className="guide">访问路径：A+/Link-全部-营销工具-金贝平台</p>
      </div>
    )
  }
  return null
})
