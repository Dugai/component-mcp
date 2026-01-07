// Modal组件
import React, { Component } from 'react'
import { Icon } from 'antd-mobile'
import './index.less'
import { render } from 'react-dom'

class MyModal extends Component {
  static node = null

  static show = (content) => {
    if (MyModal.node) return
    const newNode = document.createElement('div')
    document.body.appendChild(newNode)
    MyModal.node = newNode
    render(
      <div className="mymodal_modalWrapper">
        <div className="mymodal_content">
          <div className="mymodal_close">
            <Icon type="cross" color="rgb(223,223,233)" size="20px" onClick={MyModal.hide} />
          </div>
          <div className="mymodal_text">{content || null}</div>
        </div>
      </div>,
      MyModal.node,
    )
    setTimeout(() => {
      document.body.style.overflow = 'hidden'
    }, 100)
  }

  static hide = () => {
    document.body.style.overflow = ''
    document.body.removeChild(MyModal.node)
    MyModal.node = null
  }

  //   static getDerivedStateFromProps(props, state){
  //     const document=window.document
  //     if(props.visible){ // visible 为true时，body中新增div，为createPortal提供一个挂载节点。
  //       const node=document.createElement('div')
  //       document.body.appendChild(node)
  //       return {
  //         node // 将挂载的Dom节点存储起来，方便移除时使用
  //       };
  //     }
  //     if(state.node){ // visible为false时，移除对应的dom
  //       document.body.removeChild(state.node)
  //     }
  //     return null
  //   }

  //   render () {
  //     const {visible,title,onOk,onCancel}=this.props
  //     if(!visible){
  //       return null;
  //     }
  //     return
  //   }
  // }
  // MyModal.propTypes={
  //   visible:PropTypes.bool
  // }
  // MyModal.defaultProps={
  //   visible:true
  // }
}
export default MyModal
