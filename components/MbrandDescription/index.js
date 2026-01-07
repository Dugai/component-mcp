import React from 'react'
import './index.less'

export default function (props) {
  const { label = '', value = '' } = props

  return (
    <div className="mbrand-description">
      <div className="list-item-info">
        <span className="label">{label}：</span>
        <span className="value">{value}</span>
      </div>
    </div>
  )
}
