"use client";

import { Document, Page, pdfjs } from "react-pdf";
import { Skeleton } from "@/components/ui/skeleton";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PDFViewerProps {
  file: File;
  onLoadSuccess: (pdf: { numPages: number }) => void;
  // numPages prop'unu ekleyelim, çünkü SECReader'da numPages değerini zaten alıyoruz.
  // Bu, PDFViewer'ın kaç sayfa render edeceğini doğru bir şekilde bilmesini sağlar.
  numPages?: number;
}

export default function PDFViewer({
  file,
  onLoadSuccess,
  numPages = 0,
}: PDFViewerProps) {
  // `SECReader`'dan `numPages` değeri geliyorsa onu kullan, yoksa bir varsayılan (örneğin 100) kullan.
  // Ancak doğru yol, `SECReader`'ın `onDocumentLoadSuccess` callback'i tetiklendiğinde
  // `numPages` değerini state'e kaydedip bu `PDFViewer`'a prop olarak göndermesidir.
  // Mevcut yapınızda bu zaten `SECReader`'da yapılıyor gibi görünüyor,
  // bu yüzden `PDFViewer`'a `numPages` prop'u olarak geçirmeliyiz.
  const pagesToRender =
    numPages > 0
      ? Array.from({ length: numPages }, (_, i) => i + 1)
      : Array.from({ length: 100 }, (_, i) => i + 1);

  // PDF render boyutunu dinamik hale getirelim.
  // Genellikle parent container'ın genişliğine göre ayarlanır.
  // width prop'u yerine parentWidth prop'unu kullanalım.
  // Ancak `react-pdf` `width` prop'unu doğrudan bekliyor.
  // Bu nedenle, bir referans kullanarak parentWidth'i almak daha iyi bir yaklaşımdır.
  // Basitlik için şimdilik sabit bir `width` değeri verelim veya `scale` kullanalım.
  // SECReader'daki container zaten responsive olduğu için `width` değerini sabit bırakabiliriz.
  const pageRenderWidth = 600; // Optimal PDF sayfa genişliği

  return (
    <div className="flex flex-col items-center w-full min-h-[500px] p-6">
      <Document
        file={file}
        onLoadSuccess={onLoadSuccess}
        loading={
          <div className="flex flex-col items-center justify-center py-20 w-full">
            <Skeleton className="h-[400px] w-full max-w-[600px] bg-gray-100 rounded-lg mb-6" />
            <Skeleton className="h-6 w-32 bg-gray-100 rounded-full" />
            <p className="mt-4 text-gray-600 text-sm">Loading PDF...</p>
          </div>
        }
        error={
          <div className="flex flex-col items-center justify-center py-20 w-full text-red-600 bg-red-50 border border-red-200 rounded-lg p-6">
            <span className="text-4xl mb-4">🚨</span>
            <p className="font-semibold text-red-800 text-lg">
              Failed to load PDF
            </p>
            <p className="text-sm text-red-700 mt-2">
              Please check the file or try again.
            </p>
          </div>
        }
      >
        {pagesToRender.map((pageNum) => (
          <div
            key={`page_${pageNum}`}
            id={`page-${pageNum}`}
            // Her sayfa arasında daha az boşluk bırak, padding'i sıfırla, sadece margin-bottom olsun
            className="mb-6 bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden max-w-[700px]" // Kart stili kaldırıldı, sadece hafif bir gölge ve kenarlık
          >
            <Page
              pageNumber={pageNum}
              renderTextLayer={true}
              renderAnnotationLayer={false}
              width={pageRenderWidth} // Sabit genişlik veya responsive hesaplama kullanın
              loading={
                <div className="flex flex-col items-center justify-center h-[200px] py-10">
                  {" "}
                  {/* Yükseklik ayarlandı */}
                  <div className="w-10 h-10 border-4 border-t-4 border-gray-200 border-t-[#0C213A] rounded-full animate-spin mb-3"></div>
                  <p className="text-sm text-gray-500">Loading page...</p>
                </div>
              }
              error={
                <div className="text-center text-red-600 text-sm py-4">
                  Failed to load page {pageNum}
                </div>
              }
            />
            {/* Sayfa numarasını direkt sayfanın altına, sade bir şekilde */}
            <p className="text-center text-xs text-gray-500 py-2 border-t border-gray-100 bg-gray-50">
              Page {pageNum}
            </p>
          </div>
        ))}
      </Document>
    </div>
  );
}
