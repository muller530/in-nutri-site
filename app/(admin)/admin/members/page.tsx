import Link from "next/link";
export const runtime = 'edge';
import { db } from "@/db";
import { members } from "@/db/schema";

async function getMembers() {
  return await db.select().from(members);
}

export default async function AdminMembersPage() {
  const memberList = await getMembers();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">成员</h1>
        <Link
          href="/admin/members/new"
          className="rounded bg-[var(--color-primary)] px-4 py-2 text-white hover:bg-[#2fb54a]"
        >
          创建成员
        </Link>
      </div>
      <div className="overflow-x-auto rounded-lg bg-white shadow">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">姓名</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">邮箱</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">角色</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">激活</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">创建时间</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {memberList.map((member: any) => (
              <tr key={member.id}>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">{member.id}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{member.name || "-"}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{member.email}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{member.role || "admin"}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{member.isActive ? "是" : "否"}</td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {member.createdAt ? new Date(member.createdAt).toLocaleDateString() : "-"}
                </td>
                <td className="px-6 py-4 text-sm">
                  <Link href={`/admin/members/${member.id}`} className="text-blue-600 hover:text-blue-900">
                    编辑
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

