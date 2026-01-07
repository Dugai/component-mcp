import React, { Component } from 'react'
import { WingBlank, Flex, Modal, TextareaItem } from 'antd-mobile'

import moduleStyle from './index.module.less'
import './textarea.reset.less'

const types = [
  { index: 0, val: '有看房意向' },
  { index: 1, val: '已委托给别人' },
  { index: 2, val: '需求不准确' },
  { index: 3, val: '客户无需求' },
]

class PopModal extends Component {
  constructor(props) {
    super(props)
    this.props = props
    const recodes = this.props.recodes || {}
    this.state = {
      opptyId: this.props.opptyId,
      remark: recodes.remark || '',
      opptyFlagId: recodes.opptyFlagId,
      opptyFlagName: recodes.opptyFlagName || '',
    }
  }

  onCancel() {
    this.props.onCancel()
  }

  onOK() {
    if (typeof this.state.opptyFlagId === 'number' && this.state.opptyFlagId > -1) {
      this.props.onOK({
        ...this.state,
      })
    }
  }

  selectType(t) {
    this.setState({
      opptyFlagId: t.index,
      opptyFlagName: t.val,
    })
  }

  onChange(value) {
    this.setState({
      remark: value,
    })
  }

  render() {
    const { opptyFlagId, remark } = this.state
    const styleUser = this.props.style
    return (
      <Modal popup visible={true} animationType="slide-up" afterClose={() => {}}>
        <WingBlank>
          <div className={moduleStyle['item-modal-top-block']}>
            <div onClick={this.onCancel.bind(this)} className={moduleStyle['item-modal-cancel']}>
              取消
            </div>
            <div className={moduleStyle['item-modal-title']}>记录跟进</div>
            <div
              onClick={this.onOK.bind(this)}
              style={{
                color: typeof opptyFlagId === 'number' && opptyFlagId > -1 ? styleUser.color : '',
              }}
              className={
                typeof opptyFlagId === 'number' && opptyFlagId > -1
                  ? moduleStyle['item-modal-ok-valid']
                  : moduleStyle['item-modal-ok-invalid']
              }
            >
              确定
            </div>
          </div>
        </WingBlank>
        <div className={moduleStyle['item-modal-split-line']}></div>
        <WingBlank>
          <div className={moduleStyle['item-modal-select-desc']}>请选择(必选)</div>
          <Flex justify="between" className={moduleStyle['item-modal-select-tag-block']}>
            {types.map((t, i) => {
              return (
                <div
                  key={i}
                  onClick={this.selectType.bind(this, t)}
                  style={{
                    color: opptyFlagId === t.index ? styleUser.color : '',
                    background: opptyFlagId === t.index ? styleUser.background : '',
                  }}
                  className={
                    opptyFlagId === t.index
                      ? moduleStyle['item-modal-select-tag-active']
                      : moduleStyle['item-modal-select-tag']
                  }
                >
                  {t.val}
                </div>
              )
            })}
          </Flex>
          <div className={moduleStyle['item-modal-remark']}>备注信息</div>
          <TextareaItem
            className="item-modal-textarea"
            placeholder="请输入备注信息…"
            rows={4}
            count={50}
            defaultValue={remark}
            onChange={this.onChange.bind(this)}
          />
        </WingBlank>
      </Modal>
    )
  }
}

export default PopModal
