import { useState, useEffect } from 'react';
import { Brain, DollarSign, MapPin, Compass, CheckCircle2 } from 'lucide-react';

const steps = [
  { icon: Brain, label: 'Analyzing your preferences', color: 'text-purple-400' },
  { icon: DollarSign, label: 'Understanding budget', color: 'text-amber-400' },
  { icon: MapPin, label: 'Finding destinations', color: 'text-emerald-400' },
  { icon: Compass, label: 'Checking distance', color: 'text-cyan-400' },
  { icon: CheckCircle2, label: 'Creating recommendations', color: 'text-pink-400' },
];

export default function LoadingAnimation() {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-md mx-auto">
      <div className="relative bg-slate-800/50 backdrop-blur-sm border-2 border-dashed border-emerald-500/30 rounded-2xl p-6">
        {/* Header */}
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center">
            <Brain className="w-4 h-4 text-slate-900" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">AI Travel Assistant</h3>
            <p className="text-xs text-slate-400">Finding your perfect trips...</p>
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-3">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === activeStep;
            const isCompleted = index < activeStep;

            return (
              <div
                key={index}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-500 ${
                  isActive
                    ? 'bg-white/5 border border-white/10'
                    : isCompleted
                    ? 'opacity-60'
                    : 'opacity-30'
                }`}
              >
                <div className={`relative ${isActive ? 'animate-pulse' : ''}`}>
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Icon className={`w-4 h-4 ${isActive ? step.color : 'text-slate-600'}`} />
                  )}
                </div>
                <span className={`text-sm ${isActive ? 'text-white' : isCompleted ? 'text-slate-400' : 'text-slate-600'}`}>
                  {step.label}
                  {isActive && <span className="inline-flex ml-1"><span className="animate-bounce" style={{animationDelay:'0ms'}}>.</span><span className="animate-bounce" style={{animationDelay:'150ms'}}>.</span><span className="animate-bounce" style={{animationDelay:'300ms'}}>.</span></span>}
                </span>
              </div>
            );
          })}
        </div>

        {/* Progress bar */}
        <div className="mt-6 h-1 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${((activeStep + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
