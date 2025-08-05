import { Calendar, Clock3 } from 'lucide-react';
import clsx from 'clsx';

type Props = {
  occurrences: { occurrence_id: string; start_time: string; duration: number }[];
  onSelect: (occId: string) => void;
  selected?: string;
};

export default function SessionGrid({ occurrences, onSelect, selected }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {occurrences.map((o) => {
        const iso = o.start_time;
        const label = new Date(iso).toLocaleString(undefined, {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
        });
        return (
          <button
            key={o.occurrence_id}
            onClick={() => onSelect(o.occurrence_id)}
            className={clsx(
              'flex items-center gap-1 px-2 py-1 rounded hover:bg-blue-100',
              selected === o.occurrence_id && 'bg-blue-200'
            )}
          >
            <Calendar className="w-4 h-4" />
            {label}
            <Clock3 className="w-4 h-4 ml-auto" />
            <span className="text-xs">{o.duration} min</span>
          </button>
        );
      })}
    </div>
  );
}
