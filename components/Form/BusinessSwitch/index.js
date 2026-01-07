/**
 * 【组件】Switch 切换开关
 *  历史：从KMis迁移过来
 */
import React, { useState } from 'react'
import { Switch, List, Popover } from 'antd-mobile'
import './index.less'

export default (props) => {
  const [visible, setVisible] = useState(false)

  const onChangeEvent = (checked) => {
    const { submitOnChange = false, onChange } = props
    onChange && onChange(checked, submitOnChange)
  }

  const onClick = (checked) => {
    props.onClick && props.onClick(checked)
  }

  const onSelect = () => {
    setVisible(false)
  }

  const handleVisibleChange = (vs) => {
    setVisible(vs)
  }

  return (
    <div className="diamond-price-c-switch-list">
      <List.Item
        className=""
        extra={
          <Switch
            checked={props.value}
            onChange={(checked) => onChangeEvent(checked)}
            color={props.color}
            disabled={props.disabled}
            platform={props.platform}
            onClick={(checked) => onClick(checked)}
            className="diamond-price-c-switch"
          />
        }
      >
        {props.label}
        <Popover
          placement="bottomLeft"
          visible={visible}
          overlay={[
            <Popover.Item key="1" style={props.iconTypeStyle}>
              <span>{props.iconContent}</span>
            </Popover.Item>,
          ]}
          onVisibleChange={handleVisibleChange}
          onSelect={onSelect}
        >
          <div className="text-icon">{props.iconType && <i className="icon-app-info" />}</div>
        </Popover>
      </List.Item>
      {props.descriptionTxt && (
        <p className="diamond-price-c-switch-description">
          {props.descriptionTxt}
          {props.descriptionSpecialTxt && (
            <span className="diamond-price-c-switch-description-price">
              {props.descriptionSpecialTxt}
            </span>
          )}
        </p>
      )}
      {props.required ? <div className="require">*</div> : null}
    </div>
  )
}
