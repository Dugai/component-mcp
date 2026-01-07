import React, { Component, Fragment } from 'react'
import dayjs from 'dayjs'

/**
 * 倒计时组件
 * type 表示显示的类型，
 * 如type='day' ,显示 x天x时x分x秒(默认)
 * 如type='hour' ,显示 x时x分x秒
 * 如type='minute' ,显示 x分x秒
 * 如type='second' ,显示 x秒
 */
class CountDown extends Component {
  constructor(props) {
    super(props)
    this.state = {
      day: 0,
      hour: 0,
      minute: 0,
      second: 0,
      type: this.props.type || 'day', // day/hour/minute/second
    }
  }

  componentDidMount() {
    const { expireTime, fixedTime } = this.props
    if (expireTime) {
      this.count(expireTime, fixedTime)
    }
  }
  componentWillReceiveProps(nextProps) {
    if (
      this.props.expireTime !== nextProps.expireTime ||
      this.props.fixedTime !== nextProps.fixedTime
    ) {
      this.count(nextProps.expireTime, nextProps.fixedTime)
    }
  }

  componentWillUnmount() {
    this.timer && clearInterval(this.timer)
  }

  count(time, fixedTime = 0) {
    const { diff = 0 } = this.props
    const endTime = dayjs(time).valueOf()
    let diffTime = endTime - (dayjs().valueOf() + fixedTime)
    if (diff) {
      diffTime = diff
    }
    if (this.timer) {
      clearInterval(this.timer)
    }
    if (diffTime <= 1000) {
      clearInterval(this.timer)
      // 倒计时结束时方法
      this.props.onTimeEnd && this.props.onTimeEnd()
      return
    }

    this.timer = setInterval(() => {
      if (diffTime <= 1000) {
        clearInterval(this.timer)
        // 倒计时结束时方法
        this.props.onTimeEnd && this.props.onTimeEnd()
        return
      }
      diffTime -= 1000
      this.calcTime(diffTime)
    }, 1000)
  }

  calcTime(diffTime) {
    const day = Math.floor(diffTime / 1000 / 3600 / 24)
    const hour = Math.floor((diffTime / 1000 / 3600) % 24)
    const minute = Math.floor((diffTime / 1000 / 60) % 60)
    const second = Math.floor((diffTime / 1000) % 60)
    this.setState({
      day,
      hour: hour < 10 ? '0' + hour : hour,
      minute: minute < 10 ? '0' + minute : minute,
      second: second < 10 ? '0' + second : second,
    })
  }

  render() {
    const { day, hour, minute, second, type } = this.state
    const {
      formate = type === 'hour' ? 'hh时mm分ss秒' : type === 'minute' ? 'mm分ss秒' : 'ss秒',
    } = this.props
    const {
      numberStyle = {
        color: '#fff',
      },
      unitStyle = {
        color: '#fff',
      },
    } = this.props

    console.log(day, hour, minute, second)

    if (type === 'day') {
      return (
        <Fragment>
          <span>{this.props.text}</span>
          <span style={{ ...numberStyle }}>{day}</span>
          <span style={{ ...unitStyle }}>天</span>
          <span style={{ ...numberStyle }}>{hour}</span>
          <span style={{ ...unitStyle }}>时</span>
          <span style={{ ...numberStyle }}>{minute}</span>
          <span style={{ ...unitStyle }}>分</span>
          <span style={{ ...numberStyle }}>{second}</span>
          <span style={{ ...unitStyle }}>秒</span>
        </Fragment>
      )
    }
    if (type === 'hour') {
      if (formate === 'hh:mm:ss') {
        return (
          <Fragment>
            <span>{this.props.text}</span>
            <span style={{ ...numberStyle }}>{hour}</span>
            <span style={{ ...unitStyle }}>:</span>
            <span style={{ ...numberStyle }}>{minute}</span>
            <span style={{ ...unitStyle }}>:</span>
            <span style={{ ...numberStyle }}>{second}</span>
          </Fragment>
        )
      } else if (formate === 'hh时mm分ss秒') {
        return (
          <Fragment>
            <span>{this.props.text}</span>
            <span style={{ ...numberStyle }}>{hour}</span>
            <span style={{ ...unitStyle }}>时</span>
            <span style={{ ...numberStyle }}>{minute}</span>
            <span style={{ ...unitStyle }}>分</span>
            <span style={{ ...numberStyle }}>{second}</span>
            <span style={{ ...unitStyle }}>秒</span>
          </Fragment>
        )
      }
    }
    if (type === 'minute') {
      if (formate === 'mm:ss') {
        return (
          <Fragment>
            <span>{this.props.text}</span>
            <span style={{ ...numberStyle }}>{minute}</span>
            <span style={{ ...unitStyle }}>:</span>
            <span style={{ ...numberStyle }}>{second}</span>
          </Fragment>
        )
      } else if (formate === 'mm分ss秒') {
        return (
          <Fragment>
            <span>{this.props.text}</span>
            <span style={{ ...numberStyle }}>{minute}</span>
            <span style={{ ...unitStyle }}>分</span>
            <span style={{ ...numberStyle }}>{second}</span>
            <span style={{ ...unitStyle }}>秒</span>
          </Fragment>
        )
      }
    }
    if (type === 'second') {
      if (formate === 'ss') {
        return (
          <Fragment>
            <span>{this.props.text}</span>
            <span style={{ ...numberStyle }}>{second}</span>
          </Fragment>
        )
      } else if (formate === 'ss秒') {
        return (
          <Fragment>
            <span>{this.props.text}</span>
            <span style={{ ...numberStyle }}>{second}</span>
            <span style={{ ...unitStyle }}>秒</span>
          </Fragment>
        )
      }
    }
  }
}

export default CountDown
