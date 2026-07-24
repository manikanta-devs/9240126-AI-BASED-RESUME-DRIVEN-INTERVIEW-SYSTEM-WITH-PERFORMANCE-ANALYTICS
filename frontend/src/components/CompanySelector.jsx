import React from 'react';
import { Building2, Check, Sparkles } from 'lucide-react';

export default function CompanySelector({ companies = [], selectedCompany = null, onSelectCompany }) {
  if (!companies || companies.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-indigo-400" /> Select Target Company Mode
        </label>
        <span className="text-xs text-indigo-400 font-medium flex items-center gap-1">
          <Sparkles className="w-3 h-3" /> Tailored Culture & Rubrics
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {companies.map((company) => {
          const isSelected = selectedCompany?.id === company.id;

          return (
            <button
              key={company.id}
              type="button"
              onClick={() => onSelectCompany(company)}
              className={`text-left p-4 rounded-xl border transition-all duration-200 flex flex-col justify-between ${
                isSelected
                  ? 'bg-indigo-950/40 border-indigo-500 shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-500'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-100 text-base">{company.name}</span>
                  {isSelected && (
                    <span className="w-5 h-5 rounded-full bg-indigo-500 text-white flex items-center justify-center">
                      <Check className="w-3 h-3" />
                    </span>
                  )}
                </div>

                <div className="mt-1">
                  <span className="inline-block px-2 py-0.5 text-xs font-semibold rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {company.badge}
                  </span>
                </div>

                <p className="text-xs text-slate-400 mt-2 line-clamp-2">
                  {company.description}
                </p>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap gap-1">
                {company.principles.slice(0, 3).map((p, idx) => (
                  <span key={idx} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                    {p.split('(')[0].strip ? p.split('(')[0].strip() : p.split('(')[0]}
                  </span>
                ))}
                {company.principles.length > 3 && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800/60 text-slate-400">
                    +{company.principles.length - 3} more
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
