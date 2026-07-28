"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Search, Mail, Phone, Building2, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { getAdminUsers } from "@/lib/api";

interface Customer {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  companyName?: string;
  dealerId?: string;
  lastLoginAt?: string;
  loginCount: number;
  createdAt: string;
}

const roleColors: Record<string, string> = {
  customer: "bg-blue-50 text-blue-600",
  dealer: "bg-purple-50 text-purple-600",
  admin: "bg-amber-50 text-amber-600",
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [trigger, setTrigger] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const res = await getAdminUsers({
          page,
          limit: 20,
          role: roleFilter || undefined,
          search: search || undefined,
        });
        if (!cancelled && res.success) {
          setCustomers(res.users || []);
          setTotalPages(res.pagination?.pages || 1);
        }
      } catch {
        // empty state
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [page, roleFilter, trigger]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = () => {
    setPage(1);
    setTrigger((t) => t + 1);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-8">
        <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-light text-dark-text md:text-4xl">
          Customer <span className="text-primary">Management</span>
        </h1>
        <p className="mt-2 text-sm text-muted">View and manage all registered users</p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Search by name, email, phone..."
            className="input-luxury w-full pl-10"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
          className="input-luxury w-auto"
        >
          <option value="">All Roles</option>
          <option value="customer">Customers</option>
          <option value="dealer">Dealers</option>
          <option value="admin">Admins</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-primary" />
        </div>
      ) : customers.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[24px] bg-white py-20 text-center shadow-sm border border-border/50">
          <Users size={48} className="text-muted/30" />
          <h3 className="mt-4 text-lg font-semibold text-dark-text">No customers found</h3>
          <p className="mt-1 text-sm text-muted">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-[24px] bg-white shadow-sm border border-border/50">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border/50 bg-accent/30">
                    <th className="px-6 py-4 font-semibold text-muted font-[family-name:var(--font-poppins)]">Name</th>
                    <th className="px-6 py-4 font-semibold text-muted font-[family-name:var(--font-poppins)]">Contact</th>
                    <th className="px-6 py-4 font-semibold text-muted font-[family-name:var(--font-poppins)]">Role</th>
                    <th className="px-6 py-4 font-semibold text-muted font-[family-name:var(--font-poppins)]">Company</th>
                    <th className="px-6 py-4 font-semibold text-muted font-[family-name:var(--font-poppins)]">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((c) => (
                    <tr key={c._id} className="border-b border-border/30 transition-colors hover:bg-accent/20">
                      <td className="px-6 py-4">
                        <p className="font-medium text-dark-text font-[family-name:var(--font-poppins)]">{c.name}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="flex items-center gap-1 text-xs text-muted">
                            <Mail size={12} /> {c.email}
                          </span>
                          {c.phone && (
                            <span className="flex items-center gap-1 text-xs text-muted">
                              <Phone size={12} /> {c.phone}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wider font-[family-name:var(--font-poppins)] ${roleColors[c.role] || "bg-gray-50 text-gray-500"}`}>
                          {c.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {c.companyName ? (
                          <span className="flex items-center gap-1 text-xs text-dark-text">
                            <Building2 size={12} /> {c.companyName}
                          </span>
                        ) : (
                          <span className="text-xs text-muted">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs text-muted">
                        {new Date(c.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted transition-colors hover:border-primary hover:text-primary disabled:opacity-30"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm text-muted font-[family-name:var(--font-poppins)]">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted transition-colors hover:border-primary hover:text-primary disabled:opacity-30"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}
