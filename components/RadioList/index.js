/**
 * 公共组件：单选列表（适配“选择小区”样式）
 * 纯展示组件，数据通过 props 传入
 */

import React, { useMemo, useState } from 'react'
import { DownOutlined, UpOutlined } from '@ant-design/icons'
import { Radio } from '@ke/ked-m'
import './index.less'

/**
 * @typedef {Object} RadioListItem
 * @property {string} id - 唯一标识
 * @property {string} leftTitle - 左侧主标题
 * @property {string} [rightTag] - 主标题右侧标签
 * @property {string} [subText] - 次行说明
 * @property {string} [priceText] - 右侧价格文案
 * @property {number} [stock] - 库存数量
 * @property {number} [stockStatus] - 库存状态
 */

/**
 * @typedef {Object} RadioListProps
 * @property {string} [title] - 标题文案
 * @property {RadioListItem[]} [items] - 列表数据
 * @property {string} [selectedId] - 受控选中 id
 * @property {function} [onChange] - 选中变化回调 (item) => void
 * @property {boolean} [collapsible] - 是否可折叠，默认 false
 * @property {number} [initialVisibleCount] - 折叠时展示的条目数，默认 5
 * @property {string} [expandText] - 展开按钮文案，默认 '全部小区'
 * @property {string} [collapseText] - 收起按钮文案，默认 '收起'
 * @property {boolean} [expandWithModal] - 是否通过外部弹窗展示全部，默认 false
 * @property {function} [onOpenAll] - 当 expandWithModal=true 时，点击触发该回调
 * @property {boolean} [reorderSelectedToTop] - 选中项是否置顶，默认 false
 */

export default function RadioList(props) {
  const {
    title = '',
    items = [],
    selectedId,
    onChange,
    collapsible = false,
    initialVisibleCount = 5,
    expandText = '全部',
    collapseText = '收起',
    expandWithModal = false,
    onOpenAll,
    reorderSelectedToTop = false,
  } = props

  const [expanded, setExpanded] = useState(false)

  /**
   * 重新排序列表项，将选中项置顶
   */
  const reorderItems = (items, selectedId) => {
    if (!reorderSelectedToTop || !selectedId) return items

    const selected = items.find((item) => item.id === selectedId)
    if (!selected) return items

    const others = items.filter((item) => item.id !== selectedId)
    return [selected, ...others]
  }

  /**
   * 计算当前需要展示的列表项
   */
  const visibleItems = useMemo(() => {
    const ordered = reorderItems(items, selectedId)

    if (collapsible && !expanded) {
      return ordered.slice(0, initialVisibleCount)
    }

    return ordered
  }, [items, collapsible, expanded, initialVisibleCount, reorderSelectedToTop, selectedId])

  /**
   * 处理列表项点击
   */
  const handleItemClick = (item) => {
    onChange?.(item)
  }

  /**
   * 处理展开/收起切换
   */
  const handleToggleExpand = () => {
    if (expandWithModal && onOpenAll) {
      onOpenAll()
      return
    }
    setExpanded(!expanded)
  }

  /**
   * 渲染列表项
   */
  const renderListItem = (item) => {
    const isActive = item.id === selectedId

    let typeText = ''
    switch (item.skuTag) {
      case 1:
        typeText = 'A类'
        break
      case 2:
        typeText = 'B类'
        break
      case 3:
        typeText = 'C类'
        break
      default:
        typeText = ''
        break
    }

    return (
      <div className="radio-list__row" key={item.id}>
        <div className="radio-list__left">
          <Radio
            checked={isActive && item.stock > 0}
            disabled={item.stock === 0}
            onChange={() => handleItemClick(item)}
          />
          <div className="radio-list__titles">
            <div className="radio-list__main-title">
              <span className="radio-list__main-title-text">
                {item.leftTitle} {typeText}
              </span>
            </div>
            {item.subText && <div className="radio-list__sub-text">{item.subText}</div>}
          </div>
        </div>
        <div className="radio-list__right">
          {item.priceText && <span className="radio-list__price">{item.priceText}</span>}
        </div>
      </div>
    )
  }

  /**
   * 渲染展开/收起按钮
   */
  const renderToggleButton = () => {
    if (!collapsible || items.length <= initialVisibleCount) return null

    const toggleConfig = expanded
      ? { label: collapseText, Icon: UpOutlined }
      : { label: expandText, Icon: DownOutlined }

    const { label, Icon } = toggleConfig

    return (
      <div className="radio-list__toggle" onClick={handleToggleExpand}>
        <span>{label}</span>
        <Icon />
      </div>
    )
  }

  return (
    <div className="radio-list">
      {title && <div className="radio-list__title">{title}</div>}
      <div className="radio-list__body">
        {visibleItems.map(renderListItem)}
        {renderToggleButton()}
      </div>
    </div>
  )
}
