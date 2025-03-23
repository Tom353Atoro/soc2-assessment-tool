// SOC2ReportSender.js
import React, { useState } from 'react';
import emailjs from '@emailjs/browser';
import { generateSOC2PDF } from './SOC2PDFGenerator';

/**
 * Format the HTML content for the email report
 */
const formatReportHTML = (userData, assessmentResults, domainScores) => {
  // Calculate overall score
  const overallScore = domainScores.reduce((sum, domain) => sum + domain.score, 0) / domainScores.length;
  const roundedScore = Math.round(overallScore);
  
  // Determine compliance status based on score
  let complianceStatus = 'Needs Significant Improvement';
  let statusColor = '#d9534f';
  
  if (roundedScore >= 80) {
    complianceStatus = 'Well Prepared';
    statusColor = '#5cb85c';
  } else if (roundedScore >= 60) {
    complianceStatus = 'Partially Prepared';
    statusColor = '#f0ad4e';
  } else if (roundedScore >= 40) {
    complianceStatus = 'Early Stage';
    statusColor = '#f0ad4e';
  }
  
  // Format domain scores for HTML display
  const domainScoresHTML = domainScores.map(domain => {
    let color = '#d9534f';
    if (domain.score >= 80) {
      color = '#5cb85c';
    } else if (domain.score >= 60) {
      color = '#f0ad4e';
    } else if (domain.score >= 40) {
      color = '#f0ad4e';
    }
    
    return `
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd;">${domain.name}</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">
          <span style="color: ${color}; font-weight: bold;">${Math.round(domain.score)}%</span>
        </td>
        <td style="padding: 8px; border: 1px solid #ddd;">${domain.status}</td>
      </tr>
    `;
  }).join('');
  
  // Format key findings
  const strengths = [];
  const gaps = [];
  
  // Process assessment results to find strengths and gaps
  assessmentResults.forEach(result => {
    if (result.score >= 75) {
      strengths.push(result.control);
    } else if (result.score <= 40) {
      gaps.push({ control: result.control, score: result.score });
    }
  });
  
  // Sort gaps by score (ascending)
  gaps.sort((a, b) => a.score - b.score);
  
  // Format strengths and gaps for HTML
  const strengthsHTML = strengths.length > 0 
    ? strengths.slice(0, 5).map(strength => `<li>${strength}</li>`).join('')
    : '<li>No significant strengths identified</li>';
    
  const gapsHTML = gaps.length > 0
    ? gaps.slice(0, 5).map(gap => `<li>${gap.control}</li>`).join('')
    : '<li>No critical gaps identified</li>';
  
  // Construct the complete HTML report
  return `
    <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
      <div style="background-color: #f8f9fa; padding: 20px; margin-bottom: 20px; border-radius: 5px;">
        <h2 style="color: #333; margin-top: 0;">SOC 2 Readiness Assessment Summary</h2>
        <p>This report provides an overview of your organization's readiness for SOC 2 compliance based on your assessment responses.</p>
      </div>
      
      <div style="margin-bottom: 30px;">
        <h3 style="color: #333; border-bottom: 1px solid #ddd; padding-bottom: 10px;">Overall Compliance Status</h3>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <div>
            <p style="font-size: 18px; margin-bottom: 5px;">Overall Score:</p>
            <p style="font-size: 36px; font-weight: bold; color: ${statusColor}; margin: 0;">${roundedScore}%</p>
          </div>
          <div>
            <p style="font-size: 18px; margin-bottom: 5px;">Status:</p>
            <p style="font-size: 24px; font-weight: bold; color: ${statusColor}; margin: 0;">${complianceStatus}</p>
          </div>
        </div>
      </div>
      
      <div style="margin-bottom: 30px;">
        <h3 style="color: #333; border-bottom: 1px solid #ddd; padding-bottom: 10px;">Domain Assessment</h3>
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
          <thead>
            <tr style="background-color: #f2f2f2;">
              <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Control Domain</th>
              <th style="padding: 10px; border: 1px solid #ddd; text-align: center;">Score</th>
              <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${domainScoresHTML}
          </tbody>
        </table>
      </div>
      
      <div style="margin-bottom: 30px;">
        <h3 style="color: #333; border-bottom: 1px solid #ddd; padding-bottom: 10px;">Key Findings</h3>
        
        <div style="margin-bottom: 20px;">
          <h4 style="color: #5cb85c; margin-bottom: 10px;">Strengths</h4>
          <ul style="margin-top: 0;">
            ${strengthsHTML}
          </ul>
        </div>
        
        <div>
          <h4 style="color: #d9534f; margin-bottom: 10px;">Priority Improvement Areas</h4>
          <ul style="margin-top: 0;">
            ${gapsHTML}
          </ul>
        </div>
      </div>
      
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px;">
        <h3 style="color: #333; margin-top: 0;">Next Steps</h3>
        <ol style="margin-bottom: 0;">
          <li>Review the detailed PDF report attached to this email</li>
          <li>Address priority improvement areas</li>
          <li>Develop a remediation plan for identified gaps</li>
          <li>Consider scheduling a consultation with a compliance specialist</li>
        </ol>
      </div>
    </div>
  `;
};

/**
 * Component for sending SOC 2 assessment reports via EmailJS
 */
const SOC2ReportSender = ({ userData, assessmentResults, domainScores }) => {
  const [isSending, setIsSending] = useState(false);
  const [sendStatus, setSendStatus] = useState(null);
  
  const sendAssessmentReport = async () => {
    setIsSending(true);
    setSendStatus(null);
    
    try {
      // Format assessment date
      const assessmentDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      // Generate HTML report content
      const reportHTML = formatReportHTML(userData, assessmentResults, domainScores);
      
      // Generate PDF attachment
      const pdfContent = generateSOC2PDF(userData, assessmentResults, domainScores);
      
      // Prepare EmailJS parameters
      const templateParams = {
        company_name: userData.companyName,
        assessment_date: assessmentDate,
        report_html: reportHTML,
        to_email: userData.email,
        to_name: userData.name,
        pdf_content: pdfContent  // Using the specific parameter name
      };
      
      // Send email using EmailJS
      const response = await emailjs.send(
        'service_91jyjab',  // Service ID
        'template_ija71gr', // Template ID
        templateParams,
        'isnoPyGC5j-uU0cyT' // Public key
      );
      
      console.log('Email sent successfully!', response);
      setSendStatus({ 
        success: true, 
        message: 'Assessment report sent successfully!' 
      });
    } catch (error) {
      console.error('Failed to send email:', error);
      setSendStatus({ 
        success: false, 
        message: `Failed to send report: ${error.text || error.message}` 
      });
    } finally {
      setIsSending(false);
    }
  };
  
  return (
    <div className="soc2-report-sender">
      <div className="sender-header">
        <h2>Assessment Report</h2>
        <p>Your SOC 2 assessment is complete! You can now send the detailed report to your email.</p>
      </div>
      
      <div className="sender-content">
        <div className="recipient-info">
          <h3>Report Recipient</h3>
          <p><strong>Name:</strong> {userData.name}</p>
          <p><strong>Email:</strong> {userData.email}</p>
          <p><strong>Company:</strong> {userData.companyName}</p>
        </div>
        
        <div className="report-summary">
          <h3>Report Summary</h3>
          <p><strong>Total Controls Assessed:</strong> {assessmentResults.length}</p>
          <p><strong>Overall Score:</strong> {Math.round(domainScores.reduce((sum, domain) => sum + domain.score, 0) / domainScores.length)}%</p>
        </div>
      </div>
      
      <div className="sender-actions">
        <button 
          className={`send-report-btn ${isSending ? 'sending' : ''}`}
          onClick={sendAssessmentReport}
          disabled={isSending}
        >
          {isSending ? 'Sending Report...' : 'Send Assessment Report'}
        </button>
        
        {sendStatus && (
          <div className={`send-status ${sendStatus.success ? 'success' : 'error'}`}>
            {sendStatus.message}
          </div>
        )}
      </div>
    </div>
  );
};

export default SOC2ReportSender; 