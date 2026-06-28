import { Trees, Waves, Mountain, Landmark, UtensilsCrossed, Sparkles } from 'lucide-react';

const tagConfig = {
  Nature: { icon: Trees, color: 'emerald', bg: 'from-emerald-500/20 to-emerald-600/20', border: 'border-emerald-500/30', text: 'text-emerald-400' },
  Beach: { icon: Waves, color: 'cyan', bg: 'from-cyan-500/20 to-cyan-600/20', border: 'border-cyan-500/30', text: 'text-cyan-400' },
  Adventure: { icon: Mountain, color: 'amber', bg: 'from-amber-500/20 to-amber-600/20', border: 'border-amber-500/30', text: 'text-amber-400' },
  History: { icon: Landmark, color: 'purple', bg: 'from-purple-500/20 to-purple-600/20', border: 'border-purple-500/30', text: 'text-purple-400' },
  Food: { icon: UtensilsCrossed, color: 'orange', bg: 'from-orange-500/20 to-orange-600/20', border: 'border-orange-500/30', text: 'text-orange-400' },
  Relaxation: { icon: Sparkles, color: 'pink', bg: 'from-pink-500/20 to-pink-600/20', border: 'border-pink-500/30', text: 'text-pink-400' },
};

export default function ExperienceTag({ label, selected, onClick, size = 'md' }) {
  const config = tagConfig[label] || tagConfig.Nature;
  const Icon = config.icon;
  
  const sizeClasses = size === 'sm' 
    ? 'px-2.5 py-1 text-xs gap-1' 
    : 'px-4 py-2 text-sm gap-2';

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center ${sizeClasses} rounded-full font-medium border transition-all duration-200 ${
        selected
          ? `bg-gradient-to-r ${config.bg} ${config.border} ${config.text} shadow-lg shadow-${config.color}-500/10`
          : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20 hover:text-slate-300'
      }`}
    >
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />
      {label}
    </button>
  );
}

export { tagConfig };
