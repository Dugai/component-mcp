/**
 * 年月选择器组件
 * @author xyz
 * @createdAt 2024-12-19
 * @component 年月选择器组件
 * @description
 * 基于 antd-mobile DatePicker 实现的年月选择器，用于选择年份和月份。
 * 主要功能：
 * - 支持年月选择
 * - 自定义显示格式
 * - 支持回调函数
 */
import { DatePicker } from 'antd-mobile';
import { DownOutline } from 'antd-mobile-icons';
import dayjs, { Dayjs } from 'dayjs';
import { useState, useEffect, useMemo } from 'react';
import './index.less';

/** 支持的日期类型 */
type DateValue = Dayjs | Date | string;

interface YearMonthPickerProps {
  /** 当前选中的日期值（支持 Dayjs/Date/ISO 字符串） */
  value?: DateValue;
  /** 日期变化回调（dayjs） */
  onChange?: (date: Dayjs) => void;
  /** 自定义显示文本 */
  displayText?: string;
  /** 是否禁用 */
  disabled?: boolean;
  /** 自定义样式类名 */
  className?: string;
  /** 可选最小月份（含），不传表示无限制 */
  min?: DateValue;
  /** 可选最大月份（含），不传表示无限制 */
  max?: DateValue;
}

// 将任意输入规范为 dayjs 对象
const toDayjs = (input?: DateValue): Dayjs => {
  if (dayjs.isDayjs(input)) return input as Dayjs;
  if (input instanceof Date) return dayjs(input);
  if (typeof input === 'string') return dayjs(input);
  return dayjs();
};

// 规范到当月1号，去除日时分秒影响
const normalizeToMonthStart = (d: Dayjs): Dayjs => d.startOf('month');

export default function YearMonthPicker({
  value = dayjs(),
  onChange,
  displayText,
  disabled = false,
  className = '',
  min,
  max,
}: YearMonthPickerProps) {
  // 若未提供 min/max，则不限制
  const maxLimit = useMemo(() => (max ? normalizeToMonthStart(toDayjs(max)) : undefined), [max]);
  const minLimit = useMemo(() => (min ? normalizeToMonthStart(toDayjs(min)) : undefined), [min]);

  // 将给定日期夹在[min,max]内（仅在有边界时生效）
  const clamp = (d: Dayjs): Dayjs => {
    const m = normalizeToMonthStart(d);
    if (minLimit && m.isBefore(minLimit)) return minLimit;
    if (maxLimit && m.isAfter(maxLimit)) return maxLimit;
    return m;
  };

  const [visible, setVisible] = useState(false);
  const [currentValue, setCurrentValue] = useState<Dayjs>(clamp(toDayjs(value)));

  // 同步外部传入的 value，并按范围修正
  useEffect(() => {
    setCurrentValue(clamp(toDayjs(value)));
    // 依赖值的时间戳避免对象引用变化带来的循环
  }, [toDayjs(value).valueOf(), minLimit ? minLimit.valueOf() : 0, maxLimit ? maxLimit.valueOf() : 0]);

  /**
   * 格式化显示文本
   */
  const formatDisplayText = (d: Dayjs): string => {
    if (displayText) return displayText;
    return d.format('YYYY年M月');
  };

  /**
   * 处理日期选择
   */
  const handleDateChange = (selectedDate: Date) => {
    const fixed = clamp(dayjs(selectedDate));
    setCurrentValue(fixed);
    onChange?.(fixed);
    setVisible(false);
  };

  return (
    <div className={`year-month-picker ${className} ${disabled ? 'disabled' : ''}`}>
      <DatePicker
        title="选择年月"
        value={currentValue.toDate()}
        visible={visible}
        precision="month"
        {...(minLimit ? { min: minLimit.toDate() } : {})}
        {...(maxLimit ? { max: maxLimit.toDate() } : {})}
        onClose={() => setVisible(false)}
        onConfirm={handleDateChange}
      />
      
      <div 
        className="picker-trigger"
        onClick={() => !disabled && setVisible(true)}
      >
        <span className="picker-text">{formatDisplayText(currentValue)}</span>
        <DownOutline className="picker-icon" />
      </div>
    </div>
  );
}
