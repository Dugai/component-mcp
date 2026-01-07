import React, { Component, Fragment } from 'react'
import { Tabs } from 'antd-mobile'
import moduleStyle from './index.module.less'

const svg = (
  <svg
    t="1622798536366"
    className="icon"
    viewBox="0 0 1024 1024"
    version="1.1"
    p-id="13365"
    width="20"
    height="20"
  >
    <defs>
      <style type="text/css"></style>
    </defs>
    <path
      d="M440 112m72 0l0 0q72 0 72 72l0 0q0 72-72 72l0 0q-72 0-72-72l0 0q0-72 72-72Z"
      p-id="13366"
      fill="#2c2c2c"
    ></path>
    <path
      d="M440 440m72 0l0 0q72 0 72 72l0 0q0 72-72 72l0 0q-72 0-72-72l0 0q0-72 72-72Z"
      p-id="13367"
      fill="#2c2c2c"
    ></path>
    <path
      d="M440 768m72 0l0 0q72 0 72 72l0 0q0 72-72 72l0 0q-72 0-72-72l0 0q0-72 72-72Z"
      p-id="13368"
      fill="#2c2c2c"
    ></path>
  </svg>
)

class EnhanceTabs extends Component {
  constructor(props) {
    super(props)
    this.state = {
      showExpand: false,
    }
  }
  renderTags = () => {
    const { tabs } = this.props
    return (
      <div className={moduleStyle['Tab-Tag-Wrapper']}>
        {tabs.map((tab) => {
          return (
            <div
              onClick={() => {
                this.props.onTabClick(tab, 1)
                this.setState({ showExpand: false })
              }}
              className={moduleStyle['Tab-Tag-Container']}
            >
              {tab.title}
            </div>
          )
        })}
      </div>
    )
  }
  expandClick = () => {
    this.setState((pre) => {
      return { showExpand: !pre.showExpand }
    })
  }
  renderTabbarMy = (param) => {
    const { showExpand } = this.state
    const { renderTabBar } = this.props
    return (
      <div>
        {renderTabBar(param)}
        <div className={moduleStyle['Tab-expand-toggle']} onClick={this.expandClick}>
          <span>{svg}</span>
        </div>
        {showExpand ? this.renderTags() : null}
      </div>
    )
  }

  render() {
    const { showExpand } = this.state
    return <Tabs {...this.props} renderTabBar={this.renderTabbarMy} showExpand={showExpand} />
  }
}

export default EnhanceTabs
