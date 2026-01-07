/**
 * 【组件】Text 输入框
 *  历史：从KMis迁移过来
 */
import React, { useState } from 'react'
import { InputItem, Popover } from 'antd-mobile'
import './index.less'

const Item = Popover.Item

export default (props) => {
  const [visible, setVisible] = useState(false)

  const onChange = (value) => {
    if (props.onChange) {
      props.onChange(value)
    }
  }

  const onBlur = (value) => {
    const { type, precision } = props
    if (type === 'digit' && typeof precision === 'number') {
      value = Number(value).toFixed(precision)
      props.onChange(value)
    }
  }

  const onSelect = () => {
    setVisible(false)
  }

  const handleVisibleChange = (v) => {
    setVisible(v)
  }

  return (
    <div className="diamond-price-c-text-main">
      <InputItem
        className="diamond-price-c-text"
        placeholder={props.placeholder || '请输入'}
        onChange={onChange}
        onBlur={onBlur}
        extra={props.addOn || null}
        type={props.type}
        value={props.value}
        defaultValue={props.defaultValue}
        clear={props.clear}
        editable={props.editable}
        disabled={props.disabled}
        maxLength={props.maxLength}
      >
        {props.label}
        <Popover
          placement="bottomLeft"
          visible={visible}
          overlay={[
            <Item key="1">
              <span>{props.iconContent}</span>
            </Item>,
          ]}
          onVisibleChange={handleVisibleChange}
          onSelect={onSelect}
        >
          <div className="text-icon">{props.iconType && <i className="icon-app-info" />}</div>
        </Popover>
      </InputItem>
      {props.descriptionTxt && (
        <p className="description">
          {props.descriptionTxt}
          {props.descriptionSpecialTxt && (
            <span className="description-price">{props.descriptionSpecialTxt}</span>
          )}
        </p>
      )}
      {props.required ? <div className="require">*</div> : null}
    </div>
  )
}
