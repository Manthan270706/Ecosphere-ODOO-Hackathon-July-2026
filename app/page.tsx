import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl font-extrabold mb-3 text-slate-900 flex items-center gap-3">
            🌍 EcoSphere
          </h1>
          <p className="text-slate-500 text-lg">
            ESG Management Platform — Unified Dashboard
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Environmental Module (Green) */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-md hover:border-emerald-200 transition-all">
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-2xl mb-4">
              🍃
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Environmental</h2>
            <p className="text-slate-500 text-sm mb-6 h-10">
              Track carbon footprints and manage emission goals.
            </p>
            <div className="space-y-2 text-sm font-medium">
              <Link href="/environmental/goals" className="block text-emerald-600 hover:underline">
                → Sustainability Goals
              </Link>
              <Link href="/environmental/emission-factors" className="block text-emerald-600 hover:underline">
                → Emission Factors
              </Link>
            </div>
          </div>

          {/* Social Module (Blue) */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-md hover:border-blue-200 transition-all">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-2xl mb-4">
              👥
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Social</h2>
            <p className="text-slate-500 text-sm mb-6 h-10">
              Manage CSR activities and diversity metrics.
            </p>
            <div className="space-y-2 text-sm font-medium">
              <Link href="/social" className="block text-blue-600 hover:underline">
                → Social Dashboard
              </Link>
              <Link href="/social/csr-activities" className="block text-blue-600 hover:underline">
                → CSR Activities
              </Link>
              <Link href="/social/diversity" className="block text-blue-600 hover:underline">
                → Diversity Dashboard
              </Link>
            </div>
          </div>

          {/* Governance Module (Purple) */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-md hover:border-purple-200 transition-all">
            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-2xl mb-4">
              ⚖️
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Governance</h2>
            <p className="text-slate-500 text-sm mb-6 h-10">
              Enforce policies, run audits, and track compliance.
            </p>
            <div className="space-y-2 text-sm font-medium">
              <Link href="/governance/policies" className="block text-purple-600 hover:underline">
                → ESG Policies
              </Link>
              <Link href="/governance/audits" className="block text-purple-600 hover:underline">
                → Audits
              </Link>
              <Link href="/governance/compliance-issues" className="block text-purple-600 hover:underline">
                → Compliance Issues
              </Link>
              <Link href="/governance/acknowledgements" className="block text-purple-600 hover:underline">
                → Acknowledgements
              </Link>
            </div>
          </div>

          {/* Gamification Module (Orange) */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-md hover:border-orange-200 transition-all">
            <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-2xl mb-4">
              🎮
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Gamification</h2>
            <p className="text-slate-500 text-sm mb-6 h-10">
              Engage employees with challenges and rewards.
            </p>
            <div className="space-y-2 text-sm font-medium">
              <Link href="/gamification/challenges" className="block text-orange-600 hover:underline">
                → Challenges
              </Link>
              <Link href="/gamification/leaderboard" className="block text-orange-600 hover:underline">
                → Leaderboard
              </Link>
              <Link href="/gamification/rewards" className="block text-orange-600 hover:underline">
                → Rewards
              </Link>
              <Link href="/gamification/badges" className="block text-orange-600 hover:underline">
                → Badges
              </Link>
              <Link href="/gamification/participation" className="block text-orange-600 hover:underline">
                → Approvals
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
