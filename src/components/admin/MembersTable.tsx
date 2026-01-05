// src/components/admin/MembersTable.tsx
import type { Role } from "@prisma/client";

export type MemberRow = {
  id: number;
  name: string | null;
  email: string;
  role: Role;
  emailVerified: Date | null;
};

export default function MembersTable({ users }: { users: MemberRow[] }) {
  return (
    <div className="bg-white border rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr className="text-left">
              <th className="px-6 py-3 font-medium">ID</th>
              <th className="px-6 py-3 font-medium">이름</th>
              <th className="px-6 py-3 font-medium">이메일</th>
              <th className="px-6 py-3 font-medium">권한</th>
              <th className="px-6 py-3 font-medium">인증</th>
            </tr>
          </thead>

          <tbody>
            {users.length === 0 ? (
              <tr>
                <td
                  className="px-6 py-10 text-center text-slate-500"
                  colSpan={5}
                >
                  결과가 없습니다.
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="border-t">
                  <td className="px-6 py-4">{u.id}</td>
                  <td className="px-6 py-4">{u.name ?? "-"}</td>
                  <td className="px-6 py-4">{u.email}</td>
                  <td className="px-6 py-4">
                    <span
                      className={[
                        "inline-flex items-center px-2 py-1 rounded-md text-xs font-medium",
                        u.role === "ADMIN"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-slate-50 text-slate-700 border border-slate-200",
                      ].join(" ")}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {u.emailVerified ? (
                      <span className="text-emerald-700">Verified</span>
                    ) : (
                      <span className="text-slate-500">-</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
