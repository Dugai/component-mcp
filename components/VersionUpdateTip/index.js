/**
 *
 * 功能: 传入一个组件和app版本,提示Link/A+版本更新，作为高阶组件使用
 */
import React from 'react'
import { Popup } from '@ke/ked-m'
import { compareVersions } from 'compare-versions'
import { workCity } from 'utils/getWorkCity'
import dayjs from 'dayjs'

const { Modal } = Popup
const alert = Modal.alert

export default function (WrappedComponent, options) {
  return class extends React.Component {
    constructor(props) {
      super(props)
    }

    componentDidMount() {
      this.onShowUpdateModal()
      document.addEventListener('visibilitychange', this.onShowUpdateModal)
    }

    componentWillUnmount() {
      document.removeEventListener('visibilitychange', this.onShowUpdateModal)
    }

    onShowUpdateModal() {
      if (document.visibilityState !== 'visible') return

      const { version = '0.0.0' } = options

      if (window.$ljBridge && window.$ljBridge.ready) {
        window.$ljBridge.ready((bridge, webStatus) => {
          // 获取app版本
          const v = bridge.getAppVersion() || '0.0.0'
          const flag = compareVersions(v, version)
          if (flag === -1) {
            let actions = [
              {
                content: '去升级',
                onPress: () => {
                  if (webStatus.isLinkApp) {
                    // 如果是是在link嵌入
                    bridge.actionWithUrl('lianjialink://about/link')
                  } else if (webStatus.isApp) {
                    // 在A+潜入
                    bridge.actionWithUrl('lianjiaalliance://about/link')
                  }
                },
                style: {
                  color: '#E64B3E',
                },
              },
            ]

            const { signCitys = [] } = window.pageData
            let isForceUpdate = false

            // 从阿波罗中获取配置城市， 判断当前经纪人是否处于强制更新宣导城市
            if (signCitys.includes(workCity()) || signCitys.includes('ALL_CITY')) {
              isForceUpdate = true
            }

            // 不在验证的城市可以关闭弹窗
            if (!isForceUpdate) {
              actions.unshift({
                content: '取消',
                onPress: () => {},
              })
            }

            const nowTime = dayjs().valueOf() // 获取当前时间毫秒数
            const per_day_show_update_tip_time = window.localStorage.getItem(
              'per_day_show_update_tip_time'
            )

            let updateModalShowFlag = false

            if (!per_day_show_update_tip_time || nowTime > per_day_show_update_tip_time) {
              updateModalShowFlag = true

              const today = dayjs().format('YYYY-MM-DD') // 获取当天时间
              const millisecond = dayjs(`${today} 23:59:59`).valueOf() // 获取当天的最后一刻作为 每天弹窗只弹一次的依据
              window.localStorage.setItem('per_day_show_update_tip_time', millisecond)
            }

            // 强制更新的城市每次进来都弹窗提示更新，非强制更新城市一天只弹一次
            if (isForceUpdate || updateModalShowFlag) {
              alert({
                title: (
                  <div>
                    当前App版本较低，为保证购买体验，{isForceUpdate ? '需要' : '建议'}
                    将App升级至最新版本
                  </div>
                ),
                alertType: 'warning',
                actions,
              })
            }
          }
        })
      }
    }

    render() {
      return <WrappedComponent {...this.props} />
    }
  }
}
