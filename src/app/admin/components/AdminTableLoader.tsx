export function AdminTableLoader({ rows = 5, cols = 6 }: { rows?: number; cols?: number }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700">
              {Array.from({ length: cols }).map((_, i) => (
                <th key={i} className="text-right p-4">
                  <div className="h-4 bg-slate-200 dark:bg-slate-600 rounded animate-pulse" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, rowIdx) => (
              <tr key={rowIdx} className="border-b border-slate-100 dark:border-slate-700/50">
                {Array.from({ length: cols }).map((_, colIdx) => (
                  <td key={colIdx} className="p-4">
                    <div
                      className="h-4 bg-slate-100 dark:bg-slate-700 rounded animate-pulse"
                      style={{ width: colIdx === 0 ? 48 : colIdx === cols - 1 ? 120 : '80%' }}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
