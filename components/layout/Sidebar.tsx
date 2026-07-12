"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Dashboard", href: "/dashboard" },
  {
    label: "Environmental",
    href: "/environmental",
    children: [
      { label: "Emission Factors", href: "/environmental/emission-factors" },
      { label: "Environmental Goals", href: "/environmental/goals" },
    ],
  },
  {
    label: "Social",
    href: "/social",
    children: [
      { label: "CSR Activities", href: "/social/csr-activities" },
      { label: "Diversity Dashboard", href: "/social/diversity" },
      { label: "Participation", href: "/social/participation" },
    ],
  },
  {
    label: "Governance",
    href: "/governance",
    children: [
      { label: "Policies", href: "/governance/policies" },
      { label: "Policy Acknowledgements", href: "/governance/acknowledgements" },
      { label: "Audits", href: "/governance/audits" },
      { label: "Compliance Issues", href: "/governance/compliance-issues" },
    ],
  },
  {
    label: "Gamification",
    href: "/gamification",
    children: [
      { label: "Challenges", href: "/gamification/challenges" },
      { label: "Participation Approvals", href: "/gamification/participation" },
      { label: "Badges", href: "/gamification/badges" },
      { label: "Rewards", href: "/gamification/rewards" },
      { label: "Leaderboard", href: "/gamification/leaderboard" },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  // Hide sidebar on auth pages
  if (pathname === '/login' || pathname === '/signup') {
    return null;
  }

  return (
    <aside className="w-64 h-screen bg-slate-900 text-slate-100 flex flex-col overflow-y-auto">
      <div className="px-4 py-5 text-lg font-semibold border-b border-slate-700">
        EcoSphere
      </div>
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <div key={item.href}>
              <Link
                href={item.href}
                className={`block px-3 py-2 rounded-md text-sm font-medium ${
                  isActive ? "bg-emerald-600 text-white" : "text-slate-300 hover:bg-slate-800"
                }`}
              >
                {item.label}
              </Link>
              {item.children && isActive && (
                <div className="ml-3 mt-1 space-y-1">
                  {item.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className={`block px-3 py-1.5 rounded-md text-sm ${
                        pathname === child.href
                          ? "text-emerald-400"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
