// SOC2AssessmentProcessor.js
import React, { useState, useEffect } from 'react';
import SOC2ReportSender from './SOC2ReportSender';
import './SOC2AssessmentForm.css';

/**
 * Component that processes SOC 2 assessment responses and calculates scores
 */
const SOC2AssessmentProcessor = ({ assessmentResponses, userData }) => {
  const [processedResults, setProcessedResults] = useState(null);
  const [domainScores, setDomainScores] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Process assessment responses on component mount or when they change
  useEffect(() => {
    if (assessmentResponses && userData) {
      setLoading(true);
      // Process the assessment data
      processAssessment(assessmentResponses);
    }
  }, [assessmentResponses, userData]);
  
  /**
   * Process the assessment responses and calculate domain scores
   */
  const processAssessment = (responses) => {
    // Define SOC 2 domains and their respective controls
    const soc2Domains = {
      securityControls: {
        name: 'Security',
        controls: [
          'Access Control',
          'System Security',
          'Network Security',
          'Endpoint Protection',
          'Encryption',
          'Authentication',
          'Security Monitoring'
        ]
      },
      availabilityControls: {
        name: 'Availability',
        controls: [
          'System Availability',
          'Business Continuity',
          'Disaster Recovery',
          'Incident Management',
          'Performance Monitoring'
        ]
      },
      processingIntegrityControls: {
        name: 'Processing Integrity',
        controls: [
          'Data Accuracy',
          'Data Validation',
          'Error Handling',
          'System Processing',
          'Quality Assurance'
        ]
      },
      confidentialityControls: {
        name: 'Confidentiality',
        controls: [
          'Data Classification',
          'Data Handling',
          'Information Lifecycle',
          'Confidentiality Agreements',
          'Secure Disposal'
        ]
      },
      privacyControls: {
        name: 'Privacy',
        controls: [
          'Privacy Notice',
          'Data Collection',
          'Data Use',
          'Data Disclosure',
          'Data Subject Rights',
          'Data Quality',
          'Privacy Monitoring'
        ]
      }
    };
    
    // Calculate control scores for each domain
    const results = [];
    const domains = [];
    
    Object.keys(soc2Domains).forEach(domainKey => {
      const domain = soc2Domains[domainKey];
      let domainTotal = 0;
      let controlsCount = 0;
      
      // Check each control in this domain
      domain.controls.forEach(control => {
        // Find responses for this control
        const controlResponses = Object.keys(responses)
          .filter(key => key.includes(control.toLowerCase().replace(/\s+/g, '_')))
          .map(key => responses[key]);
        
        if (controlResponses.length > 0) {
          // Calculate control score (0-100)
          const controlScore = calculateControlScore(controlResponses);
          domainTotal += controlScore;
          controlsCount++;
          
          // Add to results
          results.push({
            domain: domain.name,
            control: control,
            score: controlScore,
            responses: controlResponses
          });
        }
      });
      
      // Calculate domain score
      const domainScore = controlsCount > 0 ? domainTotal / controlsCount : 0;
      
      // Determine domain status
      let status = 'Needs Significant Improvement';
      if (domainScore >= 80) {
        status = 'Well Prepared';
      } else if (domainScore >= 60) {
        status = 'Partially Prepared';
      } else if (domainScore >= 40) {
        status = 'Early Stage';
      }
      
      // Add domain score
      domains.push({
        name: domain.name,
        score: domainScore,
        status: status,
        controlsCount: controlsCount
      });
    });
    
    // Sort domains by score (descending)
    domains.sort((a, b) => b.score - a.score);
    
    // Update state with processed results
    setProcessedResults(results);
    setDomainScores(domains);
    setLoading(false);
  };
  
  /**
   * Calculate score for a control based on responses (0-100)
   */
  const calculateControlScore = (responses) => {
    if (!responses || responses.length === 0) return 0;
    
    // Calculate average score across responses
    const totalScore = responses.reduce((sum, response) => {
      // Convert response to numeric score
      let score = 0;
      
      if (typeof response === 'boolean') {
        // For yes/no questions
        score = response ? 100 : 0;
      } else if (typeof response === 'string') {
        // For multiple choice questions
        switch (response.toLowerCase()) {
          case 'implemented':
          case 'complete':
          case 'yes':
          case 'always':
            score = 100;
            break;
          case 'partially implemented':
          case 'in progress':
          case 'sometimes':
            score = 50;
            break;
          case 'planned':
          case 'rarely':
            score = 25;
            break;
          case 'not implemented':
          case 'no':
          case 'never':
            score = 0;
            break;
          default:
            // For scale questions (1-5)
            const numValue = parseInt(response);
            if (!isNaN(numValue) && numValue >= 1 && numValue <= 5) {
              score = (numValue - 1) * 25;
            }
        }
      } else if (typeof response === 'number') {
        // For numeric scale (1-5)
        score = Math.max(0, Math.min(100, (response - 1) * 25));
      }
      
      return sum + score;
    }, 0);
    
    return totalScore / responses.length;
  };
  
  // If still loading, show loading indicator
  if (loading) {
    return (
      <div className="assessment-processing">
        <div className="loading-spinner"></div>
        <h3>Processing Assessment Results...</h3>
      </div>
    );
  }
  
  // Render results and report sender
  return (
    <div className="assessment-results">
      <div className="results-header">
        <h2>SOC 2 Assessment Results</h2>
        <p>Based on your responses, we've analyzed your organization's SOC 2 readiness.</p>
      </div>
      
      <div className="overall-score">
        <h3>Overall Compliance Score</h3>
        <div className="score-display">
          <div className="score-circle">
            {Math.round(domainScores.reduce((sum, domain) => sum + domain.score, 0) / domainScores.length)}%
          </div>
          <div className="score-details">
            <p>Your organization is <strong>
              {domainScores.length > 0 && (() => {
                const avgScore = domainScores.reduce((sum, domain) => sum + domain.score, 0) / domainScores.length;
                if (avgScore >= 80) return 'Well Prepared';
                if (avgScore >= 60) return 'Partially Prepared';
                if (avgScore >= 40) return 'Early Stage';
                return 'Needs Significant Improvement';
              })()}
            </strong> for SOC 2 compliance.</p>
          </div>
        </div>
      </div>
      
      <div className="domain-scores">
        <h3>Domain Scores</h3>
        <div className="domain-scores-grid">
          {domainScores.map((domain, index) => (
            <div 
              key={index}
              className={`domain-score-card ${
                domain.score >= 80 ? 'good' : 
                domain.score >= 60 ? 'moderate' : 
                domain.score >= 40 ? 'fair' : 'poor'
              }`}
            >
              <h4>{domain.name}</h4>
              <div className="domain-score">{Math.round(domain.score)}%</div>
              <div className="domain-status">{domain.status}</div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="key-findings">
        <h3>Key Findings</h3>
        
        <div className="findings-columns">
          <div className="findings-column strengths">
            <h4>Top Strengths</h4>
            <ul>
              {processedResults
                .filter(result => result.score >= 75)
                .sort((a, b) => b.score - a.score)
                .slice(0, 5)
                .map((result, index) => (
                  <li key={index}>
                    <strong>{result.control}:</strong> {Math.round(result.score)}%
                  </li>
                ))}
              {processedResults.filter(result => result.score >= 75).length === 0 && (
                <li className="no-findings">No significant strengths identified</li>
              )}
            </ul>
          </div>
          
          <div className="findings-column gaps">
            <h4>Priority Improvement Areas</h4>
            <ul>
              {processedResults
                .filter(result => result.score <= 40)
                .sort((a, b) => a.score - b.score)
                .slice(0, 5)
                .map((result, index) => (
                  <li key={index}>
                    <strong>{result.control}:</strong> {Math.round(result.score)}%
                  </li>
                ))}
              {processedResults.filter(result => result.score <= 40).length === 0 && (
                <li className="no-findings">No critical gaps identified</li>
              )}
            </ul>
          </div>
        </div>
      </div>
      
      <SOC2ReportSender 
        userData={userData}
        assessmentResults={processedResults}
        domainScores={domainScores}
      />
    </div>
  );
};

export default SOC2AssessmentProcessor; 