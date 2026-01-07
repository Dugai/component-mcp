import React, { Component, Fragment } from 'react';
import moduleStyle from './index.module.less'

class Tag extends Component {
  render() {
    const tagTypes = ['success', 'warn', 'error']
    const { reasons = [] } = this.props
    return (
      <div className={moduleStyle['item-tags']}>
        {
          reasons.length > 0 &&
          <Fragment>
            {
              reasons.map((l, index) => {
                return (<span key={index} style={{marginRight: '6px', marginBottom: '6px'}} className={moduleStyle['item-tag-' + tagTypes[(index % 3)]]}>{l}</span>)
              })
            }
          </Fragment>
        }
      </div>
    );
  }
}

export default Tag;