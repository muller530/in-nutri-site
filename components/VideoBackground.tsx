"use client";

import { useEffect, useRef } from "react";

interface VideoBackgroundProps {
  src: string;
}

export function VideoBackground({ src }: VideoBackgroundProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      console.warn("VideoBackground: video ref 未找到");
      return;
    }

    console.log("VideoBackground: 开始加载视频:", src);

    // 视频加载成功
    const handleLoadedData = () => {
      console.log("✅ VideoBackground: 视频加载成功:", src);
      video.play().catch((err) => {
        console.error("VideoBackground: 自动播放失败:", err);
      });
    };

    // 视频加载失败
    const handleError = (e: Event) => {
      console.error("❌ VideoBackground: 视频加载失败:", src, e);
      const error = video.error;
      if (error) {
        console.error("视频错误详情:", {
          code: error.code,
          message: error.message,
        });
      }
    };

    // 视频可以播放
    const handleCanPlay = () => {
      console.log("VideoBackground: 视频可以播放:", src);
    };

    video.addEventListener("loadeddata", handleLoadedData);
    video.addEventListener("error", handleError);
    video.addEventListener("canplay", handleCanPlay);

    return () => {
      video.removeEventListener("loadeddata", handleLoadedData);
      video.removeEventListener("error", handleError);
      video.removeEventListener("canplay", handleCanPlay);
    };
  }, [src]);

  return (
    <video
      ref={videoRef}
      className="absolute inset-0 h-full w-full object-cover z-0"
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      style={{ zIndex: 0 }}
      key={src} // 添加 key 确保 URL 变化时重新加载
    >
      <source src={src} type="video/mp4" />
      <source src={src} type="video/webm" />
      <source src={src} type="video/quicktime" />
      <source src={src} type="video/x-msvideo" />
      您的浏览器不支持视频播放。
    </video>
  );
}

