import React, { useRef } from 'react';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import { jsPDF } from 'jspdf';
import saveAs from 'file-saver';

interface QRCodeDisplayProps {
  url: string;
  baseUrl: string;
  utmCampaign: string;
}

const DownloadIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className || "w-5 h-5 mr-2"}>
    <path d="M10.75 2.75a.75.75 0 00-1.5 0v8.614L6.295 8.235a.75.75 0 10-1.09 1.03l4.25 4.5a.75.75 0 001.09 0l4.25-4.5a.75.75 0 00-1.09-1.03l-2.955 3.129V2.75z" />
    <path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z" />
  </svg>
);

const generateFilename = (baseUrl: string, campaign: string, extension: string): string => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const dateString = `${year}${month}${day}`;

  let urlPart = baseUrl.replace(/^https?:\/\//, ''); // Remove http(s)://
  urlPart = urlPart.replace(/[\\/:*?"<>|#]+/g, '_'); // Replace forbidden characters, including slashes and hash

  const campaignPart = campaign.trim() ? campaign.trim().replace(/[\\/:*?"<>|#]+/g, '_') : 'nocampaign';
  
  return `${dateString}_${urlPart}_${campaignPart}.${extension}`.substring(0, 200); // Ensure filename is not too long
};


export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ url, baseUrl, utmCampaign }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const downloadSVG = () => {
    if (svgRef.current) {
      const svgData = new XMLSerializer().serializeToString(svgRef.current);
      const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      saveAs(blob, generateFilename(baseUrl, utmCampaign, 'svg'));
    }
  };

  const downloadPNG = () => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      if (canvas) {
         const dataUrl = canvas.toDataURL('image/png');
         saveAs(dataUrl, generateFilename(baseUrl, utmCampaign, 'png'));
      }
    }
  };
  
  const downloadPDF = () => {
     if (canvasRef.current) {
      const canvas = canvasRef.current;
      if (canvas) {
        const imgData = canvas.toDataURL('image/png');
        const qrWidthPx = canvas.width;
        const qrHeightPx = canvas.height;
        const paddingPx = 40; 
        const titleHeightPx = 30; 
        
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'px',
        });
        
        // Calculate available width for URL text
        const availableTextWidth = pdf.internal.pageSize.getWidth() - paddingPx * 2;
        let urlTextHeightPx = Math.ceil(pdf.getTextDimensions(`URL: ${url}`, {maxWidth: availableTextWidth, fontSize: 10}).h) + 10;


        pdf.internal.pageSize.width = qrWidthPx + paddingPx * 2;
        // Estimate total height dynamically
        const estimatedTotalHeight = qrHeightPx + paddingPx * 2 + titleHeightPx + urlTextHeightPx + 20; // Add some buffer
        pdf.internal.pageSize.height = estimatedTotalHeight;


        const pageWidth = pdf.internal.pageSize.getWidth();

        pdf.setFontSize(14);
        pdf.text('生成されたQRコード:', paddingPx, paddingPx + 10 );

        pdf.setFontSize(10);
        const urlLines = pdf.splitTextToSize(`URL: ${url}`, pageWidth - paddingPx * 2);
        pdf.text(urlLines, paddingPx, paddingPx + titleHeightPx);
        
        // Recalculate actual height taken by URL lines
        const actualUrlTextHeight = (Array.isArray(urlLines) ? urlLines.length : 1) * (pdf.getLineHeightFactor() * 10 * 0.352778); // Approximation of line height
        const qrCodeY = paddingPx + titleHeightPx + actualUrlTextHeight + 10; // Adjust spacing based on font size and line height

        pdf.addImage(imgData, 'PNG', paddingPx, qrCodeY, qrWidthPx, qrHeightPx);
        pdf.save(generateFilename(baseUrl, utmCampaign, 'pdf'));
      }
    }
  };

  const downloadEPS = () => {
    if (svgRef.current) {
      const svgData = new XMLSerializer().serializeToString(svgRef.current);
      const blob = new Blob([svgData], { type: 'application/postscript;charset=utf-8' });
      saveAs(blob, generateFilename(baseUrl, utmCampaign, 'eps'));
    }
  };

  return (
    <section className="bg-white p-6 sm:p-8 rounded-xl shadow-xl mt-8 flex flex-col items-center" aria-labelledby="qr-code-heading">
      <h2 id="qr-code-heading" className="text-2xl font-semibold mb-6 text-amber-500 border-b border-gray-200 pb-3 w-full text-center">
        2. QRコード
      </h2>
      <div className="p-4 bg-white rounded-lg inline-block shadow-lg mb-6" aria-label="QR Code Image">
        <QRCodeSVG 
          value={url} 
          size={256} 
          level="H" 
          includeMargin={true}
          ref={svgRef}
          aria-hidden="true" 
        />
      </div>
      <div style={{ display: 'none' }} aria-hidden="true">
          <QRCodeCanvas 
            value={url} 
            size={512} 
            level="H" 
            includeMargin={true}
            ref={canvasRef}
          />
      </div>

      <div className="w-full max-w-2xl mt-4">
        <h3 className="text-xl font-semibold mb-4 text-slate-700 text-center sm:text-left">
          ダウンロード
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={downloadPNG}
            className="flex items-center justify-center bg-amber-500 hover:bg-amber-600 text-white font-medium py-2.5 px-4 rounded-lg shadow-md transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-opacity-75 hover:scale-105 active:scale-95 whitespace-nowrap"
            aria-label="Download QR Code as PNG"
          >
            <DownloadIcon />
            PNG
          </button>
          <button
            onClick={downloadSVG}
            className="flex items-center justify-center bg-amber-500 hover:bg-amber-600 text-white font-medium py-2.5 px-4 rounded-lg shadow-md transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-opacity-75 hover:scale-105 active:scale-95 whitespace-nowrap"
            aria-label="Download QR Code as SVG"
          >
            <DownloadIcon />
            SVG
          </button>
          <button
            onClick={downloadPDF}
            className="flex items-center justify-center bg-amber-500 hover:bg-amber-600 text-white font-medium py-2.5 px-4 rounded-lg shadow-md transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-opacity-75 hover:scale-105 active:scale-95 whitespace-nowrap"
            aria-label="Download QR Code as PDF"
          >
            <DownloadIcon />
            PDF
          </button>
          <button
            onClick={downloadEPS}
            className="flex items-center justify-center bg-amber-500 hover:bg-amber-600 text-white font-medium py-2.5 px-4 rounded-lg shadow-md transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-opacity-75 hover:scale-105 active:scale-95 whitespace-nowrap"
            aria-label="Download QR Code as EPS"
          >
            <DownloadIcon />
            EPS
          </button>
        </div>
      </div>
    </section>
  );
};