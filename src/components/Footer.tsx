import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-black">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
                <span className="text-[10px] font-bold text-white">GI</span>
              </div>
              <span className="font-semibold text-white">GroIntel</span>
            </div>
            <p className="mt-3 text-xs text-gray-500 leading-relaxed max-w-xs">
              The Operating System for Company Intelligence.
            </p>
          </div>
          {[
            { title: "Platform", links: ["Company MRI", "Signal Intelligence", "Company Graph", "API", "Documentation", "Pricing"] },
            { title: "Enterprise", links: ["Enterprise", "Roadmap", "Status", "Changelog", "Security"] },
            { title: "Company", links: ["About", "Blog", "Careers", "Privacy", "Terms", "Contact"] },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="text-[11px] font-medium text-white mb-3 uppercase tracking-wider">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link}>
                    <Link href={link === "Contact" ? "/contact" : link === "About" ? "/about" : "#"} className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 pt-6 border-t border-white/5 text-xs text-gray-600">
          &copy; {new Date().getFullYear()} GroIntel. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
