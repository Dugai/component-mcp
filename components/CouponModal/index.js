/**
 * 通用选优惠券组件
 */
import React, { useState, useEffect } from 'react'
import { Modal, Button } from 'antd-mobile'
import { Radio } from '@ke/ked-m'
import './index.less'

export default function (props) {
  const {
    title = '',
    discountList = [],
    visible,
    onClose = () => {},
    onSelectCoupon = () => {},
    couponInfo = {},
  } = props
  const [couponCode, setCouponCode] = useState('')

  useEffect(() => {
    if (Object.keys(couponInfo).length) {
      setCouponCode(couponInfo.code)
    }
  }, [couponInfo])

  return (
    <Modal
      popup
      visible={visible}
      closable
      onClose={onClose}
      animationType="slide-up"
      className="mbrand-coupon-modal"
    >
      <div className="title">{title || '选择优惠'}</div>
      <div className="coupon-list-wrapper">
        {discountList.map((item, index) => (
          <div className="coupon-list-item" key={index}>
            <div className="coupon-name">{item.name}</div>
            <Radio
              checked={item.code === couponCode}
              onChange={() => {
                setCouponCode(item.code)
                onSelectCoupon(item)
              }}
            />
          </div>
        ))}
      </div>
      <div className="primary-footer-button">
        <Button type="primary" onClick={onClose}>
          完成
        </Button>
      </div>
    </Modal>
  )
}
