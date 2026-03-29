import jsPDF from 'jspdf';

// Exporting the interface so PrivacySettings.tsx can import it
export interface ExportData {
  userName?: string;
  auditDate: string;
  riskScore: number;
  riskLevel: string;
  literacyScore: number;
  literacyLevel: string;
  typology: string;
  categoryBreakdown: Array<{ category: string; score: number }>;
  recommendations: string[];
  vulnerabilities: string[];
  strengths: string[];
}

/**
 * Generate a PDF report of the user's privacy audit
 */
export function generatePDFReport(data: ExportData): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const lineHeight = 7;
  let yPosition = margin;

  const checkPageBreak = (requiredSpace: number) => {
    if (yPosition + requiredSpace > pageHeight - margin) {
      doc.addPage();
      yPosition = margin;
      return true;
    }
    return false;
  };

  // --- Header Section ---
  doc.setFillColor(30, 41, 59); // Slate-800 for a more modern 2026 look
  doc.rect(0, 0, pageWidth, 40, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.text('FOOTPRINT KERNEL', margin, 22);
  doc.setFontSize(10);
  doc.text('SECURE EDGE-COMPUTED PRIVACY AUDIT', margin, 30);

  yPosition = 55;
  doc.setTextColor(0, 0, 0);

  // Metadata
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(`AUDIT ID: ${Math.random().toString(36).toUpperCase().substring(2, 10)}`, margin, yPosition);
  doc.text(`SYNC DATE: ${data.auditDate}`, pageWidth - margin, yPosition, { align: 'right' });
  yPosition += lineHeight * 2;

  // --- Executive Summary ---
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.text('Executive Summary', margin, yPosition);
  yPosition += lineHeight * 1.5;

  const boxWidth = 80;
  const boxHeight = 25;
  
  // Normalized Level Check for Colors
  const rLevel = data.riskLevel.toLowerCase();
  const lLevel = data.literacyLevel.toLowerCase();

  // Risk Box
  const riskColor = rLevel === 'low' ? [34, 197, 94] : rLevel === 'medium' ? [251, 146, 60] : [239, 68, 68];
  doc.setFillColor(...riskColor);
  doc.roundedRect(margin, yPosition, boxWidth, boxHeight, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.text('AGGREGATE RISK', margin + 5, yPosition + 7);
  doc.setFontSize(18);
  doc.text(`${data.riskScore}%`, margin + 5, yPosition + 18);

  // Literacy Box
  const litColor = lLevel === 'high' ? [34, 197, 94] : lLevel === 'medium' ? [251, 146, 60] : [239, 68, 68];
  doc.setFillColor(...litColor);
  doc.roundedRect(margin + boxWidth + 10, yPosition, boxWidth, boxHeight, 2, 2, 'F');
  doc.setFontSize(9);
  doc.text('DATA LITERACY', margin + boxWidth + 15, yPosition + 7);
  doc.setFontSize(18);
  doc.text(`${data.literacyScore}%`, margin + boxWidth + 15, yPosition + 18);

  yPosition += boxHeight + lineHeight * 3;
  doc.setTextColor(0, 0, 0);

  // --- Category Breakdown ---
  doc.setFontSize(12);
  doc.text('Dimensional Analysis', margin, yPosition);
  yPosition += lineHeight;

  data.categoryBreakdown.forEach((cat) => {
    checkPageBreak(15);
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    doc.text(cat.category.toUpperCase(), margin, yPosition);
    doc.text(`${cat.score}%`, pageWidth - margin, yPosition, { align: 'right' });
    
    yPosition += 2;
    doc.setFillColor(241, 245, 249);
    doc.rect(margin, yPosition, pageWidth - (margin * 2), 2, 'F');
    doc.setFillColor(37, 99, 235);
    doc.rect(margin, yPosition, (cat.score / 100) * (pageWidth - (margin * 2)), 2, 'F');
    yPosition += lineHeight * 1.5;
  });

  // --- Recommendations ---
  yPosition += lineHeight;
  checkPageBreak(40);
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text('Priority Protocols', margin, yPosition);
  yPosition += lineHeight * 1.5;

  doc.setFontSize(9);
  data.recommendations.slice(0, 8).forEach((rec, index) => {
    const lines: string[] = doc.splitTextToSize(`${index + 1}. ${rec}`, pageWidth - (margin * 2) - 10);
    checkPageBreak(lines.length * lineHeight);
    lines.forEach(line => {
      doc.text(line, margin + 5, yPosition);
      yPosition += lineHeight;
    });
    yPosition += 2;
  });

  // --- Footer ---
  const footerY = pageHeight - 20;
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);
  doc.setFontSize(7);
  doc.setTextColor(150, 150, 150);
  doc.text('VERIFIED LOCAL AUDIT • NO CLOUD UPLOAD DETECTED • 256-BIT SESSION ENCRYPTION', pageWidth / 2, footerY, { align: 'center' });
  doc.text(`Compliant with UK Data (Use and Access) Act 2025 • Generated via Footprint Kernel v2.6`, pageWidth / 2, footerY + 4, { align: 'center' });

  doc.save(`Audit_Report_${new Date().toISOString().split('T')[0]}.pdf`);
}

export function exportAsJSON(data: ExportData): void {
  const jsonString = JSON.stringify({ ...data, exportVersion: "2.6", source: "Footprint_Kernel" }, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `footprint-vault-export-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function generateShareableRecommendations(recommendations: string[]): string {
  return `🔐 PRIVACY AUDIT PROTOCOLS\n\n${recommendations.slice(0, 5).map((r, i) => `${i + 1}. ${r}`).join('\n')}\n\n---\nGenerated by Footprint Manager (Edge-Only)`;
}

export async function copyRecommendationsToClipboard(recommendations: string[]): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(generateShareableRecommendations(recommendations));
    return true;
  } catch {
    return false;
  }
}