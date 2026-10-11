import { STATUS_LABELS, StatusBadgeClasses } from '../utils/media';

export default function StatusBadge({ status }) {
  return (
    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${StatusBadgeClasses(status)}`}>
      {STATUS_LABELS[status] || status}
    </span>
  );
}
