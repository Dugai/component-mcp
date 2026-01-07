import React, { Component } from 'react'
import ModuleStyle from './index.module.less'

class Rate extends Component {
  constructor(props) {
    super(props)
    this.state = {
      current: (props.type - 1) || 0,
      stars: props.length || 5,
    }
  }

  componentDidMount() {}

  componentWillUpdate(nextProps, nextState) {
    if (nextProps.length !== this.state.stars) {
      this.setState({
        current: nextProps.type - 1,
        stars: nextProps.length,
      })
    }
  }

  onSeleted(index) {
    const { current } = this.state
    if (current !== index) {
      this.setState({
        current: index,
      })
      this.props.onSeleted && this.props.onSeleted(index + 1)
    }
  }

  render() {
    const { stars } = this.state
    const rates = []
    for (let i = 0; i < stars; i++) {
      rates.push(i)
    }
    return (
      <div className={ModuleStyle['rate-wrap']}>
        <ul>
          {
          rates.length > 0
          && rates.map((item, index) => (
            <li
              key={index}
              className={ModuleStyle['rate-item']}
              onTouchStart={this.onSeleted.bind(this, index)}
              onClick={this.onSeleted.bind(this, index)}
            >
              <i className={ModuleStyle['icon-star']} />
            </li>
          ))
        }
        </ul>
      </div>
    )
  }
}

export default Rate
