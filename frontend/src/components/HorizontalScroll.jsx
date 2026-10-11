export default function HorizontalScroll({ children, className = '' }) {
  return (
    <div className={`flex gap-5 overflow-x-auto scroll-hide pb-4 snap-x snap-mandatory ${className}`}>
      {children}
    </div>
  );
}
