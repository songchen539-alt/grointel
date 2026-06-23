import Link from "next/link";

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-black/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
            <span className="text-xs font-bold text-white">GI</span>
          </div>
          <span className="text-lg font-semibold tracking-tight text-white">GroIntel</span>
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          <Link href="/" className="text-sm text-gray-400 transition-colors hover:text-white">Home</Link>
          <Link href="/web3-growth" className="text-sm text-gray-400 transition-colors hover:text-white">Web3 Growth</Link>
          <Link href="/business-intelligence" className="text-sm text-gray-400 transition-colors hover:text-white">For Companies</Link>
          <Link href="/capability-intelligence" className="text-sm text-gray-400 transition-colors hover:text-white">For KOLs</Link>
          <Link href="/world" className="text-sm text-gray-400 transition-colors hover:text-white">World</Link>
          <Link href="/channels/apply" className="text-sm text-gray-400 transition-colors hover:text-white">Partners</Link>
          <Link href="/contact" className="text-sm text-gray-400 transition-colors hover:text-white">Contact</Link>
        </nav>
        <Link
          href="/web3-growth"
          className="rounded-full bg-white px-5 py-2 text-sm font-medium text-black transition-colors hover:bg-gray-200"
        >
          Start
        </Link>
      </div>
    </header>
  );
}



