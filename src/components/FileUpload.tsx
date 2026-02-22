'use client';

import { useRef, useState } from 'react';
import { api } from '@/lib/api';
import { getImageUrl } from '@/lib/upload';

type Props = {
  /** عنوان الزر أو المنطقة */
  label?: string;
  /** الرابط الكامل للـ API (مثل /trips/xxx/images) */
  uploadUrl: string;
  /** اسم الحقل في FormData - يجب أن يطابق ما يتوقعه السيرفر */
  fieldName?: string;
  /** نوع الملفات المقبولة */
  accept?: string;
  /** عند نجاح الرفع - relativePath هو المسار النسبي المخزَن (مثل trips/xxx.jpg) */
  onSuccess: (relativePath: string) => void;
  /** عند حدوث خطأ */
  onError?: (message: string) => void;
  /** مسار نسبي لعرض معاينة (اختياري) */
  previewPath?: string | null;
  /** معطل */
  disabled?: boolean;
};

export function FileUpload({
  label = 'رفع صورة',
  uploadUrl,
  fieldName = 'image',
  accept = 'image/jpeg,image/png,image/gif,image/webp',
  onSuccess,
  onError,
  previewPath,
  disabled = false,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = async (file: File) => {
    if (disabled || loading) return;
    if (!file.type.match(/^image\/(jpeg|jpg|png|gif|webp)$/i)) {
      onError?.('صيغة غير مدعومة. استخدم: jpeg, png, gif, webp');
      return;
    }
    setLoading(true);
    onError?.('');
    const fd = new FormData();
    fd.append(fieldName, file);
    try {
      const { data } = await api.post(uploadUrl, fd);
      const relativePath = data.data?.imagePath ?? data.data?.path ?? data.data;
      if (typeof relativePath === 'string') {
        onSuccess(relativePath);
      } else {
        onError?.('لم يُرجع السيرفر مسار الصورة');
      }
    } catch (e) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'فشل رفع الملف';
      onError?.(msg);
    } finally {
      setLoading(false);
      inputRef.current?.form?.reset();
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const previewUrl = previewPath ? getImageUrl(previewPath) : null;

  return (
    <div className="space-y-2">
      {label && <span className="block text-sm font-medium text-slate-600 dark:text-slate-300">{label}</span>}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`border-2 border-dashed rounded-xl p-4 text-center transition ${
          dragOver ? 'border-[#b8860b] bg-amber-50/50 dark:bg-amber-900/20' : 'border-slate-300 dark:border-slate-600'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-[#b8860b]'}`}
        onClick={() => !disabled && !loading && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          disabled={disabled || loading}
          className="hidden"
        />
        {previewUrl ? (
          <div className="relative inline-block">
            <img src={previewUrl} alt="" className="max-h-32 rounded-lg object-cover" />
            {!disabled && (
              <span className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg text-white text-sm opacity-0 hover:opacity-100 transition">
                {loading ? 'جاري الرفع...' : 'تغيير'}
              </span>
            )}
          </div>
        ) : (
          <div className="text-slate-500 dark:text-slate-400">
            {loading ? 'جاري الرفع...' : 'اسحب الصورة هنا أو اضغط للاختيار'}
          </div>
        )}
      </div>
    </div>
  );
}
