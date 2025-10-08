// utils/text-chunker.ts

export interface StructuredChunk {
  id: string; // Unique ID for the chunk
  title: string; // Title/heading of the chunk
  text: string; // The extracted text content
  sourceRef: string; // e.g., "Financial Statements -> Income Statement"
}

// Ortak finansal başlık kalıpları (regex ile)
const FINANCIAL_HEADING_PATTERNS = [
  /Item\s+\d+\.\s+Financial\s+Statements\s+and\s+Supplementary\s+Data/i,
  /Consolidated\s+Statements\s+of\s+Operations/i,
  /Consolidated\s+Balance\s+Sheets/i,
  /Consolidated\s+Statements\s+of\s+Cash\s+Flows/i,
  /Consolidated\s+Statements\s+of\s+Comprehensive\s+Income/i,
  /Notes\s+to\s+Consolidated\s+Financial\s+Statements/i,
  /Note\s+\d+(\.\d+)?\s*[\-\—]?\s*[A-Z].*/, // "Note X - YYY", "Note 1. Accounting Policies"
  /Management's\s+Discussion\s+and\s+Analysis/i, // Eğer burada tekrar geçiyorsa
  /((\b[A-Z]{2,}\b\s+){1,4}(Statement|Sheets|Flows|Note|Discussion))/, // Büyük harfle yazılmış olası başlıklar (örn: "BALANCE SHEETS")
];

// Metni mantıksal chunk'lara ayıran fonksiyon
export function extractFinancialChunksFromText(
  fullText: string
): StructuredChunk[] {
  const chunks: StructuredChunk[] = [];
  let chunkCounter = 0;

  const paragraphs = fullText.split(/\r?\n\s*\r?\n/); // Boş satırlara göre paragraflara ayır
  let currentChunkText = "";
  let currentChunkTitle = "Financial Section Part 1";
  let currentChunkId = `financial_chunk_${chunkCounter++}`;

  const MAX_CHUNK_LENGTH = 7000; // Her bir chunk için hedef karakter uzunluğu (yaklaşık 1750 token)
  const MIN_CHUNK_LENGTH = 500; // Minimum anlamlı chunk uzunluğu

  for (const paragraph of paragraphs) {
    const trimmedParagraph = paragraph.trim();
    if (trimmedParagraph.length === 0) continue;

    let isNewHeading = false;
    let detectedHeading = "";

    // Başlık kalıplarını kontrol et
    for (const pattern of FINANCIAL_HEADING_PATTERNS) {
      if (pattern.test(trimmedParagraph) && trimmedParagraph.length < 200) {
        // Çok uzun paragrafları başlık olarak algılama
        isNewHeading = true;
        detectedHeading = trimmedParagraph;
        break;
      }
    }

    if (isNewHeading && currentChunkText.length > MIN_CHUNK_LENGTH) {
      // Yeni bir başlık bulundu ve mevcut chunk anlamlı uzunluktaysa, kaydet
      chunks.push({
        id: currentChunkId,
        title: currentChunkTitle,
        text: currentChunkText.trim(),
        sourceRef: `Financials -> ${currentChunkTitle}`,
      });
      // Yeni chunk'ı başlat
      currentChunkText = trimmedParagraph;
      currentChunkTitle = detectedHeading;
      currentChunkId = `financial_chunk_${chunkCounter++}`;
    } else {
      // Mevcut chunk'a paragrafı ekle
      currentChunkText +=
        (currentChunkText.length > 0 ? "\n\n" : "") + trimmedParagraph;

      // Chunk çok uzadıysa, başlık bulamasak bile kes
      if (currentChunkText.length > MAX_CHUNK_LENGTH) {
        // En yakın cümle veya paragraf bitişine göre kesmeye çalışabiliriz
        const lastSentenceEnd = currentChunkText.lastIndexOf(".");
        const splitPoint =
          lastSentenceEnd > currentChunkText.length - 1000
            ? lastSentenceEnd + 1
            : MAX_CHUNK_LENGTH;

        const firstPart = currentChunkText.substring(0, splitPoint);
        const remainingPart = currentChunkText.substring(splitPoint);

        if (firstPart.trim().length > MIN_CHUNK_LENGTH) {
          chunks.push({
            id: currentChunkId,
            title: currentChunkTitle, // Başlık aynı kalabilir veya "Devamı" eklenebilir
            text: firstPart.trim(),
            sourceRef: `Financials -> ${currentChunkTitle} (Part ${
              chunks.length + 1
            })`,
          });
          // Kalan kısmı yeni bir chunk olarak başlat
          currentChunkText = remainingPart.trim();
          currentChunkTitle = `Financial Section Part ${
            chunkCounter + 1
          } (Cont. from ${currentChunkTitle})`;
          currentChunkId = `financial_chunk_${chunkCounter++}`;
        }
      }
    }
  }

  // Son kalan chunk'ı ekle
  if (
    currentChunkText.length > MIN_CHUNK_LENGTH ||
    (chunks.length === 0 && currentChunkText.length > 0)
  ) {
    chunks.push({
      id: currentChunkId,
      title: currentChunkTitle,
      text: currentChunkText.trim(),
      sourceRef: `Financials -> ${currentChunkTitle}`,
    });
  }

  return chunks;
}
