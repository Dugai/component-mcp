/**
 * 三次握手商机限流预警弹窗组件
 * 用处： 潜客包plus以及直通车三次握手限流提示
 */
import React, { useState } from 'react'
import { Modal } from 'antd-mobile'
import { Icon } from '@ke/ked-m'
import { WarningOutlined } from '@ant-design/icons'
import NP from 'number-precision'
import './index.less'

export default function (props) {
  const { type, handshakeData, visible, onClose, cityNatureRate = 0 } = props

  // 判断是潜客包plus还是直通车
  const judgeType = () => {
    if (type === 'cpa') {
      return '直通车'
    }

    return '潜客包Plus'
  }

  // 判断是否是预警状态
  const judgeStatus = () => {
    return (
      handshakeData.agentLevel && handshakeData.agentLevel != 0 && handshakeData.agentLevel != 5
    )
  }

  const renderTable = () => (
    <div className="rule-table">
      <div className="rule-table-line table-header">
        <div className="label">状态类型</div>
        <div className="value" style={{ textAlign: 'center' }}>
          状态说明
        </div>
      </div>
      <div className="rule-table-line">
        <div className="label">限流预警</div>
        <div className="value">
          握手率低于{Math.max(NP.minus(cityNatureRate, 10), 0).toFixed(2)}
          %时，提示限流预警，不影响商机分配
        </div>
      </div>
      <div className="rule-table-line">
        <div className="label">限流中</div>
        <div className="value">
          握手率低于{Math.max(NP.minus(cityNatureRate, 20), 0).toFixed(2)}
          %时，降低商机分配概率
        </div>
      </div>
      <div className="rule-table-line">
        <div className="label">暂停分配</div>
        <div className="value">
          握手率低于{Math.max(NP.minus(cityNatureRate, 35), 0).toFixed(2)}
          %时，限制报买并暂停分配{judgeType()}商机7天/14天
        </div>
      </div>
      <div className="rule-table-line">
        <div className="label">豁免中</div>
        <div className="value">
          <p>①{judgeType()}商机不足30条时，不考核</p>
          <p>
            ②暂停分配结束后获得的商机不足10条时，暂不考核（达到10条商机之后重新计算近30条商机的三次握手率）
          </p>
        </div>
      </div>
    </div>
  )

  return (
    <Modal
      popup
      closable
      className="throttle-warning-modal"
      visible={visible}
      animationType="slide-up"
      onClose={onClose}
    >
      <div className="business-modal-title">三次握手率</div>
      <div>
        <span className="sub-title">当前状态：</span>
        <span className={`${judgeStatus() ? 'warning-status status' : 'success-status status'}`}>
          {handshakeData.agentLabel}&nbsp;
          {judgeStatus() ? <WarningOutlined /> : null}
        </span>
        <p className={`${judgeStatus() ? 'warning-text' : 'success-text'}`}>{handshakeData.tips}</p>
      </div>
      <p className="content" style={{ margin: '2px 0px 10px 0px' }}>
        最近30条{judgeType()}商机中，三次握手率
        {NP.times(Number(handshakeData.agentRate), 100)}% ，城市整体币化商机三次握手率
        {NP.times(Number(handshakeData.cityNatureRate), 100)}%
      </p>
      <div className="sub-title">规则解读</div>
      <p className="content">三次握手率影响{judgeType()}商机的分配情况，考核规则如下</p>
      <p className="content">
        考核指标：经纪人近30条{judgeType()}商机和城市近14天币化商机的三次握手率差距
      </p>
      {renderTable()}
      <div className="tip">
        <Icon type="question" size="xs" color="#999"></Icon>
        <div className="tip-text">数据范围：统计最近30条{judgeType()}商机，剔除无效商机</div>
      </div>
    </Modal>
  )
}
