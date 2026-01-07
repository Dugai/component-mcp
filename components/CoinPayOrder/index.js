import React, { Component, Fragment } from 'react'
import { Icon, Toast } from 'antd-mobile'
import { Popup } from '@ke/ked-m'
import KeFetch from 'utils/keFetch'
import * as api from 'config/apiConfig'
import moduleStyle from './index.module.less'
import { workCity } from 'utils/getWorkCity'
import { message } from '../../../mock/web/coupon/discount_price'
const userInfo = window._GLOBAL_DATA.userInfo

const { Modal } = Popup
const alert = Modal.alert

class CoinPayOrder extends Component {
  state = {
    cityCode: userInfo.officeAddress || '',
    payOrder: this.props.itemInfo.coins || [],
    cachePayOrder: this.props.itemInfo.coins || [],
    submitLoading: false,
    combinedCode: this.props.itemInfo.combinedCode || '',
    parentInx: this.props.itemInx,
    enableMixedPayment: this.props.itemInfo.enableMixedPayment || 0,
    commonCoinPercentage: this.props.itemInfo.commonCoinPercentage || null,
  }
  componentWillUpdate(nextProps, nextState) {
    if (nextProps.itemInfo && nextProps.itemInfo.combinedCode !== this.state.combinedCode) {
      this.setState({
        payOrder: nextProps.itemInfo.coins,
        cachePayOrder: nextProps.itemInfo.coins,
        combinedCode: nextProps.itemInfo.combinedCode,
        parentInx: nextProps.itemInfo.parentInx,
        enableMixedPayment: nextProps.itemInfo.enableMixedPayment,
        commonCoinPercentage: nextProps.itemInfo.commonCoinPercentage,
      })
    }
  }

  onUp(inx) {
    alert({
      alertType: 'warning',
      message: '自动报买订单的支付顺序不会变化，如需修改，请取消订单后重新出价',
      actions: [
        {
          content: '知道了',
          style: {
            color: '#E64B3E',
          },
          onPress: () => {
            let { cachePayOrder } = this.state
            let currItem = cachePayOrder[inx]
            let preItem = cachePayOrder[inx - 1]
            cachePayOrder.splice(inx - 1, 1, currItem)
            cachePayOrder.splice(inx, 1, preItem)
            this.setState(
              {
                cachePayOrder,
              },
              () => {
                this.onSubmit()
              }
            )
          },
        },
      ],
    })
  }
  onDown(inx) {
    alert({
      alertType: 'warning',
      message: '自动报买订单的支付顺序不会变化，如需修改，请取消订单后重新出价',
      actions: [
        {
          content: '知道了',
          style: {
            color: '#E64B3E',
          },
          onPress: () => {
            let { cachePayOrder } = this.state
            let currItem = cachePayOrder[inx]
            let nextItem = cachePayOrder[inx + 1]
            cachePayOrder.splice(inx + 1, 1, currItem)
            cachePayOrder.splice(inx, 1, nextItem)
            this.setState(
              {
                cachePayOrder,
              },
              () => {
                this.onSubmit()
              }
            )
          },
        },
      ],
    })
  }
  onSubmit() {
    const { submitLoading, cityCode, combinedCode, cachePayOrder } = this.state
    if (submitLoading) return
    this.setState({
      submitLoading: true,
    })
    Toast.loading('操作中...', 0)
    console.log('cachePayOrder', cachePayOrder)
    const url = api.coinSubmit
    const groups = cachePayOrder.map((item) => item.code)
    const params = {
      ucid: userInfo.id || '',
      cityCode: workCity(),
      combinedCode,
      payGroups: groups.join(',') || '',
    }
    KeFetch(url, {
      data: params,
      method: 'post',
    })
      .then(() => {
        Toast.hide()
        this.setState({
          submitLoading: false,
        })
        this.props.onSure && this.props.onSure()
      })
      .catch(() => {
        Toast.hide()
        this.setState({
          submitLoading: false,
        })
        Toast.info('操作失败')
      })
  }
  render() {
    const { payOrder, enableMixedPayment, commonCoinPercentage } = this.state
    const { itemInfo } = this.props

    return (
      <div>
        {(enableMixedPayment === 0 || enableMixedPayment === 2) && (
          <div className={moduleStyle.wrap}>
            <div className={moduleStyle.left}>
              {payOrder.map((coin) => (
                <div className={moduleStyle.coinName} style={coin.style} key={coin.code}>
                  {coin.msg}
                </div>
              ))}
            </div>
            <div className={moduleStyle.left}>
              {payOrder && payOrder.length > 1 && itemInfo.enableAdjustPaySeq ? (
                <Fragment>
                  {payOrder.map((coin, inx) => (
                    <div className={moduleStyle.btns} key={inx}>
                      <div
                        className={inx === 0 ? moduleStyle.disabled : moduleStyle.up}
                        onClick={this.onUp.bind(this, inx)}
                      >
                        <Icon type="up" size="xs" />
                        <span>上移</span>
                      </div>
                      <div
                        className={
                          inx === payOrder.length - 1 ? moduleStyle.disabled : moduleStyle.down
                        }
                        onClick={this.onDown.bind(this, inx)}
                      >
                        <Icon type="down" size="xxs" />
                        <span>下移</span>
                      </div>
                    </div>
                  ))}
                </Fragment>
              ) : (
                <div style={{ fontSize: '14px', fontWeight: 'bold' }}>暂不支持调整顺序</div>
              )}
            </div>
          </div>
        )}
        {enableMixedPayment === 1 && (
          <Fragment>
            {payOrder.map((coin, inx) => (
              <div className={moduleStyle.coinItem} key={inx}>
                <div className={moduleStyle.coinName} style={coin.style} key={coin.code}>
                  {coin.msg}
                </div>
                {coin.code === 'personal_encourage' && (
                  <span className={moduleStyle.payRate}>{Number(commonCoinPercentage) + ''}%</span>
                )}
                {coin.code === 'personal_recharge' && (
                  <span className={moduleStyle.payRate}>
                    {Number(100 - commonCoinPercentage) + ''}%
                  </span>
                )}
              </div>
            ))}
          </Fragment>
        )}
      </div>
    )
  }
}

export default CoinPayOrder;
