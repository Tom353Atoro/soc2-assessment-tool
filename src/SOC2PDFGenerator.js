// SOC2PDFGenerator.js
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

/**
 * Generate a SOC 2 assessment report PDF and return it as base64
 * Optimized to keep file size under 2MB
 */
export const generateSOC2PDF = (userData, assessmentResults, domainScores) => {
  // Create new PDF document with compression enabled
  const doc = new jsPDF({
    compress: true,
    unit: 'pt',
    format: 'a4'
  });
  
  // Add document title
  doc.setFontSize(20);
  doc.setTextColor(0, 0, 102);
  doc.text('SOC 2 Readiness Assessment Report', 40, 40);
  
  // Add company info
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text(`Organization: ${userData.companyName}`, 40, 70);
  doc.text(`Prepared for: ${userData.name} (${userData.role})`, 40, 90);
  doc.text(`Assessment Date: ${new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long', 
    day: 'numeric'
  })}`, 40, 110);
  
  // Add summary section
  const overallScore = domainScores.reduce((sum, domain) => sum + domain.score, 0) / domainScores.length;
  doc.setFontSize(16);
  doc.text('Executive Summary', 40, 150);
  doc.setFontSize(12);
  doc.text(`Overall Compliance Score: ${Math.round(overallScore)}%`, 40, 180);
  
  // Add compliance status indicator
  let complianceStatus = 'Needs Significant Improvement';
  if (overallScore >= 80) {
    complianceStatus = 'Well Prepared';
  } else if (overallScore >= 60) {
    complianceStatus = 'Partially Prepared';
  } else if (overallScore >= 40) {
    complianceStatus = 'Early Stage';
  }
  doc.text(`Compliance Status: ${complianceStatus}`, 40, 200);
  
  // Add domain scores table
  doc.setFontSize(16);
  doc.text('Domain Assessment Scores', 40, 240);
  
  const domainData = domainScores.map(domain => [
    domain.name,
    `${Math.round(domain.score)}%`,
    domain.status
  ]);
  
  doc.autoTable({
    startY: 260,
    head: [['Control Domain', 'Score', 'Status']],
    body: domainData,
    theme: 'grid',
    headStyles: { fillColor: [0, 51, 102] },
    columnStyles: {
      0: { cellWidth: 200 },
      1: { cellWidth: 100, halign: 'center' },
      2: { cellWidth: 200 }
    }
  });
  
  // Add key findings section
  const topY = doc.lastAutoTable.finalY + 30;
  doc.setFontSize(16);
  doc.text('Key Findings & Recommendations', 40, topY);
  
  // Format assessment results into strengths and gaps
  const strengths = [];
  const gaps = [];
  
  // Process assessment results
  assessmentResults.forEach(result => {
    if (result.score >= 75) {
      strengths.push(result.control);
    } else if (result.score <= 40) {
      gaps.push({ control: result.control, score: result.score });
    }
  });
  
  // Sort gaps by score (ascending)
  gaps.sort((a, b) => a.score - b.score);
  
  // Add strengths
  doc.setFontSize(14);
  doc.setTextColor(0, 102, 0);
  doc.text('Strengths:', 40, topY + 30);
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  
  strengths.slice(0, 5).forEach((strength, index) => {
    doc.text(`• ${strength}`, 50, topY + 60 + (index * 20));
  });
  
  // Add prioritized gaps
  doc.setFontSize(14);
  doc.setTextColor(153, 0, 0);
  doc.text('Priority Improvement Areas:', 40, topY + 180);
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  
  gaps.slice(0, 5).forEach((gap, index) => {
    doc.text(`• ${gap.control}`, 50, topY + 210 + (index * 20));
  });
  
  // Add next steps section
  const nextStepsY = topY + 330;
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 102);
  doc.text('Recommended Next Steps', 40, nextStepsY);
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text('1. Address priority improvement areas', 50, nextStepsY + 30);
  doc.text('2. Develop remediation plan for identified gaps', 50, nextStepsY + 50);
  doc.text('3. Schedule regular compliance reviews', 50, nextStepsY + 70);
  doc.text('4. Consider engaging with a compliance specialist', 50, nextStepsY + 90);
  
  // Add footer with timestamp
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Report generated: ${new Date().toISOString().split('T')[0]} | Page ${i} of ${pageCount}`, 40, doc.internal.pageSize.height - 20);
  }
  
  // Get base64 output
  const pdfOutput = doc.output('datauristring');
  const base64Data = pdfOutput.split(',')[1];
  
  // Check file size (base64 is roughly 4/3 the size of the binary data)
  const estimatedSize = Math.ceil((base64Data.length * 3) / 4);
  const sizeInMB = estimatedSize / (1024 * 1024);
  
  if (sizeInMB > 1.9) {
    console.warn(`PDF size (${sizeInMB.toFixed(2)}MB) is approaching the 2MB limit.`);
    // Could implement size reduction strategies here if needed
  }
  
  return base64Data;
}; 