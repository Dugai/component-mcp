/**
 * 【组件】CPS商机包-列表-单个卡片
 */
import React from 'react'
import NP from 'number-precision'
import './index.less'

export default function ({ clickTop, data, renderButton }) {
  return (
    <div className="container-cpl-list-product-item">
      <div className="productItem-top" onClick={clickTop}>
        {data.productIco ? <img src={data.productIco} alt="img" /> : null}
        <div className="productItem-text">
          <h3>
            {data.productName || '--'}
            <span>›</span>
          </h3>
          {data.productTags
            && data.productTags.map(tag => <div key={tag} className="tag-red">{tag}</div>)}
          <p className="detail">
            此商机包内含
            {data.productSpec || '-'}
            个商机
          </p>
        </div>
      </div>
      <div className="productItem-bottom">
        <div className="cost">
          <p className="cut">
            优惠价：
            <span className="num">
              ￥
              {NP.divide(Number(data.salePrice), 100)}
            </span>
          </p>
          <p className="base">
            标准价：￥
            {NP.divide(Number(data.marketPrice), 100)}
          </p>
        </div>
        {renderButton()}
      </div>
    </div>
  )
}
