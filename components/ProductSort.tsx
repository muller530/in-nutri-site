"use client";

import { useRouter, useSearchParams } from "next/navigation";

export function ProductSort({ currentSort }: { currentSort: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    const newSort = e.target.value;
    
    if (newSort === "featured") {
      params.delete("sort");
    } else {
      params.set("sort", newSort);
    }
    
    router.push(`/products?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-4">
      <label className="text-sm text-gray-700">排序:</label>
      <select
        value={currentSort}
        onChange={handleSortChange}
        className="rounded border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 focus:border-gray-400 focus:outline-none"
      >
        <option value="featured">推荐</option>
        <option value="name-asc">名称 A-Z</option>
        <option value="name-desc">名称 Z-A</option>
        <option value="price-low">价格: 低到高</option>
        <option value="price-high">价格: 高到低</option>
      </select>
    </div>
  );
}




