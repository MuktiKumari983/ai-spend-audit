'use client';

import { useState, useEffect } from 'react';
import { AuditFormState, runAuditEngine, FullAuditReport } from './utils/auditEngine';

const AVAILABLE_TOOLS = [
  { id: 'cursor', name: 'Cursor', plans: ['hobby', 'pro', 'business', 'enterprise'] },
  { id: 'copilot', name: 'GitHub Copilot', plans: ['individual', 'business', 'enterprise'] },
  { id: 'chatgpt', name: 'ChatGPT (OpenAI)', plans: ['plus', 'team', 'enterprise', 'api direct'] },
  { id: 'claude', name: 'Claude (Anthropic)', plans: ['pro', 'team', 'enterprise', 'api direct'] },
  { id: 'gemini', name: 'Gemini (Google)', plans: ['advanced', 'business', 'enterprise', 'api'] },
  { id: 'v0', name: 'v0 by Vercel', plans: ['free', 'premium', 'enterprise'] },
];

export default function Home() {
  const [formState, setFormState] = useState<AuditFormState>({
    teamSize: 1,
    primaryUseCase: 'coding',
    tools: [],
  });

  const [report, setReport] = useState<FullAuditReport | null>(null);

  // 1. Load Form State from LocalStorage on mount (Persistence Requirement)
  useEffect(() => {
    const savedState = localStorage.getItem('creded_audit_form');
    if (savedState) {
      try { 
        setFormState(JSON.parse(savedState)); 
      } catch (e) { 
        console.error("Error restoring state", e); 
      }
    }
  }, []);

  // 2. Save Form State to LocalStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('creded_audit_form', JSON.stringify(formState));
  }, [formState]);

  const handleInputChange = (field: keyof AuditFormState, value: any) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleToolToggle = (toolId: string) => {
    setFormState((prev) => {
      const exists = prev.tools.some((t) => t.toolId === toolId);
      if (exists) {
        return { ...prev, tools: prev.tools.filter((t) => t.toolId !== toolId) };
      } else {
        return {
          ...prev,
          tools: [...prev.tools, { toolId, planId: 'pro', monthlySpend: 20, seats: prev.teamSize }],
        };
      }
    });
  };

  const updateToolDetails = (toolId: string, updates: Partial<any>) => {
    setFormState((prev) => ({
      ...prev,
      tools: prev.tools.map((t) => (t.toolId === toolId ? { ...t, ...updates } : t)),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setReport(runAuditEngine(formState));
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white p-4 sm:p-8">
      <div className="max-w-5xl mx-auto">
        <header className="mb-12 text-center">
          <span className="text-xs font-bold tracking-widest text-blue-500 uppercase bg-blue-500/10 px-3 py-1 rounded-full">
            Round 1 MVP Assets
          </span>
          <h1 className="text-4xl sm:text-5xl font-black mt-3 tracking-tight bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400 bg-clip-text text-transparent">
            AI Spend Audit Engine
          </h1>
          <p className="text-slate-400 mt-2 max-w-xl mx-auto text-sm sm:text-base">
            Instantly surface software seat overhead redundancies and subscription tier anomalies.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: Input Form Profile */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-6">
            <h2 className="text-xl font-bold border-b border-slate-800 pb-3 text-slate-200">1. Stack Configuration</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs uppercase font-bold tracking-wider text-slate-400 mb-2">Total Team Size</label>
                <input
                  type="number"
                  min="1"
                  value={formState.teamSize}
                  onChange={(e) => handleInputChange('teamSize', parseInt(e.target.value) || 1)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-blue-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-bold tracking-wider text-slate-400 mb-2">Primary Workload</label>
                <select
                  value={formState.primaryUseCase}
                  onChange={(e) => handleInputChange('primaryUseCase', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-blue-500 transition"
                >
                  <option value="coding">Software Engineering</option>
                  <option value="writing">Marketing & Writing</option>
                  <option value="data">Data Science / Analytics</option>
                  <option value="mixed">Mixed Stack Portfolio</option>
                </select>
              </div>

              <div>
                <label className="block text-xs uppercase font-bold tracking-wider text-slate-400 mb-2">Active Frameworks/Tools</label>
                <div className="grid grid-cols-2 gap-2">
                  {AVAILABLE_TOOLS.map((tool) => {
                    const isChecked = formState.tools.some((t) => t.toolId === tool.id);
                    return (
                      <button
                        key={tool.id}
                        type="button"
                        onClick={() => handleToolToggle(tool.id)}
                        className={`p-2.5 text-xs rounded-xl border text-left font-semibold transition ${
                          isChecked
                            ? 'bg-blue-600/10 border-blue-500 text-blue-400'
                            : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'
                        }`}
                      >
                        {tool.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {formState.tools.map((activeTool) => {
                const meta = AVAILABLE_TOOLS.find((t) => t.id === activeTool.toolId);
                return (
                  <div key={activeTool.toolId} className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-3">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">{meta?.name}</span>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-600 block mb-1">Tier</span>
                        <select
                          value={activeTool.planId}
                          onChange={(e) => updateToolDetails(activeTool.toolId, { planId: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-xs text-white"
                        >
                          {meta?.plans.map((p) => <option key={p} value={p}>{p.toUpperCase()}</option>)}
                        </select>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-600 block mb-1">Bill ($)</span>
                        <input
                          type="number"
                          value={activeTool.monthlySpend}
                          onChange={(e) => updateToolDetails(activeTool.toolId, { monthlySpend: parseFloat(e.target.value) || 0 })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-xs text-white"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl text-sm tracking-wide transition shadow-lg shadow-blue-600/10"
              >
                Execute Audit Calculations
              </button>
            </form>
          </div>

          {/* RIGHT: Analytical Report View */}
          <div className="lg:col-span-7 space-y-6">
            {!report ? (
              <div className="bg-slate-900/50 border border-dashed border-slate-800 rounded-2xl p-12 text-center text-slate-500 text-sm">
                Fill the configuration matrix and click run to compile automated financial diagnostics.
              </div>
            ) : (
              <div className="space-y-6">
                {/* Hero Savings Scoreboard */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl grid grid-cols-2 gap-4">
                  <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Monthly Optimization</span>
                    <span className="text-2xl sm:text-3xl font-black text-red-400 mt-1 block">${report.totalMonthlySavings}</span>
                  </div>
                  <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Annual Retained Runway</span>
                    <span className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1 block">${report.totalAnnualSavings}</span>
                  </div>
                </div>

                {/* Granular Breakdown Table */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">2. Itemized Remediation Log</h3>
                  <div className="space-y-3">
                    {report.breakdown.map((item) => (
                      <div key={item.toolId} className="bg-slate-950 border border-slate-900 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="space-y-1 max-w-md">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-200 capitalize">{item.toolId}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${item.savings > 0 ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-slate-800 text-slate-400'}`}>
                              {item.recommendedAction}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 leading-relaxed">{item.reason}</p>
                        </div>
                        <div className="text-left sm:text-right shrink-0">
                          <span className="text-xs text-slate-500 block">Identified Leak</span>
                          <span className={`text-sm font-extrabold block ${item.savings > 0 ? 'text-red-400' : 'text-slate-400'}`}>
                            ${item.savings}/mo
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Credex Interactive Conditional Trigger Core */}
                <div className="bg-blue-950/20 border border-blue-900/30 rounded-2xl p-5 shadow-xl">
                  {report.totalMonthlySavings > 500 ? (
                    <div className="space-y-3">
                      <span className="text-xs font-bold tracking-widest text-amber-400 uppercase bg-amber-500/10 px-2.5 py-1 rounded">High Value Leak Found</span>
                      <h4 className="text-base font-bold">Your overhead structural leak exceeds standard thresholds.</h4>
                      <p className="text-xs text-slate-400">Credex enterprise team can secure custom off-market contracts reducing this specific run-rate immediately. Book a free human-in-the-loop consultation.</p>
                      <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-2 px-4 rounded-lg transition">
                        Connect with Credex Desk
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <h4 className="text-base font-bold">Your efficiency profile looks decent!</h4>
                      <p className="text-xs text-slate-400">Enter your operational contact below to freeze this profile and receive alerts if retail seat pricing matrices change.</p>
                      <div className="flex gap-2">
                        <input type="email" placeholder="name@company.com" className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs grow focus:outline-none text-white" />
                        <button className="bg-slate-800 hover:bg-slate-700 text-xs px-3 rounded-lg font-bold transition">Track Stack</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}