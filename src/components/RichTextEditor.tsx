'use client';

import dynamic from 'next/dynamic';
import { useCallback } from 'react';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

const modules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ color: [] }, { background: [] }],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['blockquote', 'link'],
    ['clean'],
  ],
};

export function RichTextEditor({
  value,
  onChange,
  placeholder,
  className,
  dir,
  stickyToolbar,
  editorAlign = 'left',
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
  dir?: 'rtl' | 'ltr';
  stickyToolbar?: boolean;
  editorAlign?: 'left' | 'right';
}) {
  const handleChange = useCallback(
    (content: string) => {
      onChange(content);
    },
    [onChange]
  );

  return (
    <div className={className} dir={dir}>
      <ReactQuill
        theme="snow"
        value={value}
        onChange={handleChange}
        modules={modules}
        placeholder={placeholder}
        className={`rounded-lg overflow-hidden [&_.ql-toolbar]:rounded-t-lg [&_.ql-container]:rounded-b-lg [&_.ql-container]:max-h-[220px] [&_.ql-container]:overflow-y-auto [&_.ql-editor]:min-h-[120px] ${
          editorAlign === 'right' ? '[&_.ql-editor]:text-right' : '[&_.ql-editor]:text-left'
        } ${
          stickyToolbar ? '[&_.ql-toolbar]:sticky [&_.ql-toolbar]:top-0 [&_.ql-toolbar]:z-10 [&_.ql-toolbar]:shadow-sm' : ''
        }`}
      />
    </div>
  );
}
