import React from 'react'
import { Tooltip } from '@ke/ked-m'

export default function (props) {
  const { actions } = props
  return (
    <Tooltip placement="bottomRight" title={<div style={{ fontSize: 14 }}>{actions}</div>}>
      <img
        style={{ width: 30 }}
        src="https://img.ljcdn.com/beike/poseidonFE/1658304869570.png"
        alt=""
      />
    </Tooltip>
  )
}
