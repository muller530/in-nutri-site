"use client";

import { useEffect, useRef, useState } from "react";

interface Milestone {
  id: number;
  year?: string | null;
  month?: string | null;
  title: string;
  description?: string | null;
  color?: string | null;
  icon?: string | null;
}

interface MilestoneTimelineProps {
  milestones: Milestone[];
}

// 根据年份分组，相同年份使用相同颜色
function getYearColor(year: string | null | undefined, index: number): string {
  if (!year) return "#10B981";
  
  const yearNum = parseInt(year);
  if (yearNum === 2017) return "#10B981"; // 绿色
  if (yearNum === 2019) return "#3B82F6"; // 蓝色
  if (yearNum === 2020) return "#F97316"; // 橙色
  if (yearNum === 2021) return "#06B6D4"; // 浅蓝色
  if (yearNum === 2022) return "#8B5CF6"; // 紫色
  if (yearNum === 2023) return "#EC4899"; // 粉色
  if (yearNum === 2024) return "#EC4899"; // 洋红色
  if (yearNum === 2025) return "#F97316"; // 橙色
  
  const colors = ["#10B981", "#3B82F6", "#F97316", "#06B6D4", "#8B5CF6", "#EC4899"];
  return colors[index % colors.length];
}

export function MilestoneTimeline({ milestones }: MilestoneTimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [linePositions, setLinePositions] = useState<Array<{ left: number; color: string; height: number; isAbove: boolean }>>([]);

  useEffect(() => {
    const calculatePositions = () => {
      const container = containerRef.current;
      if (!container) return;
      
      const containerRect = container.getBoundingClientRect();
      // 时间线在容器底部
      const timelineY = container.offsetHeight;
      
      const positions = cardRefs.current.map((ref, index) => {
        if (!ref) return null;
        
        const cardElement = ref.querySelector('.milestone-card') as HTMLElement;
        if (!cardElement) return null;
        
        const refRect = ref.getBoundingClientRect();
        const cardRect = cardElement.getBoundingClientRect();
        
        // 卡片中心X坐标（相对于容器）
        const left = refRect.left - containerRect.left + refRect.width / 2;
        const color = milestones[index]?.color || getYearColor(milestones[index]?.year, index);
        
        // 判断卡片在时间线上方还是下方（交替排列）
        const isAbove = index % 2 === 0;
        
        // 计算卡片到时间线的距离
        let lineHeight: number;
        if (isAbove) {
          // 卡片在时间线上方，线条从时间线延伸到卡片底部
          const cardBottomRelativeToContainer = cardRect.bottom - containerRect.top;
          lineHeight = cardBottomRelativeToContainer - timelineY;
        } else {
          // 卡片在时间线下方，线条从时间线延伸到卡片顶部
          const cardTopRelativeToContainer = cardRect.top - containerRect.top;
          lineHeight = timelineY - cardTopRelativeToContainer;
        }
        
        if (lineHeight < 50) {
          lineHeight = isAbove ? 250 : 200;
        }
        
        return { left, color, height: Math.abs(lineHeight), isAbove };
      }).filter((pos): pos is { left: number; color: string; height: number; isAbove: boolean } => pos !== null);
      
      setLinePositions(positions);
    };
    
    const timeouts = [
      setTimeout(calculatePositions, 200),
      setTimeout(calculatePositions, 800),
      setTimeout(calculatePositions, 1500),
    ];
    
    const rafId = requestAnimationFrame(() => {
      setTimeout(calculatePositions, 100);
    });
    
    window.addEventListener('resize', calculatePositions);
    window.addEventListener('scroll', calculatePositions, true);
    
    return () => {
      timeouts.forEach(clearTimeout);
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', calculatePositions);
      window.removeEventListener('scroll', calculatePositions, true);
    };
  }, [milestones]);

  // 图标组件 - 严格按照截图设计
  const renderIcon = (icon: string | null | undefined, color: string) => {
    if (!icon) return null;
    const iconSize = 18;
    const iconStyle = { width: `${iconSize}px`, height: `${iconSize}px`, fill: color };
    
    switch (icon) {
      case "rocket":
        return (
          <svg viewBox="0 0 24 24" style={iconStyle} className="flex-shrink-0">
            <path d="M9.19 6.35c-2.5 2.5-3.34 5.84-2.5 8.65L2 22l6.99-4.66c2.81.84 6.15-.01 8.65-2.5 3.34-3.34 3.34-8.76 0-12.1-3.34-3.34-8.76-3.34-12.1 0zm2.12-.7c2.5-2.5 6.56-2.5 9.06 0s2.5 6.56 0 9.06c-1.25 1.25-2.9 1.87-4.53 1.87s-3.28-.62-4.53-1.87c-2.5-2.5-2.5-6.56 0-9.06z"/>
            <path d="M11 11h2v6h-2z"/>
          </svg>
        );
      case "unicorn":
        return (
          <svg viewBox="0 0 24 24" style={iconStyle} className="flex-shrink-0">
            <path d="M22 7.43c0 .81-.66 1.47-1.47 1.47-.81 0-1.47-.66-1.47-1.47 0-.81.66-1.47 1.47-1.47.81 0 1.47.66 1.47 1.47zM5.19 6.16c-.74.02-1.45.43-1.91 1.11-.23.34-.29.75-.2 1.16.26 1.16 1.4 2.01 2.66 2.01.47 0 .93-.12 1.33-.34.4-.22.72-.54.91-.92.19-.38.24-.8.14-1.21-.2-.82-.88-1.47-1.73-1.67-.17-.04-.33-.06-.5-.05-.12.01-.24.01-.36.01h-.46z"/>
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        );
      case "globe":
        return (
          <svg viewBox="0 0 24 24" style={iconStyle} className="flex-shrink-0">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
          </svg>
        );
      case "star":
        return (
          <svg viewBox="0 0 24 24" style={iconStyle} className="flex-shrink-0">
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
          </svg>
        );
      case "sparkle":
        return (
          <svg viewBox="0 0 24 24" style={iconStyle} className="flex-shrink-0">
            <path d="M12 2l2.4 7.2h7.6l-6 4.8 2.4 7.2L12 17.6 5.6 21.2l2.4-7.2-6-4.8h7.6z"/>
          </svg>
        );
      default:
        return null;
    }
  };

  // 格式化月份为大写
  const formatMonth = (month: string | null | undefined): string => {
    if (!month) return "";
    return month.toUpperCase();
  };

  return (
    <div ref={containerRef} className="relative w-full" style={{ minHeight: "600px", paddingBottom: "80px", paddingTop: "100px" }}>
      {/* 底部水平虚线时间线 - 严格按照截图 */}
      <div className="absolute bottom-0 left-0 right-0 z-0" style={{ height: "1px" }}>
        <svg width="100%" height="1" style={{ display: 'block' }}>
          <line
            x1="0"
            y1="0.5"
            x2="100%"
            y2="0.5"
            stroke="#9CA3AF"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
        </svg>
      </div>
      
      {/* 里程碑卡片容器 */}
      <div className="relative flex flex-wrap gap-10 justify-start">
        {milestones.map((milestone, index) => {
          const year = milestone.year || "";
          const color = milestone.color || getYearColor(milestone.year, index);
          const isAbove = index % 2 === 0; // 交替排列：偶数在上方，奇数在下方
          
          return (
            <div 
              key={milestone.id} 
              ref={(el) => { cardRefs.current[index] = el; }}
              className="relative flex-shrink-0" 
              style={{ 
                width: "240px",
                ...(isAbove ? { marginBottom: "240px" } : { marginTop: "200px" }),
              }}
            >
              {/* 卡片内容 - 严格按照截图设计 */}
              <div 
                className="milestone-card bg-white rounded-lg p-5 shadow-md relative z-10"
                style={{ 
                  borderLeft: `4px solid ${color}`,
                }}
              >
                {/* 年份 - 大号彩色文字 */}
                {year && (
                  <div 
                    className="text-4xl font-bold mb-2 leading-tight"
                    style={{ color: color }}
                  >
                    {year}
                  </div>
                )}
                
                {/* 月份/季度 - 小号灰色文字，大写 */}
                {milestone.month && (
                  <div className="text-sm font-medium text-gray-600 mb-3 uppercase tracking-wide">
                    {formatMonth(milestone.month)}
                  </div>
                )}
                
                {/* 标题和图标 - 图标在右侧 */}
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-sm font-bold text-gray-900 flex-1 leading-snug">
                    {milestone.title}
                  </h3>
                  {milestone.icon && (
                    <div className="flex-shrink-0 mt-0.5">
                      {renderIcon(milestone.icon, color)}
                    </div>
                  )}
                </div>
                
                {/* 描述 */}
                {milestone.description && (
                  <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                    {milestone.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* 垂直虚线 - 从时间线上的圆圈延伸到卡片 */}
      {linePositions.map((pos, index) => {
        if (!pos || pos.height <= 0 || pos.left <= 0) return null;
        
        const color = milestones[index]?.color || getYearColor(milestones[index]?.year, index);
        const isAbove = pos.isAbove;
        
        return (
          <div
            key={`line-${milestones[index]?.id || index}`}
            className="absolute pointer-events-none"
            style={{
              left: `${pos.left}px`,
              bottom: "0px",
              height: `${pos.height}px`,
              width: "2px",
              transform: "translateX(-50%)",
              zIndex: 1,
            }}
          >
            {/* 虚线 */}
            <svg 
              width="2" 
              height={pos.height}
              style={{ display: 'block' }}
            >
              <line
                x1="1"
                y1={isAbove ? "0" : pos.height.toString()}
                x2="1"
                y2={isAbove ? pos.height.toString() : "0"}
                stroke={color}
                strokeWidth="2"
                strokeDasharray="4 4"
                opacity="0.5"
              />
            </svg>
            {/* 时间线上的彩色圆圈 */}
            <div
              className="absolute left-1/2 bottom-0 rounded-full"
              style={{
                width: "12px",
                height: "12px",
                backgroundColor: color,
                border: "2px solid white",
                transform: "translate(-50%, 50%)",
                zIndex: 2,
                boxShadow: "0 0 0 1px rgba(0,0,0,0.1)",
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
