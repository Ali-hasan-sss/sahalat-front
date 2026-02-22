'use client';

export const tableWrapper =
  'bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm';
export const tableClass = 'w-full';
export const theadClass =
  'bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-700';
export const thClass =
  'text-right p-4 font-medium text-slate-700 dark:text-slate-300 text-sm align-top';
export const tbodyTrClass =
  'border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors';
export const tdClass = 'p-4 text-right text-slate-800 dark:text-slate-200 text-sm align-top';
export const badgeActive =
  'px-2.5 py-1 rounded-lg text-xs font-medium bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300';
export const badgeInactive =
  'px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300';

export function AdminPagination({
  page,
  totalPages,
  onPrev,
  onNext,
}: {
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2 p-4 border-t border-slate-200 dark:border-slate-700">
      <button
        type="button"
        disabled={page <= 1}
        onClick={onPrev}
        className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-sm font-medium"
      >
        السابق
      </button>
      <span className="px-4 py-2 text-slate-600 dark:text-slate-400 text-sm">
        {page} / {totalPages}
      </span>
      <button
        type="button"
        disabled={page >= totalPages}
        onClick={onNext}
        className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-sm font-medium"
      >
        التالي
      </button>
    </div>
  );
}
