import React from 'react'
import './index.less'

/**
 * 记录信息项组件
 * @param {string} label - 标签文本
 * @param {string} value - 值文本
 * @param {string} className - 额外的样式类名
 * @returns {JSX.Element}
 */
export default function RecordInfoItem({ label, value, className = '' }) {
  return (
    <div className={`record-info-item ${className}`}>
      <span className="info-label">{label}：</span>
      <span className="info-value">{value}</span>
    </div>
  )
}
