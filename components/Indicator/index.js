import React, { Component, Fragment } from 'react'
import { ActivityIndicator } from 'antd-mobile'
import './index.less'

class Indicator extends Component {
  render() {
    const props = this.props
    return (
      <div 
        className={ props.animating ? 'indicator-wrapper' : 'indicator-wrapper no-thumb' }
        style={{ ...props.style }}
      >
        {
          props.animating ?
          <div className="indicator-wrapper-inner">
            <ActivityIndicator {...props} />
          </div>
          : (
            <Fragment>
              { props.children }
            </Fragment>
          )
        }
      </div>
    )
  }
}

export default Indicator