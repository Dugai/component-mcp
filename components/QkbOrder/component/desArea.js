import React, { Fragment } from 'react'
import dayjs from 'dayjs'
import { Modal } from 'antd-mobile'
import './desArea.less'

const dealTime = (desc) => {
  return dayjs(parseFloat(desc)).format('YYYY/MM/DD HH:mm:ss')
}
const question = (
  <svg viewBox="0 0 1024 1024" width="14" height="14">
    <defs>
      <style type="text/css"></style>
    </defs>
    <path
      d="M512 81.408a422.4 422.4 0 1 0 422.4 422.4A422.4 422.4 0 0 0 512 81.408z m26.624 629.76a45.056 45.056 0 0 1-31.232 12.288 42.496 42.496 0 0 1-31.232-12.8 41.984 41.984 0 0 1-12.8-30.72 39.424 39.424 0 0 1 12.8-30.72 42.496 42.496 0 0 1 31.232-12.288 43.008 43.008 0 0 1 31.744 12.288 39.424 39.424 0 0 1 12.8 30.72 43.008 43.008 0 0 1-13.312 31.744z m87.04-235.52a617.472 617.472 0 0 1-51.2 47.104 93.184 93.184 0 0 0-25.088 31.232 80.896 80.896 0 0 0-9.728 39.936v10.24H475.648v-10.24a119.808 119.808 0 0 1 12.288-57.344A311.296 311.296 0 0 1 555.52 460.8l10.24-11.264a71.168 71.168 0 0 0 16.896-44.032A69.632 69.632 0 0 0 563.2 358.4a69.632 69.632 0 0 0-51.2-17.92 67.072 67.072 0 0 0-58.88 26.112 102.4 102.4 0 0 0-16.384 61.44h-61.44a140.288 140.288 0 0 1 37.888-102.4 140.8 140.8 0 0 1 104.96-38.4 135.68 135.68 0 0 1 96.256 29.184 108.032 108.032 0 0 1 36.352 86.528 116.736 116.736 0 0 1-25.088 73.216z"
      fill="#cccccc"
      p-id="3160"
    ></path>
  </svg>
)

export default (props) => {
  const handleClickQuestion = (e) => {
    Modal.alert(
      '',
      '维护商机还没有达到24小时，如商机未达到三次握手系统将会自动补发，无需提交反馈哦！',
      [{ text: '我知道了' }]
    )
    e.stopPropagation()
  }
  const { opptyBrief, opportunityData } = props
  if (Array.isArray(opptyBrief) && opptyBrief.length > 0) {
    return (
      <div className="c-qkborder-desarea">
        {opptyBrief.map((item, index) => {
          return (
            <div
              key={'listlable' + index}
              className='brief-list'
              style={{
                paddingBottom:
                  opportunityData && opportunityData.opptySource === 'IM' ? '0px' : '20px',
              }}
            >
              <span className="brief-title">{item.name}：</span>
              <span className="brief-desc">
                {item.name === '意向时间' ? dealTime(item.desc) : item.desc}{' '}
                {item.subDesc ? <span style={{ color: 'red' }}>({item.subDesc})</span> : null}
                {item.name === '意向时间' && item.subDesc ? (
                  <span
                    onClick={handleClickQuestion}
                    style={{ position: 'relative', marginLeft: '3px', top: '2px' }}
                  >
                    {question}
                  </span>
                ) : null}
              </span>
            </div>
          )
        })}
        {opportunityData && opportunityData.opptySource === 'IM' && opportunityData.custId ? (
          <div className='brief-list'>
            <span className='brief-title'>客户账号：</span>
            <span className='brief-desc'>{opportunityData.custId}</span>
          </div>
        ) : null}
      </div>
    )
  }
  return <div />
}
