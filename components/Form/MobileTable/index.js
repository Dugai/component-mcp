/**
 * 【组件】移动端Table
 * 功能：包含展示和排序
 * 参数（props）：
 *  - columns：参考PC的antd，需要排序，赋值sort=true
 *  - dataSource：参考PC的antd
 *  - loadData：请求获取数据方法，回传sort的key和排序方式
 * */
import React, { useState } from 'react'
import './index.less'

export default function DescCard({ ...props }) {
  const [sort, setSort] = useState({ type: 0, key: null })

  // 点击排序
  const clickSort = item => {
    let { type } = sort
    if (sort.key === item.key) {
      type = sort.type + 1
    } else {
      type = 1
    }
    setSort({
      key: item.key,
      type: type % 3,
    })
    // 请求数据
    props.loadData({ key: item.key, type })
  }

  return (
    <div className='c-form-mobiletable'>
      <table>
        <thead>
          <tr>
            {props.columns.map(item => (
              <td
                key={`thead${item.key}`}
                onClick={() => {
                  if (item.sort) {
                    clickSort(item)
                  }
                }}
              >
                {item.title}
                {item.sort && (
                  <div className="sort-parent">
                    <div className={`sp-top ${sort.key === item.key && sort.type === 2 ? 'active' : ''}`} />
                    <div className={`sp-bottom ${sort.key === item.key && sort.type === 1 ? 'active' : ''}`} />
                  </div>
                )}
              </td>
            ))}
          </tr>
        </thead>
        <tbody>
          {props.dataSource.map((tr, idx) => (
            <tr key={`tr${idx}`} style={props.trStyle ? props.trStyle(tr) : {}}>
              {props.columns.map(item => {
                if (item.render) {
                  return <td key={`td${item.key}`} style={item.style}>{item.render(tr[item.key], tr)}</td>
                }
                return (
                  <td style={item.style} key={`td${item.key}`}>{tr[item.key]}</td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
