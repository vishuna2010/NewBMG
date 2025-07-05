import React from 'react';

const DocumentsPage = () => {
  return (
    <div className="page-content">
      <header className="page-header">
        <h1>My Documents</h1>
      </header>
      <p>Access and download your important insurance-related documents.</p>
      {/* Placeholder for document list */}
      <div>
        <h4>Policy Documents:</h4>
        <ul>
          <li>Policy #12345 - Auto Insurance Schedule.pdf <button>Download</button></li>
          <li>Policy #67890 - Home Insurance Certificate.pdf <button>Download</button></li>
        </ul>
        <h4>Claim Documents:</h4>
        <p>(No claim documents uploaded yet)</p>
      </div>
    </div>
  );
};

export default DocumentsPage;
