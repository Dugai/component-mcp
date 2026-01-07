import React, { useState } from 'react'
import { Toast } from 'antd-mobile'
import DesArea from './desArea'
import { digConfig } from 'config/digConfig'
import Utils from 'utils'
import { SHANG_HE_BAO } from '@/constant'
import './waitDeal.less'

const question = (
  <svg viewBox="0 0 1024 1024" width="14" height="14">
    <defs>
      <style type="text/css" />
    </defs>
    <path
      d="M512 81.408a422.4 422.4 0 1 0 422.4 422.4A422.4 422.4 0 0 0 512 81.408z m26.624 629.76a45.056 45.056 0 0 1-31.232 12.288 42.496 42.496 0 0 1-31.232-12.8 41.984 41.984 0 0 1-12.8-30.72 39.424 39.424 0 0 1 12.8-30.72 42.496 42.496 0 0 1 31.232-12.288 43.008 43.008 0 0 1 31.744 12.288 39.424 39.424 0 0 1 12.8 30.72 43.008 43.008 0 0 1-13.312 31.744z m87.04-235.52a617.472 617.472 0 0 1-51.2 47.104 93.184 93.184 0 0 0-25.088 31.232 80.896 80.896 0 0 0-9.728 39.936v10.24H475.648v-10.24a119.808 119.808 0 0 1 12.288-57.344A311.296 311.296 0 0 1 555.52 460.8l10.24-11.264a71.168 71.168 0 0 0 16.896-44.032A69.632 69.632 0 0 0 563.2 358.4a69.632 69.632 0 0 0-51.2-17.92 67.072 67.072 0 0 0-58.88 26.112 102.4 102.4 0 0 0-16.384 61.44h-61.44a140.288 140.288 0 0 1 37.888-102.4 140.8 140.8 0 0 1 104.96-38.4 135.68 135.68 0 0 1 96.256 29.184 108.032 108.032 0 0 1 36.352 86.528 116.736 116.736 0 0 1-25.088 73.216z"
      fill="#cccccc"
    />
  </svg>
)

// eslint-disable-next-line func-style
function Tags(props) {
  const isGivenClick = (evt, item, shangjiItem) => {
    evt.stopPropagation()
    if (!(item === '赠送' || item === '已联系' || item === '未联系' || item === '已委托')) return
    if (item === '赠送') {
      if (shangjiItem && shangjiItem.givenTips !== '') {
        Toast.info(shangjiItem.givenTips, 2)
      }
    } else {
      if (item === '已联系') {
        if (shangjiItem.opptySource === '400') {
          Toast.info('您已拨打过客户电话', 2)
        } else {
          Toast.info('您已回复过客户消息', 2)
        }
      }
      if (item === '未联系') {
        if (shangjiItem.opptySource === '400') {
          Toast.info('您还未拨打过客户电话', 2)
        } else {
          Toast.info('您还未回复客户消息', 2)
        }
      }
      if (item === '已委托') {
        Toast.info('您已将该客户加私', 2)
      }
    }
  }

  const getStyle = (item) => {
    if (item === '赠送') {
      return { color: '#E64B3E' }
    }
    if (item === '维护盘商机') {
      return { color: '#ffffff', background: '#d6ab62', padding: 2 }
    }
    return { color: '#A38E77' }
  }

  const { tags, shangjiItem } = props
  return (
    <div className="opptyList-tags">
      {Array.isArray(tags) &&
        tags.map((item) => (
          <span
            className="tag-item"
            key={item}
            style={{ ...getStyle(item) }}
            onClick={(evt) => {
              isGivenClick(evt, item, shangjiItem)
            }}
          >
            {item}
            {item === '赠送' || item === '已联系' || item === '未联系' || item === '已委托'
              ? question
              : null}
          </span>
        ))}
    </div>
  )
}

export default function (props) {
  const { data, type, selfData, bottomAreaClick } = props
  const opptyList = type === 'singleWaitDeal' ? selfData : data.opptyList
  const [opptyListState, setOpptyListState] = useState(opptyList)

  const addTempRecordData = (recordData) => {
    const newData = opptyListState.map((item) => {
      if (item.opptyId === recordData.opptyId) {
        if (Array.isArray(item.opptyBrief)) {
          const result = item.opptyBrief.filter((item2) => item2.name === '跟进反馈')
          if (result.length <= 0) {
            item.opptyBrief.push({
              name: '跟进反馈',
              desc: `${recordData.opptyFlagName},${recordData.remark}`,
            })
          } else {
            item.opptyBrief.map((item2) => {
              const itemtemp = item2
              if (item2.name === '跟进反馈') {
                itemtemp.desc = `${recordData.opptyFlagName},${recordData.remark}`
              }
              return itemtemp
            })
          }
        }
      }
      return item
    })
    setOpptyListState(newData)
  }

  const renderButton = (item) => {
    const {
      opptyProcessVo: { conversionType },
    } = item
    let button
    switch (conversionType) {
      case 1:
        button = (
          <span
            onClick={(evt) => {
              bottomAreaClick(evt, item, '加私')
            }}
          >
            加私
          </span>
        )
        break
      case 2:
        button = (
          <span
            onClick={(evt) => {
              bottomAreaClick(evt, item, '转委托')
            }}
          >
            转委托
          </span>
        )
        break
      case 3:
        button = (
          <span
            onClick={(evt) => {
              bottomAreaClick(evt, item, '去查看')
            }}
          >
            去查看
          </span>
        )
        break
      default:
        button = null
    }
    return button
  }
  const renderExitButton = (item) => {
    const { opptyStatus } = item
    if (+opptyStatus === 0 || +opptyStatus === 4) {
      return (
        <span
          onClick={(evt) => {
            digConfig.QianKe.quotaBtn()
            bottomAreaClick(evt, item, '申请退名额')
          }}
        >
          申请退名额
        </span>
      )
    }
    if (+opptyStatus === 1 || +opptyStatus === 2) {
      return (
        <span
          onClick={(evt) => {
            bottomAreaClick(evt, item, '查看工单')
          }}
        >
          查看工单
        </span>
      )
    }
    return null
  }

  const { type: opptyType } = Utils.getUrlParams()

  // conventionLevel -1待委托 0已联系 1已委托
  return (
    <div className="c-qkb-waitdeal">
      {Array.isArray(opptyListState) &&
        opptyListState.map((item) => {
          const { opptyProcessVo, isGiven, conventionLevel, safeguardStatus, isWeihupan } = item
          const { opptyTag } = item
          const tags = opptyTag.concat()
          if (isGiven && Array.isArray(tags)) {
            tags.unshift('赠送')
          }
          if (+conventionLevel === -1) {
            tags.push('待委托')
          }
          if (+conventionLevel === 0) {
            tags.push('已联系')
          }
          if (+conventionLevel === 1) {
            tags.push('已委托')
          }
          if (+isWeihupan === 1) {
            tags.unshift('维护盘商机')
          }
          return (
            <div key={item.opptyTitle} className="c-qkb-waitdeal-expand-body">
              <div className="opptyList-title">
                <div className="opptyList-title-title">{item && item.opptyTitle}</div>
                {/* <div className="opptyList-title-tag">{isProcess ? '已处理':'未处理'}</div> */}
              </div>
              <div style={{ flexDirection: 'row', display: 'flex' }}>
                <Tags tags={tags} shangjiItem={item} />
              </div>
              {safeguardStatus === 0 ? <div /> : null}
              {safeguardStatus === 1 ? (
                <img
                  src="https://file.ljcdn.com/nebula/mbrand/threehandlight_1627906541670.png"
                  className="opptyList-image"
                  alt="img"
                />
              ) : null}
              {safeguardStatus !== 0 && safeguardStatus !== 1 ? (
                <img
                  src="https://file.ljcdn.com/nebula/mbrand/no_threehand_1708596520201.png"
                  className="opptyList-image"
                  alt="img"
                />
              ) : null}
              <DesArea opptyBrief={item.opptyBrief} opportunityData={item} />
              <div className="opptyList-bottom">
                <div>
                  {renderExitButton(item)}
                  {opptyType === SHANG_HE_BAO ? null : renderButton(item)}
                  {opptyProcessVo.canRecord && opptyType !== SHANG_HE_BAO ? (
                    <span
                      onClick={(evt) => {
                        digConfig.QianKe.qiankeRecordBtn()
                        bottomAreaClick(evt, item, '记录跟进', addTempRecordData)
                      }}
                    >
                      记录跟进
                    </span>
                  ) : null}
                  {+opptyProcessVo.contactType === 0 ? null : (
                    <span
                      style={{ background: '#E64B3E', color: '#ffffff' }}
                      onClick={(evt) => {
                        digConfig.QianKe.qiankeContactBtn()
                        bottomAreaClick(evt, item, '联系')
                      }}
                    >
                      联系
                    </span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
    </div>
  )
}
