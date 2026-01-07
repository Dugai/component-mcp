import React from 'react'
import Empty from 'components/Empty'
import { isLingfengAgent } from 'utils/role'

export default function (WrappedComponent, options) {
  return class extends React.Component {
    constructor(props) {
      super(props)
    }

    render() {
      if (isLingfengAgent()) {
        return <Empty text="店长不可报买商机商品" />
      }
      return <WrappedComponent {...this.props} />
    }
  }
}
