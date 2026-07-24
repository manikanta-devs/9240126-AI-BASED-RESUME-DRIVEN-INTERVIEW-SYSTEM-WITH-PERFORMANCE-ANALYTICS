import React, { useState, useEffect } from 'react';
import { Cpu, Server, ShieldAlert, Sparkles, CheckCircle2, AlertTriangle, Send, RefreshCw, Code2, Database } from 'lucide-react';
import client from '../api/client';
import toast from 'react-hot-toast';

export default function SystemDesignPage() {
  const [prompts, setPrompts] = useState([]);
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [solution, setSolution] = useState('');
  const [evaluating, setEvaluating] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    fetchPrompts();
  }, []);

  const fetchPrompts = async () => {
    try {
      const res = await client.get('/api/interview/system-design/prompts');
      if (res.data?.success && res.data.prompts) {
        setPrompts(res.data.prompts);
        if (res.data.prompts.length > 0) {
          setSelectedPrompt(res.data.prompts[0]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch system design prompts:', err);
    }
  };

  const handleEvaluate = async (e) => {
    e.preventDefault();
    if (!solution.trim()) {
      toast.error('Please enter your architectural solution first.');
      return;
    }

    setEvaluating(true);
    setResult(null);

    try {
      const res = await client.post('/api/interview/system-design/evaluate', {
        problem_id: selectedPrompt.id,
        solution
      });

      if (res.data?.success) {
        setResult(res.data.evaluation);
        toast.success('Architecture evaluation complete!');
      } else {
        toast.error('Evaluation failed. Please try again.');
      }
    } catch (err) {
      console.error('Evaluation error:', err);
      toast.error('Failed to evaluate system design.');
    } finally {
      setEvaluating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-4 sm:p-6 text-slate-100">
      {/* Page Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">
                System Design Studio & Evaluator
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Solve distributed systems architecture problems & receive Staff Engineer level SPOF and trade-off feedback.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Problem Prompts Selector & Input */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Server className="w-4 h-4 text-cyan-400" /> Select Scenario
            </h2>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {prompts.map((p) => {
                const active = selectedPrompt?.id === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => { setSelectedPrompt(p); setResult(null); }}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all text-xs ${
                      active
                        ? 'bg-cyan-950/40 border-cyan-500 text-white ring-1 ring-cyan-500/50'
                        : 'bg-slate-800/40 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm text-slate-100">{p.title}</span>
                      <span className={`px-2 py-0.5 rounded font-semibold text-[10px] ${
                        p.difficulty === 'Hard' ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {p.difficulty}
                      </span>
                    </div>
                    <p className="text-slate-400 line-clamp-2 mt-1">{p.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {selectedPrompt && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-cyan-300">{selectedPrompt.title}</h3>
                <p className="text-xs text-slate-300">{selectedPrompt.description}</p>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Key Requirements</h4>
                <ul className="space-y-1 text-xs text-slate-300">
                  {selectedPrompt.key_requirements.map((req, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <form onSubmit={handleEvaluate} className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Your Proposed Architectural Design & Trade-offs
                  </label>
                  <textarea
                    rows={6}
                    value={solution}
                    onChange={(e) => setSolution(e.target.value)}
                    placeholder="Describe your load balancing, database choice (SQL/NoSQL/Redis), sharding key, queueing mechanism (Kafka/SQS), and single points of failure mitigation..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 focus:ring-2 focus:ring-cyan-500 focus:outline-none placeholder:text-slate-600"
                  />
                </div>

                <button
                  type="submit"
                  disabled={evaluating}
                  className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 font-bold text-sm text-white rounded-xl shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2"
                >
                  {evaluating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Evaluating Architecture...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" /> Evaluate System Design
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Right Column: Evaluation Results */}
        <div className="lg:col-span-7 space-y-6">
          {result ? (
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6">
              {/* Score Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-cyan-950/40 border border-cyan-500/30 rounded-xl p-3 text-center">
                  <div className="text-xs font-medium text-cyan-400">Architecture</div>
                  <div className="text-2xl font-black text-cyan-200 mt-1">{result.architecture_score}%</div>
                </div>
                <div className="bg-teal-950/40 border border-teal-500/30 rounded-xl p-3 text-center">
                  <div className="text-xs font-medium text-teal-400">Scalability</div>
                  <div className="text-2xl font-black text-teal-200 mt-1">{result.scalability_score}%</div>
                </div>
                <div className="bg-indigo-950/40 border border-indigo-500/30 rounded-xl p-3 text-center">
                  <div className="text-xs font-medium text-indigo-400">Reliability</div>
                  <div className="text-2xl font-black text-indigo-200 mt-1">{result.reliability_score}%</div>
                </div>
                <div className="bg-purple-950/40 border border-purple-500/30 rounded-xl p-3 text-center">
                  <div className="text-xs font-medium text-purple-400">Overall</div>
                  <div className="text-2xl font-black text-purple-200 mt-1">{result.overall_design_score}%</div>
                </div>
              </div>

              {/* SPOFs Alert */}
              {result.single_points_of_failure?.length > 0 && (
                <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-2 text-rose-300 font-bold text-sm">
                    <ShieldAlert className="w-4 h-4 text-rose-400" /> Single Points of Failure (SPOFs) Identified
                  </div>
                  <ul className="list-disc list-inside text-xs text-rose-200 space-y-1">
                    {result.single_points_of_failure.map((spof, idx) => (
                      <li key={idx}>{spof}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Database & Trade-off Analysis */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <Database className="w-4 h-4 text-cyan-400" /> Database & Trade-off Evaluation
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800">
                  {result.database_choice_analysis}
                </p>

                {result.tradeoff_analysis?.length > 0 && (
                  <div className="space-y-1.5 pt-2">
                    <h4 className="text-xs font-semibold text-slate-400">Key Architectural Trade-offs</h4>
                    <div className="space-y-1">
                      {result.tradeoff_analysis.map((t, idx) => (
                        <div key={idx} className="text-xs text-slate-300 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                          <span>{t}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Mermaid Diagram View */}
              {result.recommended_mermaid_diagram && (
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-indigo-400" /> Target Architecture Flow (Mermaid JS)
                  </h3>
                  <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-cyan-300 font-mono overflow-x-auto">
                    {result.recommended_mermaid_diagram}
                  </pre>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-900/40 border border-slate-800 border-dashed rounded-2xl p-12 text-center text-slate-500 space-y-3">
              <Sparkles className="w-8 h-8 text-cyan-500 mx-auto opacity-50" />
              <p className="text-sm font-medium text-slate-400">
                Select a System Design scenario, enter your architectural solution, and click Evaluate to see deep Staff-level feedback.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
