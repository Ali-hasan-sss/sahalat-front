'use client';

import { Eye, Pencil, Trash2 } from 'lucide-react';

type Props = {
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
};

export function AdminActionButtons({ onView, onEdit, onDelete }: Props) {
  return (
    <div className="flex items-center gap-1 justify-start" dir="rtl">
      {onView && (
        <button
          type="button"
          onClick={onView}
          className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
          title="عرض التفاصيل"
          aria-label="عرض التفاصيل"
        >
          <Eye size={18} />
        </button>
      )}
      {onEdit && (
        <button
          type="button"
          onClick={onEdit}
          className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
          title="تعديل"
          aria-label="تعديل"
        >
          <Pencil size={18} />
        </button>
      )}
      {onDelete && (
        <button
          type="button"
          onClick={onDelete}
          className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-red-600 dark:hover:text-red-400 transition-colors"
          title="حذف"
          aria-label="حذف"
        >
          <Trash2 size={18} />
        </button>
      )}
    </div>
  );
}
