import React, { useEffect, useState } from 'react'
import { ExclamationCircleFilled } from '@ant-design/icons'
import KeFetch from 'utils/keFetch'
import * as api from 'config/apiConfig'
import goToRecharge from 'utils/toRecharge'
import { workCity } from 'utils/getWorkCity'
import NP from 'number-precision'
import './index.less'

const coin = {
  common: '普通币',
  cash: '现金币',
}

let debuonceTimer = null

const BanlanceWaring = (props) => {
  const { bidForm, id, discountPrice = 0 } = props

  const [balanceDetailInfo, setBalanceDetailInfo] = useState(null)
  const [coinKinds, setCoinKinds] = useState(0) // mgr中配置的经纪人的支付币种种类
  const [enableAdjustPaySeq, setEnableAdjustPaySeq] = useState(false) // 是否支持经纪人调整支付顺序

  useEffect(() => {
    if (id) {
      getCoinSeqV2()
    }
  }, [id])

  useEffect(() => {
    if (debuonceTimer) {
      clearTimeout(debuonceTimer)
    }

    debuonceTimer = setTimeout(() => getBalancePayDetail(), 550)
    document.addEventListener('visibilitychange', getBalancePayDetail)
    return () => {
      document.removeEventListener('visibilitychange', getBalancePayDetail)
    }
  }, [bidForm.bid, bidForm.addingAmount, bidForm.addingVip, bidForm.discountItemId])

  // 获取经纪人币种顺序
  const getCoinSeqV2 = () => {
    const userInfo = window._GLOBAL_DATA.userInfo
    const url = api.coinSeqV2
    const params = {
      combinedCode: id,
      // 会员产品只看主岗，不涉及城市切换
      cityCode: id === '200002' ? userInfo.officeAddress || '' : workCity(),
      ucid: userInfo.id || '',
    }
    KeFetch(url, {
      data: params,
    })
      .then((data) => {
        const { coins = [], enableAdjustPaySeq } = data
        setCoinKinds(coins.length)
        setEnableAdjustPaySeq(enableAdjustPaySeq)
      })
      .catch(() => {
        console.log('获取经纪人支付币种信息出错')
      })
  }

  // 填写出价时，获取各账户余额情况
  const getBalancePayDetail = () => {
    let bid = 0
    let addMoney = 0
    let addVipMoney = 0

    if (bidForm && bidForm.bid) {
      bid = bidForm.bid || 0
    }

    if (bidForm && bidForm.adding) {
      addMoney = bidForm.addingAmount || 0
    }

    if (bidForm && bidForm.addingVip) {
      addVipMoney = bidForm.calVipAmount
    }

    const priceAmount = (Number(bid) + Number(addMoney) + Number(addVipMoney)) * 100

    const userInfo = window._GLOBAL_DATA.userInfo

    KeFetch(api.getBalancePayDetail, {
      data: {
        groupId: id,
        // 会员产品只看主岗，不涉及城市切换
        cityCode: id === '200002' ? userInfo.officeAddress || '' : workCity(),
        priceAmount: priceAmount,
        couponCode: bidForm && bidForm.discountItemId ? bidForm.discountItemId : '',
      },
    }).then((data) => {
      setBalanceDetailInfo(data)
      props.onChange && props.onChange(data)
    })
  }

  // 比例支付
  if (balanceDetailInfo?.mixPayment === 3) {
    // 0-顺序支付 1-比例支付 2-贝壳点支付 3-最小比例支付
    if (balanceDetailInfo.isSuffice) {
      // 查询是否有币种余额没达到最低支付金额要求
      const targetCoin = balanceDetailInfo.executeDetails.find((item) => !item.isSuffice)
      if (targetCoin) {
        return (
          <div className="banlance-waring">
            <ExclamationCircleFilled style={{ color: '#E02020' }} />
            <div className="banlance-text">
              {`此订单需要${coin[targetCoin.frontCode]}达到${targetCoin.minPayment}时才能支付`}
            </div>
          </div>
        )
      }
    } else {
      // 判断普通币有没有达到最小比例金额
      const targetCoin = balanceDetailInfo.executeDetails.find(
        (item) => item.frontCode === 'common'
      )
      if (targetCoin?.isSuffice) {
        // 普通币余额达到最小比例金额
        return (
          <div className="banlance-waring">
            <ExclamationCircleFilled style={{ color: '#E02020' }} />
            <div className="banlance-text">
              {`余额不足（余额：${
                balanceDetailInfo.executeDetails &&
                balanceDetailInfo.executeDetails.map((item) => item.balance + coin[item.frontCode])
              }）`}
              <span>
                此订单可用
                {NP.minus(discountPrice, Number(targetCoin.balance))}
                现金币补充支付
                <span className="top-up" onClick={() => goToRecharge()}>
                  去充值&gt;
                </span>
              </span>
            </div>
          </div>
        )
      } else {
        return (
          <div className="banlance-waring">
            <ExclamationCircleFilled style={{ color: '#E02020' }} />
            <div className="banlance-text">
              {`余额不足（余额：${
                balanceDetailInfo.executeDetails &&
                balanceDetailInfo.executeDetails.map((item) => item.balance + coin[item.frontCode])
              }）`}
              <span>普通币余额达到{targetCoin.minPayment}币后，此订单可用现金币补充支付</span>
            </div>
          </div>
        )
      }
    }
  }

  return balanceDetailInfo && !balanceDetailInfo.isSuffice ? (
    <div className="banlance-waring">
      <ExclamationCircleFilled style={{ color: '#E02020' }} />
      <div className="banlance-text">
        {`当前余额不足（余额：${
          balanceDetailInfo.executeDetails &&
          balanceDetailInfo.executeDetails.map((item) => item.balance + coin[item.frontCode])
        }）,无法购买。`}
        {balanceDetailInfo.isSupportCash ? (
          <span>
            您可选择补充现金币支付
            <span className="top-up" onClick={() => goToRecharge()}>
              去充值&gt;
            </span>
          </span>
        ) : null}
      </div>
    </div>
  ) : (
    <React.Fragment>
      {coinKinds > 1 && !enableAdjustPaySeq ? (
        <div className="banlance-waring" style={{ backgroundColor: '#FEF7E5' }}>
          <ExclamationCircleFilled style={{ color: '#F7B501' }} />
          <span style={{ marginLeft: 16 }}>当普通币不足时，支持现金币补充支付。</span>
        </div>
      ) : null}
    </React.Fragment>
  )
}

export default BanlanceWaring
