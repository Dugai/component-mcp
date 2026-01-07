import React from 'react';
import './index.less';

const FunnelPlot = props => (
  <section className="area data">
    <ul>
      {props.list.map((item, index) => {
        if (index === props.list.length - 1) {
          return (
            <li key={item.key}>
              <h3>{`${item.key || '-'}：${item.value || '-'}`}</h3>
            </li>
          );
        } else {
          return (
            <li key={item.key}>
              <h3>{`${item.key || '-'}：${item.value || '-'}`}</h3>
              <span>{item.rate ? item.rate.rate : '-'}</span>
              {item.rate && item.rate.desc && item.rate.isGood !== null ? (
                <div className={item.rate.isGood ? 'basic-tag good-tag' : 'basic-tag bad-tag'}>
                  {item.rate.desc}
                  <div
                    className={
                      item.rate.isGood
                        ? 'basic-tag-icon basic-tag-icon-good'
                        : 'basic-tag-icon basic-tag-icon-bad'
                    }
                  ></div>
                </div>
              ) : (
                ''
              )}
            </li>
          );
        }
      })}
    </ul>
  </section>
);

export default FunnelPlot;
