import React from 'react'
import { Modal } from 'antd-mobile'
import './index.less'

export default function (props) {
  const { onClose = () => {}, visible = false, title = '', children = null } = props

  return (
    <Modal
      popup
      closable
      className="mbrand-modal"
      onClose={onClose}
      visible={visible}
      animationType="slide-up"
    >
      <div className="mbrand-modal-title">{title}</div>
      {children}
    </Modal>
  )
}
