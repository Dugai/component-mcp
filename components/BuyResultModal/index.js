import React, { Component, Fragment } from 'react'
import { Modal } from 'antd-mobile'
import buyResultSuccess from 'assets/images/member/buy-result-success@2x.png'
import buyResultError from 'assets/images/member/buy-result-error@2x.png'
import './index.less'

class BuyResult extends Component {
  state = {
    info: {
      success: {
        icon: buyResultSuccess,
      },
      error: {
        icon: buyResultError,
      }
    }
  }
  closeBuyResult() {
    this.props.onCancel && this.props.onCancel()
  }
  render() {
    const info = this.state.info
    const type = this.props.type
    const text = this.props.text
    const buyResultInfo = info[type] || {
      icon: buyResultError,
    }
    return (
      <Fragment>
        {
          this.props.visible && 
          <Modal
            title={''}
            className="buy-result-modal"
            transparent
            closable={true}
            visible={this.props.visible}
            onClose={this.closeBuyResult.bind(this)}
          >
            <div className="buy-result-wrap">
              <div className="result-icon">
                <img src={buyResultInfo.icon} alt=""/>
              </div>
              <h4>{ text }</h4>
              { this.props.children }
            </div>
          </Modal>
        }
      </Fragment>
    )
  }
}

export default BuyResult