import Link from "next/link";

const navLinks = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/prospects", label: "Prospects" },
  { href: "/admin/growth-needs", label: "Growth Needs" },
  { href: "/admin/channels", label: "Channels" },
  { href: "/admin/leads", label: "Leads" },
  { href: "/admin/reports", label: "Reports" },
  { href: "/admin/events", label: "Events" },
];

export default function AdminNav() {
  return (
    <nav className="flex items-center gap-1 mb-8 border-b border-white/5 pb-4 overflow-x-auto">
      <Link href="/admin/dashboard" className="text-sm font-semibold text-white mr-4 shrink-0">
        GroIntel Admin
      </Link>
      <div className="flex items-center gap-1">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="px-3 py-1.5 text-xs text-gray-500 hover:text-white hover:bg-white/[0.04] rounded-lg transition-colors whitespace-nowrap"
          >
            {link.label}
          </Link>
        ))}
      </div>
      <div className="ml-auto shrink-0">
        <form action="/api/admin/logout" method="POST">
          <button type="submit" className="px-3 py-1.5 text-xs text-gray-500 hover:text-red-400 rounded-lg transition-colors">
            Logout
          </button>
        </form>
      </div>
    </nav>
  );
}
