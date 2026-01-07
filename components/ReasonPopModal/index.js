import React, { Component } from 'react'
import { WingBlank, Flex, Modal, TextareaItem, Checkbox, Toast } from 'antd-mobile'

import moduleStyle from './index.module.less'
import './textarea.reset.less'

const CheckboxItem = Checkbox.CheckboxItem

class PopModal extends Component {
  constructor(props) {
    super(props)
    this.state = {
      wsChoose: { index: 0, val: '微商同业', checked: false },
      otherChoose: { index: 1, val: '其他原因(请联系客服解决)', checked: false },
    }
  }

  onCancel() {
    this.props.onCancel()
  }

  wsOnchange(tar) {
    const {
      target: { checked },
    } = tar
    let { otherChoose, wsChoose } = this.state
    if (checked) {
      wsChoose.checked = checked
      otherChoose.checked = false
      this.setState({ wsChoose, otherChoose })
    } else {
      wsChoose.checked = false
      this.setState({ wsChoose })
    }
  }
  otherOnchange(tar) {
    const {
      target: { checked },
    } = tar
    let { otherChoose, wsChoose } = this.state
    if (checked) {
      otherChoose.checked = checked
      wsChoose.checked = false
      this.setState({ wsChoose, otherChoose })
    } else {
      otherChoose.checked = false
      this.setState({ otherChoose })
    }
  }
  gotoNext = () => {
    const { wsChoose, otherChoose } = this.state
    const { onNext } = this.props
    if (!wsChoose.checked && !otherChoose.checked) {
      Toast.show('请选择申请原因')
      return
    }
    if (wsChoose.checked) {
      onNext(0)
    }
    if (otherChoose.checked) {
      onNext(1)
    }
  }

  render() {
    const { wsChoose, otherChoose } = this.state
    return (
      <Modal popup visible={true} animationType="slide-up" afterClose={() => {}}>
        <WingBlank>
          <div className={moduleStyle['item-modal-top-block']}>
            <div
              onClick={this.onCancel.bind(this)}
              className={moduleStyle['item-modal-cancel']}
            ></div>
            <div className={moduleStyle['item-modal-title']}>选择申请原因</div>
            <div onClick={this.onCancel.bind(this)} className={moduleStyle['item-modal-cancel']}>
              取消
            </div>
          </div>
        </WingBlank>
        <div className={moduleStyle['item-modal-split-line']}></div>
        <div>
          <CheckboxItem
            key={wsChoose.index}
            onChange={(tar) => this.wsOnchange(tar)}
            checked={wsChoose.checked}
          >
            {wsChoose.val}
          </CheckboxItem>
        </div>
        <div>
          <CheckboxItem
            key={otherChoose.index}
            onChange={(tar) => this.otherOnchange(tar)}
            checked={otherChoose.checked}
          >
            {otherChoose.val}
          </CheckboxItem>
        </div>
        <div
          className={moduleStyle['item-modal-tip']}
        >{`注：14天内线上审核不通过超过三次，将关闭线上申请权益`}</div>
        <div className={moduleStyle['item-modal-next']} onClick={this.gotoNext}>
          下一步
        </div>
      </Modal>
    )
  }
}

export default PopModal
