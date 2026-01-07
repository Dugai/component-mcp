/**
 * 公共-选择包类型组件（纯展示，数据通过 props 传入）
 */

import React, { useState, useEffect } from 'react'
import './index.less'

export default function PackageTypeSelect(props) {
  const {
    opptyList = [], // 数据列表
    onChange, // 选择回调 (item) => void
    selectedId, // 受控选中 productId（可选）
    defaultSelectedId, // 非受控初始选中（可选）
    title, // 标题（可选，默认：商品选择）
  } = props

  const [skuId, setSkuId] = useState(defaultSelectedId)

  // 同步受控 selectedId
  useEffect(() => {
    if (selectedId !== undefined) {
      setSkuId(selectedId)
    }
  }, [selectedId])

  const onSelectSku = (item) => {
    setSkuId(item.productId)
    onChange && onChange(item)
  }

  const computedTitle = title || '商品选择'

  // 根据 combinedCode 返回已包装好的标签 JSX（不使用后端 productTags）
  const getTagsByCode = (data) => {
    const { combinedCode, displayTime } = data

    const textTag = (text) => (
      <div className="oppty-count" key={text}>
        {text}
      </div>
    )
    const exposureTag = (days, code) => (
      <div className="oppty-count" key={`expo-${code}-${days}`}>
        曝光
        <span style={{ color: '#E64B3E' }}>{days}</span>天
      </div>
    )

    if (combinedCode === 800101) {
      return [
        textTag('小区类展位'),
        exposureTag(displayTime, combinedCode),
        textTag('高流量'),
        textTag('用户准'),
      ]
    }

    if (combinedCode === 800102) {
      return [
        textTag('地铁类展位'),
        exposureTag(displayTime, combinedCode),
        textTag('高流量'),
        textTag('商机多'),
      ]
    }
    if (combinedCode === 800103) {
      return [
        textTag('商圈类展位'),
        exposureTag(displayTime, combinedCode),
        textTag('高流量'),
        textTag('价格低'),
      ]
    }
    return []
  }

  return (
    <div className="oppty-package-type-select">
      <div className="title">{computedTitle}</div>
      <div className="oppty-wrapper">
        {opptyList.map((item, index) => (
          <div
            className={
              item.productId === skuId ? 'oppty-list-item-active' : 'oppty-list-item-disabled'
            }
            key={index}
            onClick={() => onSelectSku(item)}
          >
            <div className="tag">{item.productName}</div>
            <div className="oppty-tags">{getTagsByCode(item)}</div>
            <div className="sale-time">{item.saleTimeTip}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
