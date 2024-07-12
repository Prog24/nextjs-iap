export const dynamic = "force-dynamic";
import { getFirstPageHTML } from "@/components/PdfPage";
import { PDFDocument } from "pdf-lib";
import puppeteer from "puppeteer";

export async function GET(request: Request) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox"],
  });
  const firstPage = browser.newPage();
  const firstPageHtml = getFirstPageHTML({});
  (await firstPage).setContent(await firstPageHtml);
  const mergedPdf = await PDFDocument.create();
  const pages = [firstPage];
  for (const page of pages) {
    const pdfData = (await page).pdf({
      printBackground: true,
      format: "A4",
      displayHeaderFooter: true,
      margin: {
        top: "0mm",
        bottom: "50px",
        left: "0mm",
        right: "0mm",
      },
    });
    const pdf = await PDFDocument.load(await pdfData);
    const pageList = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    pageList.forEach((page) => {
      mergedPdf.addPage(page);
    });
  }
  const pdfBytes = await mergedPdf.save();
  const pdf = Buffer.from(pdfBytes);
  await browser.close();

  return new Response(pdf, {
    headers: {
      "Content-Type": "application/pdf",
    },
  });
}
