/**
 * 【组件】Picker 下拉列表
 *  历史：从KMis迁移过来
 */
import React from 'react'
import { List, Picker } from 'antd-mobile'
import './index.less'

import withTouchMoveControlHoc from 'components/WithTouchMoveControlHoc'
const ControlledPicker = withTouchMoveControlHoc(Picker)

function mapTree(tree, iterator, level, depthFirst, paths) {
  if (level === void 0) {
    level = 1
  }
  if (depthFirst === void 0) {
    depthFirst = false
  }
  if (paths === void 0) {
    paths = []
  }
  return tree.map(function (item, index) {
    if (depthFirst) {
      var children = item.children
        ? mapTree(item.children, iterator, level + 1, depthFirst, paths.concat(item))
        : undefined
      children && (item = tslib_1.__assign(tslib_1.__assign({}, item), { children: children }))
      item = iterator(item, index, level, paths) || tslib_1.__assign({}, item)
      return item
    }
    item = iterator(item, index, level, paths) || tslib_1.__assign({}, item)
    if (item.children && item.children.splice) {
      item.children = mapTree(item.children, iterator, level + 1, depthFirst, paths.concat(item))
    }
    return item
  })
}

export default class BusinessPickerControl extends React.Component {
  state = {
    valueLength: 0,
  }

  defaultProps = {
    disabled: false,
    cascade: true,
    cols: 1,
    okText: '确定',
    dismissText: '取消',
  }

  onChange(nValue) {
    const { value, onChange, cols, cascade } = this.props
    //适配单选值可以为单个字符串或数字
    const oValue =
      ['string', 'number'].includes(typeof value) || (cascade && cols === 1) ? nValue[0] : nValue
    this.setState({ valueLength: oValue.length }, () => {
      onChange && onChange(oValue)
    })
  }

  /**
   * option转换
   * @param opt
   */
  renderOption = (opt) => {
    const { labelField = 'label', valueField = 'value', data } = this.props

    const isOptArray = Array.isArray(opt)
    const result = mapTree(isOptArray ? opt : [opt], (item, key, level) => {
      const value = typeof item[valueField] === 'undefined' ? '' : item[valueField]
      let label = item[labelField] || ''
      let disabled = item.disabled || false

      return {
        ...item,
        label,
        value,
        disabled,
      }
    })
    return isOptArray ? result : result.length ? result[0] : {}
  }

  render() {
    const {
      label,
      options,
      cascade,
      title,
      extra,
      disabled,
      value,
      cols,
      okText,
      dismissText,
      hasDescription,
    } = this.props
    const { valueLength } = this.state
    const rValue = options.length
      ? ['string', 'number'].includes(typeof value)
        ? [value]
        : value
      : []
    return (
      <div className="diamond-price-c-picker-main">
        <ControlledPicker
          popupPrefixCls="diamond-price-c-picker-popup"
          className="diamond-price-c-picker"
          data={options.map((opt) => this.renderOption(opt)) || []}
          cols={cols}
          title={<span>{title}</span>}
          extra={
            <span className="diamond-price-c-picker-extra-placeholder">{extra || '请选择'}</span>
          }
          disabled={disabled}
          cascade={cascade}
          value={[...rValue]}
          onChange={(i) => this.onChange(i)}
          onOk={(i) => this.onChange(i)}
          okText={okText}
          dismissText={dismissText}
        >
          <List.Item
            arrow="horizontal"
            className={`diamond-price-c-picker-button${disabled ? '-disabled' : ''}`}
          >
            {label}
          </List.Item>
        </ControlledPicker>
        {hasDescription && valueLength ? (
          <p className="diamond-price-c-picker-description">{`已选择${valueLength}张优惠券`}</p>
        ) : (
          ''
        )}
        {this.props.required ? <div className="require">*</div> : null}
      </div>
    )
  }
}
