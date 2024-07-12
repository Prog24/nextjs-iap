import { getFirstPageHTML } from "@/components/PdfPage";
// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { PDFDocument } from "pdf-lib";
import puppeteer from "puppeteer";

type Json = {
  message: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Json | Buffer>,
) {
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

  return res.status(200).send(pdf);
  // return res.status(200).send({ message: "Hello, world!"})
}
