"use client";
import { useState } from "react";
import { Search, Crown, Shield, Users } from "lucide-react";

export default function ExecutiveManager({ users, onRoleChange, theme }: { users: any[], onRoleChange: (id: string, email: string, role: string) => void, theme: any }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const filteredUsers = users.filter(u => {
    const matchSearch = u.full_name?.toLowerCase().includes(search.toLowerCase()) || u.member_code?.toLowerCase().includes(search.toLowerCase());
    const matchRole = 
      filter === "all" ? true :
      filter === "executive" ? ["admin", "treasurer", "chairman", "secretary"].includes(u.role) :
      u.role === filter;
    return matchSearch && matchRole;
  });

  return (
    <div style={{ backgroundColor: theme.card, padding: "20px", borderRadius: "16px", border: `1px solid ${theme.border}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
        <Crown size={24} color={theme.accent} />
        <h3 style={{ color: theme.accent, margin: 0 }}>Manage Leadership</h3>
      </div>
      <p style={{ fontSize: "12px", color: theme.textMuted, marginBottom: "20px" }}>
        Appoint members to executive roles or remove their privileges.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
        <div style={{ position: "relative" }}>
          <Search size={18} color={theme.textMuted} style={{ position: "absolute", left: "12px", top: "12px" }} />
          <input type="text" placeholder="Search by name or code..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: "100%", padding: "12px 12px 12px 40px", borderRadius: "8px", border: `1px solid ${theme.border}`, backgroundColor: "rgba(0,0,0,0.3)", color: "white" }} />
        </div>
        <select value={filter} onChange={e => setFilter(e.target.value)} style={{ width: "100%", padding: "12px", borderRadius: "8px", backgroundColor: "rgba(0,0,0,0.3)", color: "white", border: `1px solid ${theme.border}` }}>
          <option value="all">All Members</option>
          <option value="executive">Show Only Executives</option>
          <option value="member">Show Only Normal Members</option>
        </select>
      </div>

      {filteredUsers.map(u => {
        const isMasterAdmin = u.email?.toLowerCase() === "gibsonmjomba20@gmail.com";
        const isExec = ['admin', 'treasurer', 'chairman', 'secretary'].includes(u.role);

        return (
          <div key={u.id} style={{ display: "flex", flexDirection: "column", gap: "10px", backgroundColor: "rgba(0,0,0,0.2)", padding: "16px", borderRadius: "12px", marginBottom: "10px", borderLeft: isMasterAdmin ? `4px solid ${theme.red}` : isExec ? `4px solid ${theme.accent}` : `4px solid ${theme.border}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: isMasterAdmin ? theme.red : theme.purple, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>{u.full_name?.charAt(0) || "U"}</div>
                <div>
                  <p style={{ fontWeight: "bold", margin: 0, display: "flex", alignItems: "center", gap: "6px" }}>
                    {u.full_name} {isMasterAdmin && <Shield size={14} color={theme.red} />}
                  </p>
                  <p style={{ fontSize: "10px", color: theme.textMuted, margin: 0 }}>ID: {u.member_code || "PENDING"}</p>
                </div>
              </div>
              <div style={{ padding: "4px 8px", borderRadius: "4px", fontSize: "10px", fontWeight: "bold", textTransform: "uppercase", backgroundColor: isMasterAdmin ? "rgba(239, 68, 68, 0.2)" : isExec ? "rgba(251, 191, 36, 0.2)" : "rgba(255, 255, 255, 0.1)", color: isMasterAdmin ? theme.red : isExec ? theme.accent : theme.textMuted }}>
                {u.role}
              </div>
            </div>
            {!isMasterAdmin && (
              <div style={{ display: "flex", gap: "10px", marginTop: "8px", borderTop: `1px solid ${theme.border}`, paddingTop: "10px" }}>
                <select value={u.role} onChange={(e) => onRoleChange(u.id, u.email, e.target.value)} style={{ flex: 1, padding: "10px", borderRadius: "6px", backgroundColor: theme.bg, color: "white", border: `1px solid ${theme.border}`, fontWeight: "bold" }}>
                  <option value="member">Demote to Member</option>
                  <option value="secretary">Appoint Secretary</option>
                  <option value="treasurer">Appoint Treasurer</option>
                  <option value="chairman">Appoint Chairman</option>
                  <option value="admin">Appoint Admin</option>
                </select>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
