import { getApiUrl } from "@/lib/api";

export const runtime = 'nodejs';

async function getBanner() {
  try {
    const apiUrl = getApiUrl("/api/banners");
    const res = await fetch(apiUrl, {
      cache: "no-store",
      headers: {
        'Accept': 'application/json',
      },
    });
    if (!res.ok) {
      return { error: `API 返回状态码: ${res.status}` };
    }
    const data = await res.json();
    return data;
  } catch (error) {
    return { error: (error as Error).message };
  }
}

export default async function DebugBannerPage() {
  const bannerData = await getBanner();
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">横幅数据调试</h1>
      <pre className="bg-gray-100 p-4 rounded overflow-auto">
        {JSON.stringify(bannerData, null, 2)}
      </pre>
      
      {bannerData.data && Array.isArray(bannerData.data) && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">横幅列表</h2>
          {bannerData.data.map((banner: any, index: number) => (
            <div key={index} className="mb-4 p-4 border rounded">
              <p><strong>Key:</strong> {banner.key}</p>
              <p><strong>Title:</strong> {banner.title || '无'}</p>
              <p><strong>Image/Video URL:</strong> {banner.image || '无'}</p>
              <p><strong>Is Active:</strong> {banner.isActive ? '是' : '否'}</p>
              <p><strong>Position:</strong> {banner.position}</p>
              {banner.image && (
                <div className="mt-2">
                  <p><strong>视频 URL 检查:</strong></p>
                  <ul className="list-disc list-inside text-sm">
                    <li>包含 /uploads/videos/: {banner.image.includes('/uploads/videos/') ? '是' : '否'}</li>
                    <li>以 .mp4 结尾: {banner.image.endsWith('.mp4') ? '是' : '否'}</li>
                    <li>以 .mov 结尾: {banner.image.endsWith('.mov') ? '是' : '否'}</li>
                    <li>以 .avi 结尾: {banner.image.endsWith('.avi') ? '是' : '否'}</li>
                    <li>以 .webm 结尾: {banner.image.endsWith('.webm') ? '是' : '否'}</li>
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}






