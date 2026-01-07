import React, { useState } from 'react'
import './index.less'

export default function (props) {
  const { tabs = [], onChange = () => {}, value = undefined } = props

  const [val, setValue] = useState(value)

  return (
    <div className="component-budgetpool-button-tab">
      {tabs.map((item) => (
        <div
          className={val === item.value ? 'button-tab active' : 'button-tab disabled'}
          key={item.value}
          onClick={() => {
            setValue(item.value)
            onChange(item.value)
          }}
        >
          {item.label}
        </div>
      ))}
    </div>
  )
}
