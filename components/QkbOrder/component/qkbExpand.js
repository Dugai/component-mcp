import React from 'react'
import { DownOutlined, UpOutlined, QuestionCircleFilled } from '@ant-design/icons'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import { Popover } from 'antd-mobile'
import './qkbExpand.less'
dayjs.extend(customParseFormat)

export default class QkbExpand extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      expand: false,
      isPlus: true,
    }
  }
  /**
   * 展开收起切换
   *
   */
  handleToggle = () => {
    const { expand } = this.state
    this.setState({ expand: !expand })
  }
  handleButtonClick = (isPlus) => {
    this.setState({ isPlus: isPlus })
  }
  renderPopover = (item) => {
    const contentText =
      '您在所购买商圈下，获得C端房源下的展现量，T+1数据，该数据可能小于分配客户数，因为分配的客户中可能部分是留资客户'
    return (
      <Popover
        overlayClassName='c-qkborder-remark'
        overlay={<div>{contentText}</div>}
        visible={false}
        placement="right"
      >
        <span style={{ alignSelf: 'flex-start' }}>
          {item.label}
          <QuestionCircleFilled
            style={{ fontSize: '16px', color: '#ccc', marginLeft: '2px' }}
          />{' '}
        </span>
      </Popover>
    )
  }
  render() {
    const { data } = this.props
    const {
      packageCount,
      brokerOpptyInfoVos: { normal, plus },
    } = data
    const { expand, isPlus } = this.state
    const plusPackage = [
      { amount: plus.exposure, label: '展现量' },
      { amount: plus.costCount, label: '已分配客户数' },
      { amount: plus.unCostCount, label: '未分配客户数' },
      { amount: plus.givenCount, label: '赠送客户数' },
      { amount: plus.useRightCount, label: '提速权益获取' },
      { amount: plus.unuseRightCount, label: '提速权益剩余' },
    ]
    const nomalPackage = [
      { amount: normal.exposure, label: '展现量' },
      { amount: normal.costCount, label: '已分配客户数' },
      { amount: normal.unCostCount, label: '未分配客户数' },
      { amount: normal.givenCount, label: '赠送客户数' },
    ]
    const showPackage = isPlus ? plusPackage : nomalPackage
    return (
      <div className='c-qkborder-container'>
        <div className="c-qkborder-top">
          <div>
            <span
              style={{ color: '#222', fontWeight: 'bold', fontSize: '16px' }}
            >{`累计购买潜客包(${packageCount})`}</span>
            <span style={{ color: '#999', fontSize: '12px', marginTop: '5px' }}>{`更新时间至${dayjs(
              isPlus ? plus.updateTime : normal.updateTime
            ).format('YYYY/MM/DD')}`}</span>
          </div>
          <div>
            {expand ? (
              <UpOutlined
                style={{ fontSize: '16px', color: '#cccccc' }}
                onClick={this.handleToggle}
              />
            ) : (
              <DownOutlined
                style={{ fontSize: '16px', color: '#cccccc' }}
                onClick={this.handleToggle}
              />
            )}
          </div>
        </div>
        <div style={{ maxHeight: this.state.expand ? '10000px' : '0px', overflow: 'hidden' }}>
          <div className="c-qkborder-button">
            <span
              className={isPlus ? 'active' : 'unactive'}
              onClick={() => {
                this.handleButtonClick(true)
              }}
            >{`Plus包(${plus.packageCount})`}</span>
            <span
              className={isPlus ? 'unactive' : 'active'}
              onClick={() => {
                this.handleButtonClick(false)
              }}
            >{`普通包(${normal.packageCount})`}</span>
          </div>
          <div className="c-qkborder-body">
            {showPackage.map((item, index) => {
              return (
                <div key={item.label}>
                  <span>{item.amount}</span>
                  {index === 0 ? this.renderPopover(item) : <span>{item.label}</span>}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }
}
