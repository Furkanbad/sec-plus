"use client";

import dynamic from "next/dynamic";

const PDFViewer = dynamic(() => import("./pdf-viewer"), {
  ssr: false,
});

export default function AppPage() {
  return <PDFViewer />;
}
