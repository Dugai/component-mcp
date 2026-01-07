import React from 'react'
import { DownOutlined, UpOutlined } from '@ant-design/icons'
import { Modal, Toast } from 'antd-mobile'
import WaitDeal from './component/waitDeal'
import QkbItemTop from './component/qkbItemTop'
import QkbExpand from './component/qkbExpand'
import QkDataOverview from './component/qkDataOverview'
import './qkbOrderItemTop'
import './qkbOrderItemWaitDeal'
import './index.less'
const alert = Modal.alert

export default class QkbOrderComponent extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      expand: false,
      qyExpand: false,
      right: (props.data && props.data.right) || {},
    }
  }
  /**
   * 展开收起切换
   *
   */

  handleToggle = (e) => {
    e.stopPropagation()
    const {
      data: { opptyList },
    } = this.props
    if (Array.isArray(opptyList) && opptyList.length <= 0) {
      Toast.info('暂无商机')
      return
    }
    const { expand } = this.state
    this.setState({ expand: !expand })
  }
  handleQyToggle = (e) => {
    e.stopPropagation()
    const { qyExpand } = this.state
    this.setState({ qyExpand: !qyExpand })
  }
  executeSpeed = async (data) => {
    const { onSpeedClick } = this.props
    if (onSpeedClick) {
      const result = await onSpeedClick(data)
      if (result) {
        this.setState({ right: { canUseRight: true, useRighted: true, speedNum: result } })
      }
    }
  }
  gotoSpeed = (e, data) => {
    const { right } = this.state
    data.right = right
    const { useRighted } = right || {}
    e.stopPropagation()
    if (useRighted) {
      this.executeSpeed(data)
    } else {
      alert('提速权益', '本次提速将加快您的商机分配速度，请以自己实际情况确认是否提速', [
        { text: '取消', style: 'default' },
        {
          text: '确定',
          onPress: () => {
            this.executeSpeed(data)
          },
          style: 'warning',
        },
      ])
    }
  }
  gotoselectValiage = (e, data) => {
    e.stopPropagation()
    const { purposeValiageClick } = this.props
    if (purposeValiageClick) {
      purposeValiageClick(data)
    }
  }
  render() {
    const { data, onClick } = this.props
    let { type, resbolckStatus } = data
    const { expand, right, qyExpand } = this.state
    if (type === 'shangjiData') {
      return <QkbExpand {...this.props} />
    }
    if (type === 'qkDataOverview') {
      return <QkDataOverview {...this.props} />
    }
    let quanlicount = 0
    if (right.canUseRight) {
      quanlicount += 1
    }
    if (resbolckStatus != 2) {
      quanlicount += 1
    }
    return (
      <div
        className='c-qkborder-container'
        onClick={() => {
          onClick && onClick(data)
        }}
      >
        <QkbItemTop {...this.props} />
        <div className="c-qkborder-bottom" onClick={this.handleToggle}>
          <div className="title">待处理客户详情</div>
          <div>
            {expand ? (
              <UpOutlined style={{ fontSize: '16px', color: '#cccccc' }} />
            ) : (
              <DownOutlined style={{ fontSize: '16px', color: '#cccccc' }} />
            )}
          </div>
        </div>
        <div
          style={{
            maxHeight: this.state.expand ? '10000px' : '0px',
            overflow: 'hidden',
            background: '#f8f8f8',
          }}
        >
          <WaitDeal {...this.props} />
        </div>
      </div>
    )
  }
}
