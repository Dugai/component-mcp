import React, { useEffect, useState } from 'react'
import { Tag, Icon } from '@ke/ked-m'
import KeFetch from 'utils/keFetch'
import * as api from 'config/apiConfig'
import { workCity } from 'utils/getWorkCity'
import { ES_PLUS_QIANKE } from '../../../combinedCode'
import NP from 'number-precision'
import './qkDataOverview.less'

import ThrottlingWarningModal from '@/components/ThrottlingWarningModal'

const QkPlusHandshakeData = () => {
  const [handshakeData, setHandshakeData] = useState({
    agentLabel: '',
    agentLevel: '',
    agentRate: '',
    cityNatureRate: '',
    tips: '',
  })
  const [isVisibleModal, setIsVisibleModal] = useState(false)

  useEffect(() => {
    getHandshakeData()
  }, [])

  // 获取握手率数据
  const getHandshakeData = () => {
    const url = api.getOpptyHandshakeOverview
    KeFetch(url, {
      data: {
        cityCode: workCity(),
        combinedCode: ES_PLUS_QIANKE,
      },
    }).then((data) => {
      setHandshakeData(data)
    })
  }

  return (
    <div className="c-qk-data-overview-container" style={{ marginBottom: 8 }}>
      <div className="c-qk-data-overview-top">
        <div style={{ display: 'unset' }}>
          <span className="title">三次握手率</span>
          <span style={{ color: '#999', marginLeft: 8 }}>数据每天更新</span>
        </div>
      </div>
      <div className="c-qk-data-overview-body">
        <div className="c-qkdata-item c-qkdata-item-border">
          <div className="item-name">城市币化商机 (近14日数据)</div>
          <div className="item-value">
            {handshakeData.cityNatureRate ? (
              <span>{NP.times(handshakeData.cityNatureRate, 100)}%</span>
            ) : (
              '-'
            )}
          </div>
        </div>
        <div className="c-qkdata-item">
          <div className="item-name">潜客包plus商机 (近30条商机)</div>
          <div
            className="item-value"
            style={
              handshakeData.agentLevel &&
              handshakeData.agentLevel != -1 &&
              handshakeData.agentLevel != 0 &&
              handshakeData.agentLevel != 5
                ? { color: '#E42514' }
                : {}
            }
          >
            {handshakeData.agentRate ? (
              <span> {NP.times(handshakeData.agentRate, 100)}%</span>
            ) : (
              <span style={{ fontSize: 18, fontWeight: 500 }}>暂无</span>
            )}
            {handshakeData.agentLabel ? (
              <Tag
                color={
                  handshakeData.agentLevel &&
                  handshakeData.agentLevel != 0 &&
                  handshakeData.agentLevel != 5
                    ? 'failure'
                    : 'success'
                }
                style={{ margin: '0px 4px 0px 6px' }}
              >
                <span className="tag-label">{handshakeData.agentLabel}</span>
                <Icon
                  onClick={() => setIsVisibleModal(true)}
                  type="question"
                  size="xs"
                  color="#999"
                ></Icon>
              </Tag>
            ) : null}
          </div>
        </div>
      </div>
      <ThrottlingWarningModal
        handshakeData={handshakeData}
        type="oppty"
        visible={isVisibleModal}
        onClose={() => setIsVisibleModal(false)}
        cityNatureRate={
          handshakeData.cityNatureRate ? NP.times(handshakeData.cityNatureRate, 100) : 0
        }
      />
    </div>
  )
}

export default QkPlusHandshakeData
