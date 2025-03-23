// SOC2AssessmentForm.js
import React, { useState, useEffect } from 'react';
import emailjs from '@emailjs/browser';
import SOC2AssessmentProcessor from './SOC2AssessmentProcessor';
import './SOC2AssessmentForm.css';

// Initialize EmailJS
const initEmailJS = () => {
  emailjs.init({
    publicKey: 'isnoPyGC5j-uU0cyT',
  });
};

/**
 * SOC 2 assessment form component with multiple sections and question types
 */
const SOC2AssessmentForm = () => {
  // Initialize EmailJS on component mount
  useEffect(() => {
    initEmailJS();
  }, []);
  
  // State for user info, current section, and responses
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    companyName: '',
    role: ''
  });
  
  const [currentSection, setCurrentSection] = useState('user-info');
  const [responses, setResponses] = useState({});
  const [progress, setProgress] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // Define assessment sections
  const sections = [
    { id: 'user-info', title: 'Organization Info' },
    { id: 'security', title: 'Security Controls' },
    { id: 'availability', title: 'Availability Controls' },
    { id: 'processing-integrity', title: 'Processing Integrity' },
    { id: 'confidentiality', title: 'Confidentiality Controls' },
    { id: 'privacy', title: 'Privacy Controls' }
  ];
  
  // Define assessment questions by section
  const questions = {
    'security': [
      {
        id: 'access_control_1',
        text: 'Does your organization have a formal access control policy?',
        type: 'choice',
        options: ['Implemented', 'Partially Implemented', 'Planned', 'Not Implemented']
      },
      {
        id: 'access_control_2',
        text: 'How often are user access rights reviewed?',
        type: 'choice',
        options: ['Quarterly', 'Semi-annually', 'Annually', 'Not reviewed']
      },
      {
        id: 'system_security_1',
        text: 'Are security patches applied to systems within 30 days of release?',
        type: 'choice',
        options: ['Always', 'Sometimes', 'Rarely', 'Never']
      },
      {
        id: 'network_security_1',
        text: 'Is network traffic monitored and analyzed for suspicious activity?',
        type: 'choice',
        options: ['Yes', 'Partially', 'Planned', 'No']
      },
      {
        id: 'endpoint_protection_1',
        text: 'Do all endpoints have antivirus/anti-malware solutions installed?',
        type: 'choice',
        options: ['Yes', 'Partially', 'Planned', 'No']
      },
      {
        id: 'encryption_1',
        text: 'Is data encrypted at rest and in transit?',
        type: 'choice',
        options: ['Both', 'In transit only', 'At rest only', 'Neither']
      },
      {
        id: 'authentication_1',
        text: 'Is multi-factor authentication required for critical systems?',
        type: 'choice',
        options: ['Yes', 'Partially', 'Planned', 'No']
      },
      {
        id: 'security_monitoring_1',
        text: 'How comprehensive is your security monitoring program?',
        type: 'scale',
        min: 1,
        max: 5,
        labels: ['Not implemented', 'Basic', 'Moderate', 'Comprehensive', 'Advanced']
      }
    ],
    'availability': [
      {
        id: 'system_availability_1',
        text: 'Do you have defined system availability targets and monitor them?',
        type: 'choice',
        options: ['Yes', 'Partially', 'Planned', 'No']
      },
      {
        id: 'business_continuity_1',
        text: 'Does your organization have a business continuity plan?',
        type: 'choice',
        options: ['Yes', 'In development', 'Planned', 'No']
      },
      {
        id: 'disaster_recovery_1',
        text: 'How often is your disaster recovery plan tested?',
        type: 'choice',
        options: ['Quarterly', 'Semi-annually', 'Annually', 'Not tested']
      },
      {
        id: 'incident_management_1',
        text: 'Do you have a formal incident response process?',
        type: 'choice',
        options: ['Yes', 'Partially', 'Planned', 'No']
      },
      {
        id: 'performance_monitoring_1',
        text: 'How would you rate your system performance monitoring capabilities?',
        type: 'scale',
        min: 1,
        max: 5,
        labels: ['None', 'Basic', 'Moderate', 'Comprehensive', 'Advanced']
      }
    ],
    'processing-integrity': [
      {
        id: 'data_accuracy_1',
        text: 'Are there controls to ensure accurate data processing?',
        type: 'choice',
        options: ['Yes', 'Partially', 'Planned', 'No']
      },
      {
        id: 'data_validation_1',
        text: 'Is input data validated before processing?',
        type: 'choice',
        options: ['Always', 'Sometimes', 'Rarely', 'Never']
      },
      {
        id: 'error_handling_1',
        text: 'Do you have formal error handling procedures?',
        type: 'choice',
        options: ['Yes', 'Partially', 'Planned', 'No']
      },
      {
        id: 'system_processing_1',
        text: 'Are system processing verifications performed?',
        type: 'choice',
        options: ['Yes', 'Partially', 'Planned', 'No']
      },
      {
        id: 'quality_assurance_1',
        text: 'How would you rate your quality assurance program?',
        type: 'scale',
        min: 1,
        max: 5,
        labels: ['Non-existent', 'Basic', 'Moderate', 'Comprehensive', 'Advanced']
      }
    ],
    'confidentiality': [
      {
        id: 'data_classification_1',
        text: 'Do you have a data classification policy?',
        type: 'choice',
        options: ['Yes', 'Partially', 'Planned', 'No']
      },
      {
        id: 'data_handling_1',
        text: 'Are there procedures for handling confidential information?',
        type: 'choice',
        options: ['Yes', 'Partially', 'Planned', 'No']
      },
      {
        id: 'information_lifecycle_1',
        text: 'Is information lifecycle management implemented?',
        type: 'choice',
        options: ['Yes', 'Partially', 'Planned', 'No']
      },
      {
        id: 'confidentiality_agreements_1',
        text: 'Are confidentiality agreements required for employees and vendors?',
        type: 'choice',
        options: ['Yes', 'Partially', 'Planned', 'No']
      },
      {
        id: 'secure_disposal_1',
        text: 'Are secure data disposal procedures implemented?',
        type: 'choice',
        options: ['Yes', 'Partially', 'Planned', 'No']
      }
    ],
    'privacy': [
      {
        id: 'privacy_notice_1',
        text: 'Do you have a privacy notice that is readily available to users?',
        type: 'choice',
        options: ['Yes', 'Partially', 'Planned', 'No']
      },
      {
        id: 'data_collection_1',
        text: 'Is personal data collection limited to what is necessary?',
        type: 'choice',
        options: ['Yes', 'Partially', 'Planned', 'No']
      },
      {
        id: 'data_use_1',
        text: 'Is personal data use limited to purposes specified in the privacy notice?',
        type: 'choice',
        options: ['Yes', 'Partially', 'Planned', 'No']
      },
      {
        id: 'data_disclosure_1',
        text: 'Are personal data disclosures to third parties controlled?',
        type: 'choice',
        options: ['Yes', 'Partially', 'Planned', 'No']
      },
      {
        id: 'data_subject_rights_1',
        text: 'Do you have procedures to honor data subject rights?',
        type: 'choice',
        options: ['Yes', 'Partially', 'Planned', 'No']
      },
      {
        id: 'data_quality_1',
        text: 'Are there controls to ensure personal data quality and accuracy?',
        type: 'choice',
        options: ['Yes', 'Partially', 'Planned', 'No']
      },
      {
        id: 'privacy_monitoring_1',
        text: 'How would you rate your privacy compliance monitoring?',
        type: 'scale',
        min: 1,
        max: 5,
        labels: ['None', 'Basic', 'Moderate', 'Comprehensive', 'Advanced']
      }
    ]
  };
  
  /**
   * Handle user data input changes
   */
  const handleUserDataChange = (e) => {
    const { name, value } = e.target;
    setUserData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };
  
  /**
   * Handle assessment question responses
   */
  const handleResponseChange = (questionId, value) => {
    setResponses(prevResponses => ({
      ...prevResponses,
      [questionId]: value
    }));
  };
  
  /**
   * Navigate to the next section
   */
  const nextSection = () => {
    const currentIndex = sections.findIndex(section => section.id === currentSection);
    if (currentIndex < sections.length - 1) {
      setCurrentSection(sections[currentIndex + 1].id);
      // Update progress
      setProgress(((currentIndex + 1) / (sections.length - 1)) * 100);
    } else {
      // Assessment completed
      setIsSubmitted(true);
    }
  };
  
  /**
   * Navigate to the previous section
   */
  const prevSection = () => {
    const currentIndex = sections.findIndex(section => section.id === currentSection);
    if (currentIndex > 0) {
      setCurrentSection(sections[currentIndex - 1].id);
      // Update progress
      setProgress(((currentIndex - 1) / (sections.length - 1)) * 100);
    }
  };
  
  /**
   * Validate if the current section can proceed
   */
  const canProceed = () => {
    if (currentSection === 'user-info') {
      return userData.name && userData.email && userData.companyName && userData.role;
    }
    
    // For assessment sections, check if all questions have answers
    const sectionQuestions = questions[currentSection] || [];
    return sectionQuestions.every(q => responses[q.id] !== undefined);
  };
  
  /**
   * Render organization info section
   */
  const renderUserInfoSection = () => {
    return (
      <div className="assessment-section user-info-section">
        <h2>Organization Information</h2>
        <p>Please provide details about you and your organization to begin the SOC 2 assessment.</p>
        
        <div className="form-group">
          <label htmlFor="name">Your Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={userData.name}
            onChange={handleUserDataChange}
            placeholder="Enter your full name"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            type="email"
            id="email"
            name="email"
            value={userData.email}
            onChange={handleUserDataChange}
            placeholder="Enter your email address"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="companyName">Company Name</label>
          <input
            type="text"
            id="companyName"
            name="companyName"
            value={userData.companyName}
            onChange={handleUserDataChange}
            placeholder="Enter your company name"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="role">Your Role</label>
          <input
            type="text"
            id="role"
            name="role"
            value={userData.role}
            onChange={handleUserDataChange}
            placeholder="Enter your job title/role"
            required
          />
        </div>
      </div>
    );
  };
  
  /**
   * Render a choice question
   */
  const renderChoiceQuestion = (question) => {
    return (
      <div className="question-content">
        <div className="options-group">
          {question.options.map((option, index) => (
            <div className="option" key={index}>
              <label>
                <input
                  type="radio"
                  name={question.id}
                  value={option}
                  checked={responses[question.id] === option}
                  onChange={() => handleResponseChange(question.id, option)}
                />
                <span>{option}</span>
              </label>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  /**
   * Render a scale question
   */
  const renderScaleQuestion = (question) => {
    return (
      <div className="question-content">
        <div className="scale-labels">
          {question.labels.map((label, index) => (
            <div key={index} className="scale-label">
              {label}
            </div>
          ))}
        </div>
        <div className="scale-options">
          {Array.from({ length: question.max - question.min + 1 }, (_, i) => question.min + i).map(value => (
            <label key={value} className="scale-option">
              <input
                type="radio"
                name={question.id}
                value={value}
                checked={responses[question.id] === value.toString()}
                onChange={() => handleResponseChange(question.id, value.toString())}
              />
              <span>{value}</span>
            </label>
          ))}
        </div>
      </div>
    );
  };
  
  /**
   * Render assessment questions for the current section
   */
  const renderQuestions = () => {
    const sectionQuestions = questions[currentSection] || [];
    
    return (
      <div className="assessment-section questions-section">
        <h2>{sections.find(s => s.id === currentSection)?.title}</h2>
        
        {sectionQuestions.map((question, index) => (
          <div className="question-card" key={index}>
            <div className="question-number">{index + 1}</div>
            <div className="question-text">{question.text}</div>
            
            {question.type === 'choice' && renderChoiceQuestion(question)}
            {question.type === 'scale' && renderScaleQuestion(question)}
          </div>
        ))}
      </div>
    );
  };
  
  /**
   * Render progress bar
   */
  const renderProgressBar = () => {
    return (
      <div className="progress-container">
        <div className="progress-bar">
          <div className="progress-filled" style={{ width: `${progress}%` }}></div>
        </div>
        <div className="progress-sections">
          {sections.map((section, index) => (
            <div 
              key={index}
              className={`progress-section ${currentSection === section.id ? 'active' : ''} ${
                sections.findIndex(s => s.id === currentSection) > index ? 'completed' : ''
              }`}
            >
              {section.title}
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  /**
   * Render navigation buttons
   */
  const renderNavButtons = () => {
    const currentIndex = sections.findIndex(section => section.id === currentSection);
    const isFirstSection = currentIndex === 0;
    const isLastSection = currentIndex === sections.length - 1;
    
    return (
      <div className="nav-buttons">
        {!isFirstSection && (
          <button
            type="button"
            className="prev-button"
            onClick={prevSection}
          >
            Previous
          </button>
        )}
        
        <button
          type="button"
          className="next-button"
          onClick={nextSection}
          disabled={!canProceed()}
        >
          {isLastSection ? 'Complete Assessment' : 'Next'}
        </button>
      </div>
    );
  };
  
  // If assessment is submitted, show the processor component
  if (isSubmitted) {
    return (
      <SOC2AssessmentProcessor
        assessmentResponses={responses}
        userData={userData}
      />
    );
  }
  
  // Render the assessment form
  return (
    <div className="soc2-assessment-form">
      {renderProgressBar()}
      
      <div className="form-container">
        {currentSection === 'user-info' ? renderUserInfoSection() : renderQuestions()}
        
        {renderNavButtons()}
      </div>
    </div>
  );
};

export default SOC2AssessmentForm; 