import React, { Component, Fragment } from 'react'
import moduleStyle from './index.module.less'

class Empty extends Component {
  render() {
    const { text = '暂无相关的商品', Actions } = this.props
    return (
      <Fragment>
        <div className={moduleStyle.empty}></div>
        <div className={moduleStyle['empty-desc']}>{text}</div>
        {Actions ? (
          <div className={moduleStyle['action-wrapper']}>
            <Actions />
          </div>
        ) : null}
      </Fragment>
    )
  }
}

export default Empty
