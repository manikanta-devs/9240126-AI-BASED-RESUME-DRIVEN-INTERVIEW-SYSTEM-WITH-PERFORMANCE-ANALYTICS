import React from 'react'
import { Mic, MicOff, Check, X, ShieldAlert } from 'lucide-react'

export default function InterviewControls({
  isListening = false,
  transcript = '',
  interimResult = '',
  micError = null,
  isSpeechSupported = true,
  onDoneAnswering = () => {},
  onExit = () => {},
  manualAnswerText = '',
  setManualAnswerText = () => {}
}) {
  const showTextFallback = !isSpeechSupported || micError === 'not-allowed'

  return (
    <div className="rounded-3xl border border-white/[0.08] bg-slate-900/60 p-5 flex flex-col gap-4 shadow-2xl relative">
      
      {/* captions area */}
      <div className="flex-1 min-h-[100px] max-h-[140px] bg-slate-950/50 border border-white/5 rounded-2xl p-4 overflow-y-auto scrollbar-thin flex flex-col justify-end">
        {showTextFallback ? (
          <div className="w-full flex flex-col gap-2">
            <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest block">
              Type Your Answer (Voice Fallback Active)
            </label>
            <textarea
              value={manualAnswerText}
              onChange={(e) => setManualAnswerText(e.target.value)}
              placeholder="Speech recognition is disabled. Type your answer here..."
              className="w-full h-16 bg-slate-950 rounded-xl border border-white/5 text-xs text-white placeholder-gray-500 p-3 outline-none focus:border-indigo-500/50 resize-none font-medium leading-relaxed overflow-y-auto scrollbar-thin"
            />
          </div>
        ) : (
          <div className="flex flex-col justify-end h-full">
            <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest block mb-1">
              Live Transcript Captions
            </label>
            <div className="text-xs font-semibold leading-relaxed overflow-y-auto max-h-[110px]">
              {transcript ? (
                <span className="text-white">{transcript}</span>
              ) : null}
              {interimResult ? (
                <span className="text-violet-400/90 italic">{interimResult}</span>
              ) : null}
              {!transcript && !interimResult ? (
                <span className="text-gray-600 block italic">
                  {isListening ? "Listening... start speaking your answer now." : "Click Start Speaking or submit."}
                </span>
              ) : null}
            </div>
          </div>
        )}
      </div>

      {/* mic permission alert */}
      {micError === 'not-allowed' && (
        <div className="px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-[10px] font-bold text-red-300 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
          <span>Microphone access blocked. Please enable mic permissions in your browser settings.</span>
        </div>
      )}

      {/* action control buttons row */}
      <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-1">
        <button
          onClick={onExit}
          className="px-4.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 hover:bg-red-500/15 hover:border-red-500/20 hover:text-red-300 text-xs font-bold text-gray-300 transition-colors flex items-center gap-1.5"
        >
          <X className="w-3.5 h-3.5" />
          <span>End Session</span>
        </button>

        <div className="flex items-center gap-2">
          {isListening && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-violet-500/15 border border-violet-500/20 text-[9px] font-black text-violet-300 uppercase tracking-wider animate-pulse">
              <span className="w-2 h-2 rounded-full bg-violet-400 animate-ping" />
              Mic Active
            </div>
          )}

          <button
            onClick={onDoneAnswering}
            disabled={showTextFallback ? !manualAnswerText.trim() : false}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-gray-500 disabled:border-transparent transition-all text-xs font-bold text-white shadow-lg flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Submit Response</span>
          </button>
        </div>
      </div>

    </div>
  )
}
