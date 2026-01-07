import React from 'react'
import { RightOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import { Toast } from 'antd-mobile'
import { digConfig } from 'config/digConfig'

import './qkDataOverview.less'

dayjs.extend(customParseFormat)

export default class QkDataOverview extends React.Component {
  constructor(props) {
    super(props)
  }
  handleClick = () => {
    digConfig.QianKe.qiankeDashBoardBtn()

    const { data } = this.props
    const { isPlus = true } = data
    if (isPlus) {
      this.props.onClick && this.props.onClick('jumpPage')
    } else {
      Toast.info('该数据看板为plus包专属', 2)
      this.props.onClick && this.props.onClick('toast')
    }
  }

  render() {
    const { data } = this.props
    const { descName, brokerOptions = [], isPlus = true } = data
    return (
      <div className="c-qk-data-overview-container">
        <div className="c-qk-data-overview-top">
          <div>
            <span className="title">{descName}</span>
          </div>
          <div onClick={this.handleClick}>
            <span className="c-qk-data-subtitle">数据看板详情</span>
            <RightOutlined style={{ fontSize: '12px', color: '#cccccc' }} />
          </div>
        </div>
        <div className="c-qk-data-overview-body">
          {(brokerOptions || []).map((item, index) => {
            let itemStyle =
              index === (brokerOptions || []).length - 1
                ? 'c-qkdata-item'
                : 'c-qkdata-item c-qkdata-item-border'
            let showRank = index !== (brokerOptions || []).length - 1
            return (
              <div key={index} className={itemStyle}>
                <div className="item-name">{item.descName}</div>
                <div className="item-value">{item.descValue}</div>
                {showRank ? (
                  <div className="item-rank-box">
                    <span className="item-label">大区排名：</span>
                    <span className="item-rank">{item.rank}</span>
                    <span className="item-total-rank">/{item.totalRank}</span>
                  </div>
                ) : null}
              </div>
            )
          })}
        </div>
      </div>
    )
  }
}
