export default function StatCard({
  title,
  value,
  icon: Icon,
  colorClass,
  gradientClass,
}) {
  return (
    <div className="glass-card p-6 rounded-2xl flex items-center justify-between relative overflow-hidden group">
      <div
        className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none ${gradientClass}`}
      />

      <div className="space-y-2 z-10">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {title}
        </p>
        <h3 className="font-display font-extrabold text-3xl text-white tracking-tight">
          {value}
        </h3>
      </div>

      <div
        className={`h-12 w-12 rounded-xl flex items-center justify-center border z-10 transition-transform duration-300 group-hover:scale-110 ${colorClass}`}
      >
        <Icon size={20} />
      </div>
    </div>
  );
}
