import React from 'react';
import { Award, AlertTriangle, CheckCircle2, Sparkles, ArrowRight } from 'lucide-react';

export default function StarBreakdownCard({ analysis, onApplyRewrite }) {
  if (!analysis) return null;

  const {
    situation_score = 0,
    task_score = 0,
    action_score = 0,
    result_score = 0,
    overall_star_score = 0,
    has_quantitative_metrics = false,
    missing_elements = [],
    strong_elements = [],
    sentence_breakdown = [],
    improved_star_rewrite = "",
    actionable_tip = ""
  } = analysis;

  const getCategoryColor = (cat) => {
    switch (cat?.toLowerCase()) {
      case 'situation': return 'bg-sky-500/10 text-sky-400 border-sky-500/30';
      case 'task': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30';
      case 'action': return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'result': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      default: return 'bg-slate-700/30 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6 text-slate-100">
      {/* Header & Overall Score */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              STAR Method Diagnostic
            </h3>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Sentence-level structure breakdown & metric optimization
          </p>
        </div>

        <div className="flex items-center gap-3 bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-700">
          <Award className="w-6 h-6 text-yellow-400" />
          <div>
            <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">STAR Alignment</div>
            <div className="text-2xl font-black text-white">{overall_star_score}%</div>
          </div>
        </div>
      </div>

      {/* Component Scores Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-sky-950/30 border border-sky-500/20 rounded-xl p-3 text-center">
          <div className="text-xs font-medium text-sky-400">Situation</div>
          <div className="text-xl font-bold text-sky-200 mt-1">{situation_score}%</div>
        </div>
        <div className="bg-indigo-950/30 border border-indigo-500/20 rounded-xl p-3 text-center">
          <div className="text-xs font-medium text-indigo-400">Task</div>
          <div className="text-xl font-bold text-indigo-200 mt-1">{task_score}%</div>
        </div>
        <div className="bg-purple-950/30 border border-purple-500/20 rounded-xl p-3 text-center">
          <div className="text-xs font-medium text-purple-400">Action</div>
          <div className="text-xl font-bold text-purple-200 mt-1">{action_score}%</div>
        </div>
        <div className="bg-emerald-950/30 border border-emerald-500/20 rounded-xl p-3 text-center">
          <div className="text-xs font-medium text-emerald-400">Result</div>
          <div className="text-xl font-bold text-emerald-200 mt-1">{result_score}%</div>
        </div>
      </div>

      {/* Quantitative Metric Alert */}
      {!has_quantitative_metrics && (
        <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 text-amber-300">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-sm">
            <span className="font-semibold text-amber-200">Missing Quantifiable Metrics:</span> Your Result component lacks concrete numbers, percentages, or time savings (e.g. "reduced latency by 40%", "boosted revenue by $50k").
          </div>
        </div>
      )}

      {/* Sentence-by-Sentence Breakdown */}
      {sentence_breakdown.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-slate-300 mb-3">Sentence Tagging</h4>
          <div className="space-y-2">
            {sentence_breakdown.map((item, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3 bg-slate-850/50 bg-slate-800/40 rounded-xl border border-slate-800 text-sm">
                <span className="text-slate-300 flex-1">"{item.sentence}"</span>
                <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border uppercase tracking-wider ${getCategoryColor(item.category)}`}>
                  {item.category}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI STAR Rewrite */}
      {improved_star_rewrite && (
        <div className="bg-gradient-to-r from-indigo-950/40 to-purple-950/40 border border-indigo-500/30 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-indigo-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-400" /> Recommended STAR Rewrite
            </span>
            {onApplyRewrite && (
              <button
                onClick={() => onApplyRewrite(improved_star_rewrite)}
                className="text-xs px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg transition-colors flex items-center gap-1"
              >
                Use Script <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
          <p className="text-sm text-slate-200 leading-relaxed italic bg-slate-900/60 p-3 rounded-lg border border-slate-800">
            "{improved_star_rewrite}"
          </p>
        </div>
      )}
    </div>
  );
}
