import React, { useState } from 'react'
import './index.less'

export default function (props) {
  const { tabList = [], children, onChange = () => {} } = props

  const [, setTabType] = useState(tabList.length ? tabList[0].value : '')
  const [activeIndex, setActiveIndex] = useState(0)

  const getTabItemClassName = (index) => {
    let className = 'mbrand-tab-item'
    const len = tabList.length

    // 处理激活状态的类名
    if (activeIndex === index) {
      if (index === 0) {
        className += ' active-first'
      } else if (index === len - 1) {
        className += ' active-last'
      } else if (len > 2) {
        className += ' active-middle'
      }
    } else {
      // 处理禁用状态的类名
      if (len > 2) {
        if (activeIndex === 0 && index === 1) {
          className += ' disabled-first'
        } else if (activeIndex === 1) {
          className +=
            index === 0 ? ' disabled-left' : index === 2 ? ' disabled-right' : ' disabled'
        } else if (activeIndex === len - 1 && index === 0) {
          className += ' disabled-first'
        } else {
          className += ' disabled'
        }
      } else {
        className += ' disabled'
      }
    }

    return className
  }

  const getContentWrapperClassName = () => {
    const len = tabList.length

    if (len === 1) {
      return 'content-wrapper'
    } else if (activeIndex === 0) {
      return 'content-wrapper0'
    } else if (activeIndex > 0 && activeIndex < len - 1) {
      return 'content-wrapper1'
    } else if (activeIndex === len - 1) {
      return 'content-wrapper2'
    }
  }

  return (
    <div className="mbrand-tab-select">
      {tabList.length > 1 && (
        <div className="mbrand-tab-item-wrapper">
          {tabList.map((tab, index) => (
            <div
              className={getTabItemClassName(index)}
              key={index}
              onClick={() => {
                setTabType(tab.value)
                onChange(tab.value)
                setActiveIndex(index)
              }}
            >
              {tab.key}
            </div>
          ))}
        </div>
      )}
      <div className={getContentWrapperClassName()}>{children}</div>
    </div>
  )
}
