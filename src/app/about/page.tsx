import { Lightbulb, Target, Network, TrendingUp } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-bold text-white">About GroIntel</h1>
      <p className="mt-4 text-lg leading-relaxed text-gray-400">
        GroIntel is building an open growth intelligence network where company signals, market data,
        growth channels, and execution outcomes become transparent and continuously improve over time.
      </p>

      <div className="mt-12 space-y-8">
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10">
              <Lightbulb className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Signal Detection at Scale</h3>
              <p className="mt-1 text-sm leading-relaxed text-gray-500">
                We monitor thousands of companies across web3, AI, fintech, and SaaS to identify
                growth signals before they become obvious. Our engine analyzes developer activity,
                community growth, market expansion, and product launches.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-500/10">
              <Target className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Channel Matching Intelligence</h3>
              <p className="mt-1 text-sm leading-relaxed text-gray-500">
                Not all growth channels work for every company. GroIntel matches companies with the
                channels, communities, and nodes that align with their sector, stage, and growth signals.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
              <Network className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Open Intelligence Network</h3>
              <p className="mt-1 text-sm leading-relaxed text-gray-500">
                Growth data should be transparent. We&apos;re building a network where growth outcomes
                are shared, analyzed, and used to improve recommendations for everyone.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
              <TrendingUp className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Continuous Improvement</h3>
              <p className="mt-1 text-sm leading-relaxed text-gray-500">
                Every analysis improves our model. The more companies analyzed, the better the
                recommendations become for everyone in the network.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
