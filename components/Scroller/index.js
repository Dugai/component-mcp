import React, { Component, Fragment } from 'react'
import { PullToRefresh, ListView } from 'antd-mobile';

class Scroller extends Component {
  constructor(props) {
    super(props)
    const ds = new ListView.DataSource({
      rowHasChanged: (r1, r2) => r1 !== r2
    })

    this.state = {
      dataSource1: ds,
      dataSource2: ds,
      refreshing: false,
      isLoading: false,
      list: [],
      scrollTop: 0,
      pager: {
        pageNum: 1,
        pageSize: 10,
        totalCount: 1,
        totalPage: 1
      },
      stopEndReached: false, // 阻止onEndReached方法触发
    }
  }
  static getDerivedStateFromProps(nextProps, prevState){
    //该方法内禁止访问this
    return {
      stopEndReached: nextProps.dataList.length < prevState.list.length,
      list: nextProps.dataList,
      pager: Object.assign({}, nextProps.pager)
    }
   }
  componentDidMount() {
    // this.setState({
    //   pager: Object.assign({}, this.props.pager)
    // }, () => {
    //   this.onRefresh()
    // })
  }
  componentDidUpdate(nextProps, prevState) {
  }

  onRefresh = () => {
    this.setState({ refreshing: true, isLoading: true });
    this.props.loadmore(1, () => {
      this.setState({
        refreshing: false,
        isLoading: false
      })
    })
  };
  onEndReached = (e) => {
    const { isLoading, pager } = this.state
    if (isLoading) return
    if (Number(pager.pageNum) < Number(pager.totalPage)) {
      this.setState({ isLoading: true })
      const num = ++pager.pageNum //NOSONAR
      this.props.loadmore(num, () => {
        this.setState({
          refreshing: false,
          isLoading: false
        })
      })
    } else {
      e.preventDefault()
    }
  }
  renderItem = (item, i) => {
    if (this.props.renderItem) {
      return this.props.renderItem(item, i)
    }
    return null
  }
  onScroll = (e) => {
  }
  render() {
    const { dataSource1, dataSource2, list, pager } = this.state
    let {
      style,
    } = this.props
    let data = list
    return (
        <Fragment>
          {
            this.state.stopEndReached ?
            <ListView
              key="listViewEle1"
              ref={el => this.listViewEle1 = el}
              {...this.props}
              dataSource={dataSource1.cloneWithRows(data)}
              renderRow={(rowData, id1, i) => this.renderItem(rowData, i)}
              renderFooter={() => (<div style={{ padding: 30, textAlign: 'center' }}>
                {this.state.isLoading ? '加载中...' : '没有更多数据'}
              </div>)}
              style={style}
              renderBodyComponent={() => (
                <div className="scroll_list"></div>
              )}
              initialListSize={pager.pageSize}
              pageSize={pager.pageSize}
              pullToRefresh={<PullToRefresh
                refreshing={this.state.refreshing}
                onRefresh={this.onRefresh}
              />}
              onScroll={this.onScroll}
              onEndReached={this.onEndReached}
              scrollRenderAheadDistance={500}
              onEndReachedThreshold={20}
            />
            : <ListView
                key="listViewEle2"
                ref={el => this.listViewEle2 = el}
                {...this.props}
                dataSource={dataSource2.cloneWithRows(data)}
                renderRow={(rowData, id1, i) => this.renderItem(rowData, i)}
                renderFooter={() => (<div style={{ padding: 30, textAlign: 'center' }}>
                  {this.state.isLoading ? '加载中...' : '没有更多数据'}
                </div>)}
                style={style}
                renderBodyComponent={() => (
                  <div className="scroll_list"></div>
                )}
                initialListSize={pager.pageSize}
                pageSize={pager.pageSize}
                pullToRefresh={<PullToRefresh
                  refreshing={this.state.refreshing}
                  onRefresh={this.onRefresh}
                />}
                onScroll={this.onScroll}
                onEndReached={this.onEndReached}
                scrollRenderAheadDistance={500}
                onEndReachedThreshold={20}
              />
          }
        </Fragment>
    )
  }
}

export default Scroller