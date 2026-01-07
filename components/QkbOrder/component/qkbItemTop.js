import React from 'react'
import { Toast } from 'antd-mobile'
import './qkbItemTop.less'
import { RightOutlined } from '@ant-design/icons'
import Utils from 'utils'
import dayjs from 'dayjs'

const position = (
  <svg
    viewBox="0 0 1024 1024"
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
    width="12"
    height="12"
    fill="#999"
  >
    <defs>
      <style type="text/css" />
    </defs>
    <path d="M512 32c176.448 0 320 151.392 320 337.504 0 60.992-15.616 120.8-45.12 172.896l-247.552 435.936a26.432 26.432 0 0 1-22.688 13.664h-0.192a26.4 26.4 0 0 1-22.656-13.28L239.776 546.976A350.592 350.592 0 0 1 192 369.504C192 183.36 335.552 32 512 32z m219.808 478.272A288.192 288.192 0 0 0 768 370.112C768 219.168 653.12 96 512.096 96S256 219.168 256 370.112c0 50.976 13.536 100.736 38.464 143.872L515.968 896l215.84-385.728zM512 192c88.224 0 160 71.776 160 160 0 86.72-69.504 160-160 160-89.376 0-160-72.32-160-160 0-88.224 71.776-160 160-160z m0.064 256A95.936 95.936 0 0 0 608 352c0-52.768-43.104-96-95.936-96A96.384 96.384 0 0 0 416 352c0 52.896 43.008 96 96.064 96z" />
  </svg>
)
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

export default function (props) {
  const { data, type, selfData } = props
  const realData = type === 'singleTop' ? selfData : data
  const {
    areaName,
    packageTime,
    packageName,
    packageId,
    productIco,
    packageIco,
    packageBrief,
    source,
    packageTag,
    statusInfo,
    affinityRank,
  } = realData
  const { name, desc } = statusInfo
  const reason = desc !== '' ? `(${desc})` : `${desc}`

  const showToast = (event) => {
    event.stopPropagation()
    Toast.show(packageTag.desc)
  }

  return (
    <div className="c-qit-qkborder-top-single">
      <div>
        <div>
          {productIco || packageIco ? <img src={productIco || packageIco} alt="img" /> : null}
        </div>
        <div>
          <p>{packageName}</p>
          <p>{`ID:${packageId}`}</p>
          <p>{dayjs(packageTime).format('YYYY/MM/DD HH:mm:ss')}</p>
          <p>{`分配状态：${name}${reason}`}</p>
          <p>{packageBrief}</p>
          {data?.showRewardHouseBtn === 1 && (
            <a
              onClick={(e) => {
                e.stopPropagation()
                Utils.openNewWebView(
                  `/shangJi/package/reward/house?date=${data.packageTime}&combinedCode=${data.combinedCode}&bizcircleId=${data.bizCircleId}`
                )
              }}
            >
              查看悬赏房源
              <RightOutlined />
            </a>
          )}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div onClick={showToast} style={{ display: 'inline-flex' }}>
          {packageTag.name}
          <span>{question}</span>
        </div>
        {source === 'agent_purchase_suggestion' ? (
          <div style={{ marginTop: '5px' }}>购买助手</div>
        ) : null}
        {affinityRank !== null && affinityRank <= 5 ? (
          <div
            style={{
              backgroundImage: 'linear-gradient(90deg, #FFA44B, #FF673D)',
              color: '#ffffff',
              fontSize: 12,
              height: 16,
              lineHeight: '16px',
              verticalAlign: 'middle',
              padding: '0 2px',
              marginTop: 5,
            }}
          >
            维护盘多
          </div>
        ) : null}
      </div>
      {type === 'singleTop' ? (
        <div>
          <div>{position}</div>
          <div>{areaName}</div>
        </div>
      ) : null}
    </div>
  )
}
