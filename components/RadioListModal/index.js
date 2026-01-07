/**
 * 公共组件：RadioList 列表弹窗（对齐 CouponModal 风格）
 * - 使用 antd-mobile Modal
 * - 列表项沿用 RadioList 样式/结构
 * - 底部主按钮“完成”
 */

import React, { useEffect, useState } from 'react'
import { Modal, Button } from 'antd-mobile'
import RadioList from '@/components/RadioList'
import usePreventBodyScroll from '@/hooks/usePreventBodyScroll'
import './index.less'

export default function RadioListModal(props) {
  const {
    title = '',
    visible = false,
    items = [],
    selectedId,
    onChange,
    onClose = () => {},
    onConfirm, // 点击完成
    confirmText = '完成',
    className = '', // 允许额外 class 扩展
  } = props

  // 在弹窗内部维护临时选中，点击“完成”才回传
  const [tempSelectedId, setTempSelectedId] = useState(selectedId)

  usePreventBodyScroll(visible)

  // 弹窗每次打开时，用外部选中态初始化内部临时值
  useEffect(() => {
    if (visible) {
      setTempSelectedId(selectedId)
    }
  }, [visible, selectedId])

  const handleConfirm = () => {
    const target = items.find((it) => it.id === tempSelectedId)
    if (target && onChange) {
      onChange(target)
    }
    ;(onConfirm || onClose)()
  }

  return (
    <Modal
      popup
      visible={visible}
      closable
      onClose={onClose}
      animationType="slide-up"
      className={`radio-list-modal ${className}`}
    >
      <div className="title">{title}</div>
      <div className="list-wrapper">
        <RadioList
          title=""
          items={items}
          selectedId={tempSelectedId}
          onChange={(it) => setTempSelectedId(it.id)}
        />
      </div>
      <div className="primary-footer-button">
        <Button type="primary" onClick={handleConfirm}>
          {confirmText}
        </Button>
      </div>
    </Modal>
  )
}
