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
      { label: "Product ESG Profiles", href: "/environmental/product-profiles" },
      { label: "Carbon Transactions", href: "/environmental/carbon-transactions" },
      { label: "Environmental Goals", href: "/environmental/goals" },
    ],
  },
  {
    label: "Social",
    href: "/social",
    children: [
      { label: "CSR Activities", href: "/social/csr-activities" },
      { label: "Employee Participation", href: "/social/participation" },
      { label: "Diversity Dashboard", href: "/social/diversity" },
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
      { label: "Challenge Participation", href: "/gamification/participation" },
      { label: "Badges", href: "/gamification/badges" },
      { label: "Rewards", href: "/gamification/rewards" },
      { label: "Leaderboard", href: "/gamification/leaderboard" },
    ],
  },
  {
    label: "Reports",
    href: "/reports",
    children: [
      { label: "Environmental Report", href: "/reports/environmental" },
      { label: "Social Report", href: "/reports/social" },
      { label: "Governance Report", href: "/reports/governance" },
      { label: "ESG Summary", href: "/reports/esg-summary" },
      { label: "Custom Report Builder", href: "/reports/custom" },
    ],
  },
  {
    label: "Settings",
    href: "/settings",
    children: [
      { label: "Departments", href: "/settings/departments" },
      { label: "Categories", href: "/settings/categories" },
      { label: "ESG Configuration", href: "/settings/esg-configuration" },
      { label: "Notification Settings", href: "/settings/notifications" },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();

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
