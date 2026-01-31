import { useEffect, useRef } from 'react';

export default function PdfViewer({ url, onClose }) {
  const iframeRef = useRef(null);

  useEffect(() => {
    if (iframeRef.current) {
      iframeRef.current.focus();
    }
  }, [url]);

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
      <div className="relative w-full max-w-4xl h-[80vh] bg-white rounded-xl shadow-lg overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-red-600 text-white rounded-full p-2 hover:bg-red-700"
        >
          ✕
        </button>
        <iframe
          ref={iframeRef}
          src={url}
          title="PDF Viewer"
          className="w-full h-full border-0"
        />
      </div>
    </div>
  );
}
