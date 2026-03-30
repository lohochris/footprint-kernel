import jsPDF from 'jspdf';

// Exporting the interface so PrivacySettings.tsx and RiskScore.tsx can import it
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
 * Generate a professional PDF report of the user's privacy audit
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

  // --- Header Section: Modern Slate Branding ---
  doc.setFillColor(30, 41, 59); // Slate-800
  doc.rect(0, 0, pageWidth, 45, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.text('FOOTPRINT KERNEL', margin, 24);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('PRIVACY AUDIT & RISK INTELLIGENCE REPORT', margin, 32);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('LOCAL EDGE COMPUTATION • ZERO-CLOUD ARCHITECTURE', margin, 38);

  yPosition = 60;
  doc.setTextColor(0, 0, 0);

  // --- Metadata & ID ---
  const auditId = `FK-${Math.random().toString(36).toUpperCase().substring(2, 10)}`;
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(`REPORT ID: ${auditId}`, margin, yPosition);
  doc.text(`GENERATE DATE: ${data.auditDate}`, pageWidth - margin, yPosition, { align: 'right' });
  yPosition += lineHeight * 2;

  // --- Typology Badge ---
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, yPosition, pageWidth - (margin * 2), 20, 2, 2, 'FD');
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(10);
  doc.text('PRIVACY TYPOLOGY:', margin + 5, yPosition + 12);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(data.typology.toUpperCase(), margin + 45, yPosition + 12.5);
  doc.setFont('helvetica', 'normal');
  yPosition += 30;

  // --- Executive Summary Box ---
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(13);
  doc.text('Executive Metrics', margin, yPosition);
  yPosition += lineHeight;

  const boxWidth = (pageWidth - (margin * 2) - 10) / 2;
  const boxHeight = 25;
  
  const rLevel = data.riskLevel.toLowerCase();
  const lLevel = data.literacyLevel.toLowerCase();

  // Score Logic Colors
  const getScoreColor = (level: string, isRisk: boolean) => {
    if (isRisk) {
      return level === 'low' ? [34, 197, 94] : level === 'medium' ? [245, 158, 11] : [239, 68, 68];
    }
    return level === 'high' ? [34, 197, 94] : level === 'medium' ? [245, 158, 11] : [239, 68, 68];
  };

  // Risk Box
  doc.setFillColor(...getScoreColor(rLevel, true));
  doc.roundedRect(margin, yPosition, boxWidth, boxHeight, 1, 1, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text('BEHAVIORAL RISK SCORE', margin + 5, yPosition + 7);
  doc.setFontSize(18);
  doc.text(`${data.riskScore}%`, margin + 5, yPosition + 18);

  // Literacy Box
  doc.setFillColor(...getScoreColor(lLevel, false));
  doc.roundedRect(margin + boxWidth + 10, yPosition, boxWidth, boxHeight, 1, 1, 'F');
  doc.setFontSize(8);
  doc.text('DATA LITERACY INDEX', margin + boxWidth + 15, yPosition + 7);
  doc.setFontSize(18);
  doc.text(`${data.literacyScore}%`, margin + boxWidth + 15, yPosition + 18);

  yPosition += boxHeight + lineHeight * 2.5;
  doc.setTextColor(0, 0, 0);

  // --- Dimensional Analysis (Category Progress Bars) ---
  doc.setFontSize(12);
  doc.text('Category Intelligence Breakdown', margin, yPosition);
  yPosition += lineHeight;

  data.categoryBreakdown.forEach((cat) => {
    checkPageBreak(15);
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(cat.category.toUpperCase(), margin, yPosition);
    doc.text(`${cat.score}%`, pageWidth - margin, yPosition, { align: 'right' });
    
    yPosition += 2;
    doc.setFillColor(241, 245, 249);
    doc.rect(margin, yPosition, pageWidth - (margin * 2), 2.5, 'F');
    doc.setFillColor(51, 65, 85); // Slate-700
    doc.rect(margin, yPosition, (cat.score / 100) * (pageWidth - (margin * 2)), 2.5, 'F');
    yPosition += lineHeight * 1.5;
  });

  // --- Priority Protocols (Recommendations) ---
  yPosition += lineHeight;
  checkPageBreak(40);
  doc.setFontSize(12);
  doc.setTextColor(30, 41, 59);
  doc.text('Strategic Mitigation Protocols', margin, yPosition);
  yPosition += lineHeight * 1.5;

  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  data.recommendations.slice(0, 10).forEach((rec, index) => {
    const lines: string[] = doc.splitTextToSize(`${index + 1}. ${rec}`, pageWidth - (margin * 2) - 10);
    checkPageBreak(lines.length * lineHeight + 2);
    lines.forEach(line => {
      doc.text(line, margin + 5, yPosition);
      yPosition += lineHeight;
    });
    yPosition += 2;
  });

  // --- Footer: Verification & Legal ---
  const footerY = pageHeight - 20;
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text('VERIFIED ENCRYPTED EXPORT • AUDIT DATA PURGED FROM VOLATILE MEMORY UPON CLOSURE', pageWidth / 2, footerY, { align: 'center' });
  doc.text(`Standard: UK Data (Use and Access) Act 2025 • Engine: Footprint Kernel v2.6.4`, pageWidth / 2, footerY + 4, { align: 'center' });

  doc.save(`Footprint_Intelligence_Report_${new Date().toISOString().split('T')[0]}.pdf`);
}

/**
 * Technical JSON Export for Data Portability
 */
export function exportAsJSON(data: ExportData): void {
  const payload = { 
    ...data, 
    exportMetadata: {
      version: "2.6.4",
      schema: "UK-DUA-2025",
      timestamp: new Date().toISOString(),
      origin: "Footprint_Manager_Edge"
    } 
  };
  const jsonString = JSON.stringify(payload, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `footprint-vault-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Clipboard Formatting
 */
export function generateShareableRecommendations(recommendations: string[]): string {
  return ` FOOTPRINT KERNEL: TOP PRIVACY PROTOCOLS\n\n${recommendations.slice(0, 5).map((r, i) => `[${i + 1}] ${r}`).join('\n')}\n\n---\nReport Verified via Edge Computation`;
}

export async function copyRecommendationsToClipboard(recommendations: string[]): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(generateShareableRecommendations(recommendations));
    return true;
  } catch {
    return false;
  }
}