/**
 * 商城收银台组件
 */
import React, { useState, useEffect } from 'react'
import { Button, Form, Input } from '@ke/ked-m'
import Utils from 'utils'
import { payHandler } from 'utils/toPayCash'
import * as api from 'config/apiConfig'
import KeFetch from 'utils/keFetch'
import NP from 'number-precision'
import debounce from 'lodash/debounce'
import { payTypeMap } from '@/constant'

import './index.less'

export default function (props) {
  const { orderId = '' } = Utils.getUrlParams()

  const [form] = Form.useForm()
  const [payLoading, setPayLoading] = useState(false)
  const [totalAmount, setTotalAmount] = useState(0) // 订单支付所需要总的金额
  const [coinAmount, setCoinAmount] = useState(0) // 贝壳币需要支付的金额
  const [cashPayAmount, setCashPayAmount] = useState(0) // 现金需要支付的金额
  const [cashMaxAmount, setCashMaxAmount] = useState(Infinity) // 现金支付的最大金额
  const [hintText, setHintText] = useState('')
  const [orderPayInfo, setOrderPayInfo] = useState({
    orderId: '',
    totalPayAmount: 0,
    orderPayPlanList: [],
  }) // 支付单信息
  const [isNumber, setIsNumber] = useState(true)

  let coinBalance = 0 // 贝壳币余额
  let maxPayAmount = 0 // 现金最大支付金额

  if (orderPayInfo.orderPayPlanList.length) {
    try {
      coinBalance = NP.divide(Number(orderPayInfo.orderPayPlanList[0].balanceAmount), 100)
      maxPayAmount = NP.divide(Number(orderPayInfo.orderPayPlanList[1]?.maxPayAmount), 100)
    } catch (e) {
      console.log('设置账户余额失败')
    }
  }

  // 贝壳币余额是否大于订单支付金额
  const isCoinBalanceEnough = coinBalance >= totalAmount

  // 判断贝壳币余额 + 现金最大比例支付金额是否满足订单金额支付
  const isEnoughPay = totalAmount <= cashMaxAmount + coinBalance

  // 现金输入的金额超出配置比例的最大金额
  const isBeyondCashMax = cashPayAmount > maxPayAmount

  // 贝壳币支付金额超出贝壳币账户余额
  const isBeyondCoinMax = coinAmount > coinBalance

  // 贝壳币余额
  useEffect(() => {
    Utils.setPageTitle('商城收银台')
    getOrderPayPlanInfo()
  }, [])

  useEffect(() => {
    calCoinAmount()
  }, [cashMaxAmount, totalAmount])

  // 查询收银台支付单信息
  const getOrderPayPlanInfo = () => {
    KeFetch(api.getOrderPayPlan, {
      data: {
        orderId,
      },
    }).then((res) => {
      setOrderPayInfo(res)
      const { orderPayPlanList = [], totalPayAmount = 0 } = res
      const targetAccount = orderPayPlanList.find((item) => item.payChannel === 2) // 找出现金支付项
      setCashMaxAmount(NP.divide(targetAccount?.maxPayAmount, 100))
      setTotalAmount(NP.divide(totalPayAmount, 100))
    })
  }

  // 计算应该支付多少贝壳币
  const calCoinAmount = () => {
    let coin_amount = 0
    // 贝壳币余额大于支付金额时
    if (isCoinBalanceEnough) {
      coin_amount = totalAmount
      setHintText(`现金最多可支付${cashMaxAmount}元`)
    } else {
      coin_amount = coinBalance
    }

    setCoinAmount(coin_amount.toFixed(2))
    form.setFieldsValue({
      cashMaxAmount: NP.minus(totalAmount, coin_amount),
    })

    setCashPayAmount(NP.minus(totalAmount, coin_amount))
  }

  const onCashAmountChange = debounce((val) => {
    // 只允许输入数字和小数点
    if (!/^(0|[1-9]\d*)(\.\d{1,2})?$/.test(val)) {
      setIsNumber(false)
      return
    } else {
      !isNumber && setIsNumber(true)
    }

    setCashPayAmount(val)
    setCoinAmount(NP.minus(totalAmount, Number(val)).toFixed(2))
  }, 300)

  const onPay = () => {
    if (payLoading) {
      return
    }

    const params = {
      orderId,
      payChannel: 3, // 3表示混合支付
      cashierParam: {
        appType: 1, // 写死1， 业务来源是sdk
        cashierType: 1,
      },
      payChannelAmountMap: {
        [payTypeMap['coin']]: NP.times(coinAmount, 100),
        [payTypeMap['cash']]: NP.times(cashPayAmount, 100),
      },
    }

    setPayLoading(true)

    KeFetch(api.payV2, {
      method: 'post',
      data: params,
    })
      .then((res) => {
        const jumpUrl = `/shangJi/order/v2/${orderId}`

        if (cashPayAmount == 0) {
          props.history.replace(jumpUrl)
          return
        }

        // 支付完之后跳到理房通收银台
        payHandler(res.cashierResult.cashierOrderNo, jumpUrl, jumpUrl)
      })
      .finally(() => {
        setPayLoading(false)
      })
  }

  return (
    <div className="mbrand-cashier">
      <div className="amount-wrapper">
        支付金额
        <div className="price">
          <span className="yuan">¥</span>
          <span className="amount">{totalAmount.toFixed(2)}</span>
        </div>
      </div>
      <div className="card-wrapper coin-card">
        <div className="coin-wrapper">
          <div className="coin-wrapper-left">
            <div className="coin-icon-wrapper">
              <div className="coin-icon" />
              <span className="desc">贝壳币支付</span>
            </div>
            <div className="balance">当前余额：{coinBalance}币</div>
          </div>
          <div className="coin-wrapper-right">{coinAmount}</div>
        </div>
        {!isCoinBalanceEnough && (
          <div className="coin-hint hint">贝壳币余额不足，需和现金组合支付</div>
        )}
      </div>
      <div className={`card-wrapper ${!isEnoughPay ? 'warning-border' : ''}`}>
        <div className="cash-icon-wrapper">
          <div className="cash-icon" />
          <span className="desc">现金支付</span>
        </div>
        <Form form={form}>
          <Form.Item name="cashMaxAmount">
            <Input extraBefore="¥" onChange={onCashAmountChange} />
          </Form.Item>
        </Form>
        {hintText && <div className="hint">{hintText}</div>}
        {!isEnoughPay && (
          <div className="out-limimt-info">已超出可支付上限，请获取更多贝壳币后再尝试购买</div>
        )}
        {isBeyondCashMax && (
          <div className="out-limimt-info">现金超过可支付上限，请获取更多贝壳币后再尝试购买</div>
        )}
        {isBeyondCoinMax && <div className="out-limimt-info">贝壳币余额不足，现金补足</div>}
        {!isNumber && <div className="out-limimt-info">请输入合法正数，最多支持两位小数</div>}
      </div>
      <div className="pay-btn">
        <Button
          type="primary"
          disabled={
            isBeyondCashMax ||
            !isEnoughPay ||
            isBeyondCoinMax ||
            coinAmount < 0 ||
            cashPayAmount < 0 ||
            !isNumber
          }
          onClick={onPay}
        >
          确认支付
        </Button>
      </div>
    </div>
  )
}
