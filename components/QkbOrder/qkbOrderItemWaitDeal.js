import React from 'react';
import WaitDeal from './component/waitDeal';

export default class QkbOrderItemWaitDeal extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return <WaitDeal {...this.props} type='singleWaitDeal' />;
  }
}
