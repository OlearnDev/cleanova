export default function LoadingSpinner({ label = 'Chargement...', full = false }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 text-brand-700 ${full ? 'min-h-[50vh]' : 'py-10'}`}>
      <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-700 rounded-full animate-spin" />
      {label && <p className="text-sm text-gray-500">{label}</p>}
    </div>
  );
}
