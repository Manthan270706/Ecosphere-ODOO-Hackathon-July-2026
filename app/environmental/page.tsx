import Link from "next/link";

export default function EnvironmentalPage() {
  const links = [
    { label: "Emission Factors", href: "/environmental/emission-factors" },
    { label: "Environmental Goals", href: "/environmental/goals" },
    { label: "Carbon Transactions", href: "/environmental/carbon-transactions" },
    { label: "Product ESG Profiles", href: "/environmental/product-profiles" },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-slate-800">Environmental</h1>
      <div className="grid grid-cols-2 gap-4">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md text-slate-700 font-medium"
          >
            {l.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
