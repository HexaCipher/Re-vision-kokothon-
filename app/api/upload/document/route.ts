import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 30;

// Supported file types
const SUPPORTED_TYPES = {
  "application/pdf": "pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "text/plain": "txt",
} as const;

type SupportedMimeType = keyof typeof SUPPORTED_TYPES;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    const fileType = SUPPORTED_TYPES[file.type as SupportedMimeType];
    if (!fileType) {
      return NextResponse.json(
        { error: "Invalid file type. Please upload a PDF, DOCX, or TXT file." },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 10MB." },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let extractedText = "";
    let pages: number | undefined;

    // Parse based on file type
    // Lazy-load parsers to avoid module-level crashes on Vercel
    switch (fileType) {
      case "pdf":
        // Dynamic import pdf-parse to avoid Vercel bundling issues
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const pdfParseModule = await import("pdf-parse") as any;
        const pdfParse = pdfParseModule.default || pdfParseModule;
        const pdfData = await pdfParse(buffer);
        extractedText = pdfData.text || "";
        pages = pdfData.numpages;
        break;

      case "docx":
        const mammoth = await import("mammoth");
        const docxResult = await mammoth.extractRawText({ buffer });
        extractedText = docxResult.value || "";
        break;

      case "txt":
        extractedText = buffer.toString("utf-8");
        break;
    }

    // Clean up the text
    extractedText = extractedText
      .replace(/\r\n/g, "\n") // Normalize line endings
      .replace(/[ \t]+/g, " ") // Replace multiple spaces/tabs with single space
      .replace(/\n\s*\n\s*\n/g, "\n\n") // Max 2 newlines (paragraph break)
      .trim();

    if (!extractedText || extractedText.length < 50) {
      return NextResponse.json(
        { error: "Could not extract enough text from the file. Please try a different file or paste your notes manually." },
        { status: 400 }
      );
    }

    // Return extracted text and metadata
    return NextResponse.json({
      success: true,
      text: extractedText,
      metadata: {
        pages: pages,
        characters: extractedText.length,
        fileName: file.name,
        fileType: fileType.toUpperCase(),
      },
    });
  } catch (error: any) {
    console.error("Document parsing error:", error);

    // Handle specific errors
    if (error.message?.includes("encrypted") || error.message?.includes("password")) {
      return NextResponse.json(
        { error: "This document is password protected. Please upload an unprotected file." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to parse document. Please try a different file or paste your notes manually." },
      { status: 500 }
    );
  }
}
