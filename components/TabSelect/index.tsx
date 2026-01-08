import React, { ReactNode, useState, useCallback } from 'react';
import './index.less';

/**
 * 标签项接口
 */
interface TabItem {
  /** 标签显示内容 */
  key: ReactNode;
  /** 标签值 */
  value: string;
}

/**
 * TabSelect 组件属性接口
 */
interface TabSelectProps {
  /** 标签列表 */
  tabList?: TabItem[];
  /** 子内容 */
  children?: ReactNode;
  /** 标签切换回调函数 */
  onChange?: (value: string) => void;
}

/**
 * TabSelect 组件
 * @description 自定义标签选择组件，支持多标签切换和内容展示
 * @param {TabSelectProps} props 组件属性
 * @returns {JSX.Element} 标签选择组件
 */
const TabSelect: React.FC<TabSelectProps> = ({ 
  tabList = [], 
  children, 
  onChange 
}) => {
  /** 当前激活的标签索引 */
  const [activeIndex, setActiveIndex] = useState<number>(0);

  /**
   * 获取标签项的 CSS 类名
   * @param {number} index 标签索引
   * @returns {string} CSS 类名字符串
   */
  const getTabItemClassName = useCallback((index: number): string => {
    const baseClass = 'mbrand-tab-item';
    const isActive = activeIndex === index;
    const len = tabList.length;
    
    // 激活状态的类名逻辑
    if (isActive) {
      if (index === 0) return `${baseClass} active-first`;
      if (index === len - 1) return `${baseClass} active-last`;
      if (len > 2) return `${baseClass} active-middle`;
      return baseClass;
    }

    // 非激活状态的类名逻辑
    if (len <= 2) return `${baseClass} disabled`;
    
    const disabledClassMap = {
      [`${activeIndex === 0 && index === 1}`]: 'disabled-first',
      [`${activeIndex === 1 && index === 0}`]: 'disabled-left', 
      [`${activeIndex === 1 && index === 2}`]: 'disabled-right',
      [`${activeIndex === len - 1 && index === 0}`]: 'disabled-first'
    };
    
    const disabledClass = Object.entries(disabledClassMap)
      .find(([condition]) => condition === 'true')?.[1] || 'disabled';
    
    return `${baseClass} ${disabledClass}`;
  }, [activeIndex, tabList.length]);

  /**
   * 获取内容包装器的 CSS 类名
   * @returns {string} CSS 类名字符串
   */
  const getContentWrapperClassName = useCallback((): string => {
    const len = tabList.length;
    
    if (len === 1) return 'content-wrapper';
    
    const classMap = {
      0: 'content-wrapper0',
      [len - 1]: 'content-wrapper2'
    };
    
    return classMap[activeIndex as keyof typeof classMap] || 'content-wrapper1';
  }, [activeIndex, tabList.length]);

  /**
   * 处理标签点击事件
   * @param {TabItem} tab 被点击的标签项
   * @param {number} index 标签索引
   */
  const handleTabClick = useCallback((tab: TabItem, index: number): void => {
    onChange?.(tab.value);
    setActiveIndex(index);
  }, [onChange]);

  return (
    <div className="mbrand-tab-select">
      {/* 标签栏 - 当标签数量大于1时显示 */}
      {tabList.length > 1 && (
        <div className="mbrand-tab-item-wrapper">
          {tabList.map((tab, index) => (
            <div
              key={index}
              className={getTabItemClassName(index)}
              onClick={() => handleTabClick(tab, index)}
            >
              {tab.key}
            </div>
          ))}
        </div>
      )}
      
      {/* 内容区域 */}
      <div className={getContentWrapperClassName()}>{children}</div>
    </div>
  );
};

export default TabSelect;
