import { jsPDF } from 'jspdf';
import { formatRupee, formatBillDate, formatBillTime } from './formatters';

/**
 * Generates and downloads/prints a professional 58mm standard thermal store receipt
 * @param {Object} transaction - Transaction record
 * @param {Object} settings - Shop settings (Name, UPI ID, Holder, etc.)
 * @param {boolean} autoPrint - Triggers immediate print dialog if true
 */
export const generateThermalReceipt = (transaction, settings, autoPrint = false) => {
  // POS receipts are usually 58mm or 80mm wide.
  // 58mm standard is approx 164pt wide. Let's make it 58mm wide, dynamic height.
  const width = 164; // pt
  const height = 280; // pt
  
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: [width, height]
  });

  const shopName = settings.shopName || "BHARATPAY STORE";
  const upiId = settings.upiId || "merchant@upi";
  const holderName = settings.holderName || "Store Owner";
  const mobile = settings.mobileNumber || "9999999999";
  const bank = settings.bankName || "STATE BANK OF INDIA";

  // Center alignments helper
  const centerX = width / 2;

  // Header Title
  doc.setFont("Outfit", "bold");
  doc.setFontSize(10);
  doc.text(shopName.toUpperCase(), centerX, 18, { align: 'center' });

  // Store Address / Meta
  doc.setFont("Inter", "normal");
  doc.setFontSize(6);
  doc.text(`Prop: ${holderName}`, centerX, 27, { align: 'center' });
  doc.text(`UPI: ${upiId}`, centerX, 35, { align: 'center' });
  doc.text(`Ph: +91 ${mobile} | Bank: ${bank}`, centerX, 43, { align: 'center' });

  // Separator Line (Dashed)
  doc.setFont("mono", "normal");
  doc.setFontSize(7);
  doc.text("------------------------------------------", centerX, 52, { align: 'center' });

  // Receipt details
  doc.setFont("Inter", "normal");
  doc.setFontSize(6);
  
  const startY = 62;
  const lineSpacing = 8;
  doc.text(`TXN ID: ${transaction.id}`, 8, startY);
  doc.text(`DATE  : ${formatBillDate(transaction.timestamp)}`, 8, startY + lineSpacing);
  doc.text(`TIME  : ${formatBillTime(transaction.timestamp)}`, 8, startY + lineSpacing * 2);
  doc.text(`CUST  : ${transaction.customerName || 'Walk-in Customer'}`, 8, startY + lineSpacing * 3);

  // Separator Line
  doc.setFont("mono", "normal");
  doc.text("------------------------------------------", centerX, startY + lineSpacing * 4, { align: 'center' });

  // Item description header
  const tableY = startY + lineSpacing * 5;
  doc.setFont("Outfit", "bold");
  doc.setFontSize(6.5);
  doc.text("ITEM DESCRIPTION", 8, tableY);
  doc.text("TOTAL (INR)", width - 8, tableY, { align: 'right' });

  // Item list - simple POS amount checkout
  const itemsY = tableY + 9;
  doc.setFont("Inter", "normal");
  doc.setFontSize(6.5);
  doc.text("POS Quick Billing Amount", 8, itemsY);
  doc.text(formatRupee(transaction.amount, false), width - 8, itemsY, { align: 'right' });

  // Separator
  doc.setFont("mono", "normal");
  doc.text("------------------------------------------", centerX, itemsY + 8, { align: 'center' });

  // Totals Section
  const totalsY = itemsY + 18;
  doc.setFont("Outfit", "bold");
  doc.setFontSize(8);
  doc.text("NET AMOUNT", 8, totalsY);
  doc.setFontSize(9);
  doc.text(formatRupee(transaction.amount), width - 8, totalsY, { align: 'right' });

  // Payment Status Badge
  const statusY = totalsY + 14;
  doc.setFillColor(16, 185, 129); // Success Emerald Green
  doc.rect(8, statusY, width - 16, 14, 'F');
  
  doc.setFont("Outfit", "bold");
  doc.setFontSize(7);
  doc.setTextColor(255, 255, 255);
  doc.text("PAID SUCCESSFUL - UPI", centerX, statusY + 9.5, { align: 'center' });

  // Reset text color
  doc.setTextColor(0, 0, 0);

  // Simulated barcode or verification string
  const footerY = statusY + 28;
  doc.setFont("mono", "normal");
  doc.setFontSize(5);
  // Simulating POS transaction barcodes with characters
  doc.text("|||| | || ||||| ||| || |||| || ||||", centerX, footerY, { align: 'center' });
  doc.setFont("Inter", "normal");
  doc.setFontSize(5.5);
  doc.text(`DIGITAL PAYMENTS POWERED BY BHARATPAY`, centerX, footerY + 8, { align: 'center' });
  doc.setFontSize(5);
  doc.text("Thank you for shopping with us!", centerX, footerY + 14, { align: 'center' });

  // Output format
  if (autoPrint) {
    // Triggers internal PDF printer
    const uri = doc.output('datauristring');
    const iframe = `<iframe width='100%' height='100%' src='${uri}'></iframe>`;
    const x = window.open();
    x.document.open();
    x.document.write(iframe);
    x.document.close();
  } else {
    // Save to machine downloads
    doc.save(`receipt-${transaction.id}.pdf`);
  }
};
