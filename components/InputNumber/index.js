import React, { Component } from 'react'
import PropTypes from 'prop-types'
import './index.less'

class InputNumber extends Component {
  state = {
    currData: {
      min: Number.NEGATIVE_INFINITY,
      max: Number.POSITIVE_INFINITY,
      value: 0,
    },
  }

  componentDidMount() {
    const currData = Object.assign({}, this.state.currData, {
      ...this.props,
    })
    this.setState({
      currData,
    })
  }

  componentWillReceiveProps(nextProps) {
    // if (nextProps.value != this.state.currData.value) {
    //   const currData = Object.assign({}, this.state.currData, {
    //     ...nextProps
    //   })
    // }
    const currData = Object.assign({}, this.state.currData, {
      ...nextProps,
    })
    this.setState({
      currData,
    })
  }

  validateNumber(num) {
    if (/^-?[1-9]\d*|0$/.test(num)) {
      return true
    }
    return false
  }

  handleMinus() {
    let { min, value } = this.state.currData
    if (!Number.isNaN(value) && this.validateNumber(value)) {
      value -= 1
      if (!Number.isNaN(min) && this.validateNumber(min)) {
        if (min >= value) {
          value = min
        }
      }
      const currData = Object.assign({}, this.state.currData, {
        value,
      })
      this.setState({
        currData,
      }, () => {
        this.props.onChange && this.props.onChange(value)
      })
    }
  }

  handlePlus() {
    let { max, value } = this.state.currData
    if (!Number.isNaN(value) && this.validateNumber(value)) {
      value += 1
      if (!Number.isNaN(max) && this.validateNumber(max)) {
        if (value >= max) {
          value = max
        }
      }
      const currData = Object.assign({}, this.state.currData, {
        value,
      })
      this.setState({
        currData,
      }, () => {
        this.props.onChange && this.props.onChange(value)
      })
    }
  }

  render() {
    const { min, max, value } = this.state.currData
    let str = 'num'
    if (value) {
      if (value >= 100) {
        str += ' num-100'
      }
      if (value > 999) {
        str += ' num-1000'
      }
      if (value > 9999) {
        str += ' num-10000'
      }
    }
    return (
      <ul className="input-number-range">
        <li
          className={(!Number.isNaN(min) && min >= value) ? 'minus disabled' : 'minus'}
          onClick={this.handleMinus.bind(this)}
        >
          <div></div>
        </li>
        <li>
          <div
            className={str}
          >{value}</div>
        </li>
        <li
          className={(!Number.isNaN(max) && max <= value) ? 'plus disabled' : 'plus'}
          onClick={this.handlePlus.bind(this)}
        >
          <div></div>
        </li>
      </ul>
    )
  }
}

InputNumber.propTypes = {
  min: PropTypes.number,
  max: PropTypes.number,
  value: PropTypes.number,
}

export default InputNumber
