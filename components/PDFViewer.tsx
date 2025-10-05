"use client";

import { Document, Page, pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PDFViewerProps {
  file: File;
  onLoadSuccess: (pdf: { numPages: number }) => void;
}

export default function PDFViewer({ file, onLoadSuccess }: PDFViewerProps) {
  return (
    <Document
      file={file}
      onLoadSuccess={onLoadSuccess}
      loading={
        <div className="text-center py-20">
          <div className="animate-spin text-4xl">⏳</div>
          <p className="mt-4 text-gray-600">Loading PDF...</p>
        </div>
      }
      error={
        <div className="text-center py-20 text-red-600">
          <p>Failed to load PDF</p>
        </div>
      }
    >
      {Array.from({ length: 100 }, (_, i) => i + 1).map((pageNum) => (
        <div key={`page_${pageNum}`} id={`page-${pageNum}`} className="mb-4">
          <Page
            pageNumber={pageNum}
            renderTextLayer={false}
            renderAnnotationLayer={false}
            width={600}
            loading=""
            error=""
          />
          <p className="text-center text-sm text-gray-500 mt-2">
            Page {pageNum}
          </p>
        </div>
      ))}
    </Document>
  );
}
