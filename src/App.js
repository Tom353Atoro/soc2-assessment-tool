import React from 'react';
import SOC2AssessmentForm from './SOC2AssessmentForm';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>SOC 2 Readiness Assessment</h1>
      </header>
      <main>
        <SOC2AssessmentForm />
      </main>
      <footer>
        <p>© {new Date().getFullYear()} atoro.io - SOC 2 Compliance Solutions</p>
      </footer>
    </div>
  );
}

export default App;
