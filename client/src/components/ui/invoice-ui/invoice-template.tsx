import React, { useRef } from 'react';

// Use this interface to define the structure of a single invoice item.
interface InvoiceItem {
  description: string;
  subDescription: string;
  price: number;
  qty: number;
  total: number;
}

// This interface defines the data that the Invoice component will accept as props.
interface InvoiceData {
  invoiceNo: string;
  date: string;
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyWebsite: string;
  billingToName: string;
  billingToPhone: string;
  billingToAddress: string;
  totalDue: number;
  items: InvoiceItem[];
  subTotal: number;
  grandTotal: number;
  paymentInfo: string[];
  signatureImageUrl: string;
  signatureName: string;
  signatureTitle: string;
}

// Real data from the provided image to populate the invoice.
const realInvoiceData: InvoiceData = {
  invoiceNo: "034567",
  date: "21 FEBRUARY, 2024",
  companyName: "Rallygreatsite.com",
  companyAddress: "123 Anywhere St., Any City, ST",
  companyPhone: "+123 456 7890",
  companyWebsite: "www.rallygreatsite.com",
  billingToName: "LORNA ALVARADO",
  billingToPhone: "+123 456 7890",
  billingToAddress: "123 ANYWHERE ST., ANY CITY, ST",
  totalDue: 850.00,
  items: [
    {
      description: "Maintenace Web",
      subDescription: "In service routine maintenance",
      price: 60.00,
      qty: 2,
      total: 120.00,
    },
    {
      description: "Branding Design",
      subDescription: "New brand in stand office",
      price: 60.00,
      qty: 1,
      total: 120.00,
    },
    {
      description: "Web Depelovment",
      subDescription: "Depelovment standar website",
      price: 70.00,
      qty: 3,
      total: 300.00,
    },
    {
      description: "E-Book Design",
      subDescription: "Design e-book for infografik",
      price: 35.00,
      qty: 4,
      total: 140.00,
    },
  ],
  subTotal: 200.00, // Using value from image
  grandTotal: 800.00, // Using value from image
  paymentInfo: [
    "Paypal : paypalmastercard",
    "Payment : Visa, Mastercard, Wisse, Transfer",
  ],
  signatureImageUrl: "https://placehold.co/150x50/E2E8F0/1A202C?text=Olivia+W",
  signatureName: "Olivia W",
  signatureTitle: "Finance Manager",
};

// The main React component for the invoice.
const InvoiceTemplate: React.FC = () => {
  // Use a ref to target the invoice element for PDF generation.
  const invoiceRef = useRef<HTMLDivElement>(null);

  const {
    invoiceNo,
    date,
    companyName,
    companyAddress,
    companyPhone,
    companyWebsite,
    billingToName,
    billingToPhone,
    billingToAddress,
    totalDue,
    items,
    subTotal,
    grandTotal,
    paymentInfo,
    signatureImageUrl,
    signatureName,
    signatureTitle,
  } = realInvoiceData;

  // Building logo SVG.
  const BuildingIcon = () => (
    <svg className="w-8 h-8 md:w-10 md:h-10 text-cyan-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 19V6L2 12l10-6 10 6-10 6z" />
      <path d="M12 19l8-4" />
      <path d="M12 19l-8-4" />
    </svg>
  );

  // Function to handle the PDF download.
  const handleDownloadPdf = () => {
    // Ensure the required libraries are loaded and the invoice element exists.
    if (invoiceRef.current && (window as any).html2canvas && (window as any).jspdf) {
      const input = invoiceRef.current;
      (window as any).html2canvas(input, { scale: 2 })
        .then((canvas: HTMLCanvasElement) => {
          const imgData = canvas.toDataURL('image/png');
          const pdf = new (window as any).jspdf.jsPDF('p', 'mm', 'a4');
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = pdf.internal.pageSize.getHeight();
          const imgWidth = canvas.width;
          const imgHeight = canvas.height;
          const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
          const imgX = (pdfWidth - imgWidth * ratio) / 2;
          const imgY = 10;
          pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
          pdf.save("invoice.pdf");
        })
        .catch((error: any) => {
          console.error("Error generating PDF:", error);
        });
    } else {
      console.error("html2canvas or jspdf not loaded, or invoice element not found.");
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col justify-between">
      {/* Script tags for PDF generation libraries */}
      <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>

      {/* Top colored section */}
      <div className="h-16 md:h-24 bg-cyan-500"></div>

      {/* Main Invoice Card and Download Button */}
      <div className="p-4 sm:p-8 flex-grow flex justify-center items-center">
        <div className="flex flex-col items-center w-full max-w-4xl">
          {/* Download button */}
          <button
            onClick={handleDownloadPdf}
            className="mb-4 px-6 py-3 bg-cyan-600 text-white font-bold rounded-lg shadow-md hover:bg-cyan-700 transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-opacity-50"
          >
            Download Invoice as PDF
          </button>

          {/* Invoice card content */}
          <div ref={invoiceRef} className="bg-white rounded-lg shadow-xl w-full p-6 sm:p-10 font-sans">
            {/* Header Section */}
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b-2 border-gray-200 pb-6 mb-6">
              <div className="mb-4 sm:mb-0">
                <h1 className="text-4xl sm:text-5xl font-bold uppercase text-black mb-2">INVOICE</h1>
                <p className="text-sm text-gray-600">
                  NO. {invoiceNo} / {date}
                </p>
              </div>
              <div className="text-right flex flex-col items-end">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="flex flex-col text-sm text-gray-600">
                    <p>{companyPhone}</p>
                    <a href={`http://${companyWebsite}`} className="text-cyan-500 hover:underline">
                      {companyWebsite}
                    </a>
                    <p>{companyAddress}</p>
                  </div>
                  <BuildingIcon />
                </div>
                <p className="font-bold text-gray-800 text-lg">{companyName}</p>
              </div>
            </header>

            {/* Billing and Total Due Section */}
            <section className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8">
              <div className="mb-6 md:mb-0">
                <h2 className="text-xl font-bold uppercase text-gray-700 mb-2">BILLING TO :</h2>
                <p className="text-black text-lg font-semibold">{billingToName} | {billingToPhone}</p>
                <p className="text-sm text-gray-600">{billingToAddress}</p>
              </div>
              <div className="text-right">
                <h2 className="text-xl font-bold uppercase text-gray-700 mb-2">TOTAL DUE</h2>
                <p className="text-3xl font-extrabold text-black">
                  ${totalDue.toFixed(2)}
                </p>
              </div>
            </section>

            {/* Items Table */}
            <section className="mb-8">
              <table className="w-full text-left table-auto">
                <thead className="bg-gray-50 text-gray-600 uppercase text-sm">
                  <tr className="border-b border-gray-300">
                    <th className="py-3 px-2 sm:px-4 font-bold">Item Description</th>
                    <th className="py-3 px-2 sm:px-4 font-bold">Price</th>
                    <th className="py-3 px-2 sm:px-4 font-bold">Qty</th>
                    <th className="py-3 px-2 sm:px-4 font-bold text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="py-4 px-2 sm:px-4">
                        <p className="font-semibold text-gray-800">{item.description}</p>
                        <p className="text-sm text-gray-500">{item.subDescription}</p>
                      </td>
                      <td className="py-4 px-2 sm:px-4 text-gray-800">${item.price.toFixed(2)}</td>
                      <td className="py-4 px-2 sm:px-4 text-gray-800">{item.qty}</td>
                      <td className="py-4 px-2 sm:px-4 text-right font-semibold text-black">${item.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            {/* Totals and Payment Info */}
            <section className="flex flex-col md:flex-row justify-between items-start md:items-end">
              <div className="mb-8 md:mb-0">
                <h2 className="text-xl font-bold uppercase text-gray-700 mb-2">Payment Info</h2>
                {paymentInfo.map((info, index) => (
                  <p key={index} className="text-sm text-gray-600">
                    {info}
                  </p>
                ))}
              </div>
              <div className="w-full md:w-1/2 lg:w-1/3">
                <div className="flex justify-between items-center text-gray-800 border-b border-gray-300 py-2">
                  <span className="font-semibold text-lg">Sub-Total</span>
                  <span className="font-semibold text-lg">${subTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-black font-extrabold border-b border-gray-300 py-2">
                  <span className="text-2xl">Grand-Total</span>
                  <span className="text-2xl">${grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </section>

            {/* Footer */}
            <footer className="mt-8 pt-6 border-t-2 border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-end">
              <div className="mb-6 md:mb-0">
                <p className="font-bold text-lg text-black mb-1">Thank you for your business !</p>
                <p className="text-sm text-gray-500">
                  *Note : If there is an error in the calculation or other data, please contact us immediately
                </p>
              </div>
              <div className="text-center md:text-right">
                <img src={signatureImageUrl} alt="Signature" className="mx-auto md:mx-0 w-36 h-auto mb-2"/>
                <p className="font-semibold text-lg text-black">{signatureName}</p>
                <p className="text-sm text-gray-600">{signatureTitle}</p>
              </div>
            </footer>
          </div>
        </div>
      </div>

      {/* Bottom colored section */}
      <div className="h-16 md:h-24 bg-teal-500"></div>
    </div>
  );
};

export { InvoiceTemplate };
