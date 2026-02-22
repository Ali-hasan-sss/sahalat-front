'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';

type ReviewFormProps = {
  type: 'trip' | 'car';
  id: string;
  onSubmit: (rating: number, comment?: string) => Promise<void>;
  onCancel: () => void;
  rateLabel: string;
  commentPlaceholder: string;
  submitLabel: string;
  cancelLabel: string;
  isAr?: boolean;
};

export function ReviewForm({
  type,
  id,
  onSubmit,
  onCancel,
  rateLabel,
  commentPlaceholder,
  submitLabel,
  cancelLabel,
  isAr = false,
}: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const displayRating = hoverRating || rating;

  const handleSubmit = async () => {
    if (rating < 1 || rating > 5) return;
    setLoading(true);
    try {
      await onSubmit(rating, comment.trim() || undefined);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className=" rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 p-4"
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{rateLabel}</p>
      <div className="flex gap-1 mb-3">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            onClick={() => setRating(star)}
            className="p-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
            aria-label={`${star} من 5 نجوم`}
          >
            <Star
              size={24}
              className={
                star <= displayRating
                  ? 'fill-amber-500 text-amber-500'
                  : 'text-slate-300 dark:text-slate-600'
              }
              aria-hidden
            />
          </button>
        ))}
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder={commentPlaceholder}
        rows={2}
        className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none mb-3"
        maxLength={500}
      />
      <div className={`flex gap-2 ${isAr ? 'flex-row-reverse' : ''}`}>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading || rating < 1}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? '...' : submitLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-sm rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50"
        >
          {cancelLabel}
        </button>
      </div>
    </div>
  );
}
