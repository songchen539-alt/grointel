import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-black">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
                <span className="text-[10px] font-bold text-white">GI</span>
              </div>
              <span className="font-semibold text-white">GroIntel</span>
            </div>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-gray-500">
              AI Growth Intelligence Platform for Modern Companies.
              Discover growth opportunities, analyze market signals, and find the right channels.
            </p>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-medium text-white">Product</h4>
            <ul className="space-y-2">
              <li><Link href="/analyze" className="text-sm text-gray-500 transition-colors hover:text-white">Analyze</Link></li>
              <li><Link href="/signals" className="text-sm text-gray-500 transition-colors hover:text-white">Growth Signals</Link></li>
              <li><Link href="/about" className="text-sm text-gray-500 transition-colors hover:text-white">About</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-medium text-white">Company</h4>
            <ul className="space-y-2">
              <li><Link href="/contact" className="text-sm text-gray-500 transition-colors hover:text-white">Contact</Link></li>
              <li><span className="text-sm text-gray-500">hello@grointel.io</span></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-white/5 pt-6 text-center text-xs text-gray-600">
          &copy; {new Date().getFullYear()} GroIntel. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
