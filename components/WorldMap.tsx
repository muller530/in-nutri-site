"use client";

import { useEffect, useState } from "react";
import { getApiUrl } from "@/lib/api";

interface MapLocation {
  id: number;
  name: string;
  label?: string | null;
  latitude: string;
  longitude: string;
  color: string;
}

export function WorldMap() {
  const [locations, setLocations] = useState<MapLocation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLocations() {
      try {
        const res = await fetch(getApiUrl("/api/map-locations"), {
          cache: "no-store",
        });
        if (res.ok) {
          const data = await res.json();
          setLocations(data.data || []);
        }
      } catch (error) {
        console.error("Failed to load map locations:", error);
      } finally {
        setLoading(false);
      }
    }
    loadLocations();
  }, []);

  if (loading) {
    return (
      <div className="relative w-full bg-black rounded-2xl overflow-hidden flex items-center justify-center" style={{ aspectRatio: "2/1", minHeight: "300px" }}>
        <div className="text-white/50">加载中...</div>
      </div>
    );
  }

  // 生成更密集的像素风格点阵地图
  const generateContinentDots = (bounds: { minX: number; maxX: number; minY: number; maxY: number }, density: number = 8) => {
    const dots: [number, number][] = [];
    const stepX = (bounds.maxX - bounds.minX) / density;
    const stepY = (bounds.maxY - bounds.minY) / density;
    
    for (let x = bounds.minX; x <= bounds.maxX; x += stepX) {
      for (let y = bounds.minY; y <= bounds.maxY; y += stepY) {
        // 添加一些随机偏移，使点阵更自然
        const offsetX = (Math.random() - 0.5) * stepX * 0.3;
        const offsetY = (Math.random() - 0.5) * stepY * 0.3;
        dots.push([x + offsetX, y + offsetY]);
      }
    }
    return dots;
  };

  // 各大洲的边界（基于 1000x500 的 SVG 坐标系）
  const continents = {
    northAmerica: generateContinentDots({ minX: 150, maxX: 380, minY: 80, maxY: 220 }, 12),
    southAmerica: generateContinentDots({ minX: 230, maxX: 320, minY: 260, maxY: 380 }, 8),
    europe: generateContinentDots({ minX: 450, maxX: 560, minY: 70, maxY: 160 }, 8),
    africa: generateContinentDots({ minX: 490, maxX: 590, minY: 150, maxY: 290 }, 8),
    asia: generateContinentDots({ minX: 600, maxX: 880, minY: 70, maxY: 240 }, 12),
    australia: generateContinentDots({ minX: 760, maxX: 880, minY: 290, maxY: 360 }, 6),
  };

  return (
    <div className="relative w-full bg-black rounded-2xl overflow-hidden" style={{ aspectRatio: "2/1" }}>
      {/* 像素风格世界地图 SVG */}
      <svg
        viewBox="0 0 1000 500"
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* 黑色背景 */}
        <rect width="100%" height="100%" fill="#000000" />
        
        {/* 像素风格的大洲点阵 */}
        <g opacity="0.4" fill="#9ca3af">
          {continents.northAmerica.map(([x, y], i) => (
            <circle key={`na-${i}`} cx={x} cy={y} r="2.5" />
          ))}
          {continents.southAmerica.map(([x, y], i) => (
            <circle key={`sa-${i}`} cx={x} cy={y} r="2.5" />
          ))}
          {continents.europe.map(([x, y], i) => (
            <circle key={`eu-${i}`} cx={x} cy={y} r="2.5" />
          ))}
          {continents.africa.map(([x, y], i) => (
            <circle key={`af-${i}`} cx={x} cy={y} r="2.5" />
          ))}
          {continents.asia.map(([x, y], i) => (
            <circle key={`as-${i}`} cx={x} cy={y} r="2.5" />
          ))}
          {continents.australia.map(([x, y], i) => (
            <circle key={`au-${i}`} cx={x} cy={y} r="2.5" />
          ))}
        </g>

        {/* 位置标记 */}
        {locations.map((location) => {
          const x = (parseFloat(location.longitude) + 180) / 360 * 1000;
          const y = (90 - parseFloat(location.latitude)) / 180 * 500;
          
          // 解析颜色，支持渐变
          const pinColor = location.color || "#7C3AED";
          
          return (
            <g key={location.id} transform={`translate(${x}, ${y})`}>
              {/* 定位图标 - 水滴形状，带白色圆圈和向上箭头 */}
              <g>
                {/* 阴影 */}
                <ellipse cx="0" cy="28" rx="14" ry="6" fill="rgba(0,0,0,0.4)" />
                
                {/* 定位针主体 - 水滴形状（圆形顶部，尖角底部） */}
                <path
                  d="M 0 -18 Q -10 -18 -10 -8 Q -10 2 -8 8 Q -6 14 0 20 Q 6 14 8 8 Q 10 2 10 -8 Q 10 -18 0 -18 Z"
                  fill={pinColor}
                  stroke="rgba(255,255,255,0.3)"
                  strokeWidth="1"
                />
                
                {/* 白色圆圈 */}
                <circle cx="0" cy="-2" r="10" fill="white" />
                
                {/* 内部向上箭头/chevron */}
                <g transform="translate(0, -2)">
                  <path
                    d="M 0 -6 L -4 -2 L 0 2 L 4 -2 Z"
                    fill={pinColor}
                  />
                </g>
              </g>
              
              {/* 文字标签 - 匹配图片中的样式 */}
              <text
                x="0"
                y="48"
                textAnchor="middle"
                fill={pinColor}
                style={{ 
                  fontSize: "16px", 
                  fontWeight: "700", 
                  letterSpacing: "0.05em",
                  fontFamily: "system-ui, -apple-system, sans-serif"
                }}
              >
                {location.name.toUpperCase()}
              </text>
              {location.label && (
                <text
                  x="0"
                  y="64"
                  textAnchor="middle"
                  fill={pinColor}
                  style={{ 
                    fontSize: "14px", 
                    fontWeight: "600", 
                    letterSpacing: "0.1em",
                    fontFamily: "system-ui, -apple-system, sans-serif"
                  }}
                >
                  {location.label.toUpperCase()}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

