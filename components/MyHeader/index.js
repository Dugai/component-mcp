import React, { Component } from 'react'
import './index.less'

class MyHeader extends Component {
  render() {
    const styleObj = this.props.style || {}
    return (
      <div className="my-header-wrap" style={styleObj}>
        <span>{this.props.title || ''}</span>
      </div>
    )
  }
}

export default MyHeader
