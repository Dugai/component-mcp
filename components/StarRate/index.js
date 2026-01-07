import React from 'react'
import moduleStyle from './index.module.less'

const StarRate = (rate) => {
  let array = []
  for (let i = 1; i <= 3; i++) {
    if (i <= rate) {
      array.push(true)
    } else {
      array.push(false)
    }
  }
  return array.map((item, index) => {
    return (
      <span className={item ? moduleStyle.starY : moduleStyle.starG} key={'star' + index}></span>
    )
  })
}

export default StarRate
