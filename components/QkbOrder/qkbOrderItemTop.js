import React from 'react';
import QkbItemTop from './component/qkbItemTop';

export default class QkbOrderItemTop extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return <QkbItemTop {...this.props} type='singleTop' />;
  }
}
