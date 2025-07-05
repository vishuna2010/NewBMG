import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  getClaimById,
  updateClaimStatus,
  assignClaimToAdjuster,
  addClaimNote,
  addClaimAttachment,
  deleteClaimAttachment // <-- Import this
} from '../services/claimService';
import { getAllUsers } from '../services/userService'; // To fetch list of potential adjusters

const ClaimDetailPage = () => {
  const { id: claimId } = useParams();
  // const navigate = useNavigate(); // For programmatic navigation if needed later

  const [claim, setClaim] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // For editing status
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusUpdateNote, setStatusUpdateNote] = useState('');
  const [submittingStatus, setSubmittingStatus] = useState(false);

  // For assigning adjuster
  const [isAssigningAdjuster, setIsAssigningAdjuster] = useState(false);
  const [adjusterId, setAdjusterId] = useState('');
  const [assignmentNote, setAssignmentNote] = useState('');
  const [potentialAdjusters, setPotentialAdjusters] = useState([]);
  const [submittingAssignment, setSubmittingAssignment] = useState(false);

  // For adding notes
  const [newNote, setNewNote] = useState('');
  const [submittingNote, setSubmittingNote] = useState(false);

  // For adding attachments (conceptual: assumes URL is provided)
  const [attachmentFile, setAttachmentFile] = useState(null);
  const [attachmentDescription, setAttachmentDescription] = useState('');
  const [submittingAttachment, setSubmittingAttachment] = useState(false);
  const [submittingAttachmentDelete, setSubmittingAttachmentDelete] = useState(null); // Stores ID of attachment being deleted


  const claimStatuses = ['Open', 'UnderReview', 'InformationRequested', 'Approved', 'PartiallyApproved', 'Rejected', 'Closed', 'Paid', 'Withdrawn'];

  const fetchClaimDetails = useCallback(async () => {
    if (!claimId) {
      setError("No claim ID provided.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await getClaimById(claimId);
      if (response.success && response.data) {
        setClaim(response.data);
        setNewStatus(response.data.status);
      } else {
        setError(response.error || 'Claim not found.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [claimId]);

  const fetchPotentialAdjusters = useCallback(async () => {
    try {
        // Fetch users who could be adjusters (e.g., roles 'agent', 'staff', 'admin')
        const response = await getAllUsers({ roles: ['agent', 'staff', 'admin'].join(',') }); // Assuming backend supports roles query
        if (response.success && response.data) {
            setPotentialAdjusters(response.data);
        }
    } catch (err) {
        console.error("Failed to fetch potential adjusters:", err);
        // Non-critical error, form can still work with manual ID input
    }
  }, []);


  useEffect(() => {
    fetchClaimDetails();
    fetchPotentialAdjusters();
  }, [fetchClaimDetails, fetchPotentialAdjusters]);

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    if (!newStatus || newStatus === claim.status) {
      setIsEditingStatus(false);
      return;
    }
    setSubmittingStatus(true);
    setError(null);
    try {
      const updatedClaimData = await updateClaimStatus(claimId, { status: newStatus, note: statusUpdateNote });
      setClaim(updatedClaimData.data);
      setIsEditingStatus(false);
      setStatusUpdateNote('');
      alert('Claim status updated successfully!');
    } catch (err) {
      setError(err.message);
      alert(`Error updating status: ${err.message}`);
    } finally {
      setSubmittingStatus(false);
    }
  };

  const handleDeleteAttachment = async (attachmentIdToDel) => {
    if (!attachmentIdToDel) {
        alert("Attachment ID is missing.");
        return;
    }
    if (window.confirm('Are you sure you want to delete this attachment?')) {
        setSubmittingAttachmentDelete(attachmentIdToDel);
        setError(null);
        try {
            await deleteClaimAttachment(claimId, attachmentIdToDel);
            alert('Attachment deleted successfully!');
            fetchClaimDetails(); // Refresh to update the attachment list
        } catch (err) {
            setError(err.message);
            alert(`Failed to delete attachment: ${err.message}`);
        } finally {
            setSubmittingAttachmentDelete(null);
        }
    }
  };

  const handleAssignAdjuster = async (e) => {
    e.preventDefault();
    if (!adjusterId) {
        alert("Please select an adjuster.");
        return;
    }
    setSubmittingAssignment(true);
    setError(null);
    try {
        const updatedClaimData = await assignClaimToAdjuster(claimId, { adjusterId, note: assignmentNote });
        setClaim(updatedClaimData.data); // Backend should return populated adjuster
        setIsAssigningAdjuster(false);
        setAssignmentNote('');
        setAdjusterId('');
        alert('Adjuster assigned successfully!');
    } catch (err) {
        setError(err.message);
        alert(`Error assigning adjuster: ${err.message}`);
    } finally {
        setSubmittingAssignment(false);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) {
        alert("Note cannot be empty.");
        return;
    }
    setSubmittingNote(true);
    setError(null);
    try {
        // Assuming backend uses logged-in user as author
        const response = await addClaimNote(claimId, { note: newNote });
        // The response from addClaimNote in controller returns all notes.
        // So, we might need to refetch or expect the updated claim object.
        // For simplicity, refetching the claim to get all updated notes with populated authors.
        fetchClaimDetails();
        setNewNote('');
        alert('Note added successfully!');
    } catch (err) {
        setError(err.message);
        alert(`Error adding note: ${err.message}`);
    } finally {
        setSubmittingNote(false);
    }
  };

  const handleFileChange = (e) => {
    setAttachmentFile(e.target.files[0]);
  };

  const handleAddAttachment = async (e) => {
    e.preventDefault();
    if (!attachmentFile) {
      alert("Please select a file to upload.");
      return;
    }
    setSubmittingAttachment(true);
    setError(null);
    try {
      // The service function `addClaimAttachment` now expects a File object
      await addClaimAttachment(claimId, attachmentFile, attachmentDescription);
      alert('Attachment uploaded successfully!');
      setAttachmentFile(null); // Clear the file input
      setAttachmentDescription(''); // Clear description
      document.getElementById('attachment-file-input').value = null; // Reset file input visually
      fetchClaimDetails(); // Refresh claim details to show new attachment
    } catch (err) {
      setError(err.message);
      alert(`Error uploading attachment: ${err.message}`);
    } finally {
      setSubmittingAttachment(false);
    }
  };

  if (loading) return <p>Loading claim details...</p>;
  if (error && !claim) return <p style={{ color: 'red' }}>Error: {error}</p>;
  if (!claim) return <p>Claim not found.</p>;

  const detailItemStyle = { marginBottom: '10px', lineHeight: '1.6' };
  const labelStyle = { fontWeight: 'bold', marginRight: '5px', color: '#555' };
  const sectionStyle = { marginBottom: '25px', paddingBottom: '15px', borderBottom: '1px solid #eee'};

  return (
    <div>
      <h1 className="page-title">Claim Details: {claim.claimNumber}</h1>
      <Link to="/admin/claims" style={{display: 'inline-block', marginBottom: '20px'}}>&larr; Back to Claims List</Link>

      {error && <p style={{color: 'red', border: '1px solid red', padding: '10px', marginBottom: '10px'}}>Error: {error}</p>}

      <div className="content-wrapper">
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
          <div> {/* Left Column */}
            <section style={sectionStyle}>
              <h3>Core Information</h3>
              <div style={detailItemStyle}><span style={labelStyle}>Claim Number:</span> {claim.claimNumber}</div>
              <div style={detailItemStyle}>
                <span style={labelStyle}>Status:</span> {claim.status}
                {!isEditingStatus ? (
                  <button onClick={() => { setNewStatus(claim.status); setIsEditingStatus(true); }} style={{ marginLeft: '10px', fontSize: '0.8em' }}>Change Status</button>
                ) : (
                  <form onSubmit={handleStatusUpdate} style={{ display: 'inline-block', marginLeft: '10px', fontSize: '0.9em' }}>
                    <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} style={{marginRight: '5px', padding: '3px'}}>
                      {claimStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <input type="text" value={statusUpdateNote} onChange={(e) => setStatusUpdateNote(e.target.value)} placeholder="Optional note for status change" style={{marginRight: '5px', padding: '3px', fontSize: '0.9em', width: '200px'}}/>
                    <button type="submit" disabled={submittingStatus} style={{fontSize: '0.9em', padding: '3px 6px'}}>{submittingStatus ? 'Saving...' : 'Save'}</button>
                    <button type="button" onClick={() => setIsEditingStatus(false)} style={{marginLeft: '5px', fontSize: '0.9em', padding: '3px 6px'}}>Cancel</button>
                  </form>
                )}
              </div>
              <div style={detailItemStyle}><span style={labelStyle}>Date of Loss:</span> {new Date(claim.dateOfLoss).toLocaleDateString()}</div>
              <div style={detailItemStyle}><span style={labelStyle}>Reported Date:</span> {new Date(claim.reportedDate).toLocaleString()}</div>
              <div style={detailItemStyle}><span style={labelStyle}>Description:</span> {claim.descriptionOfLoss}</div>
            </section>

            <section style={sectionStyle}>
                <h3>Financials</h3>
                <div style={detailItemStyle}><span style={labelStyle}>Estimated Loss:</span> {claim.estimatedLossAmount ?? 'N/A'} {claim.currency}</div>
                <div style={detailItemStyle}><span style={labelStyle}>Approved Amount:</span> {claim.approvedAmount ?? 'N/A'} {claim.currency}</div>
                <div style={detailItemStyle}><span style={labelStyle}>Paid Amount:</span> {claim.paidAmount ?? 'N/A'} {claim.currency}</div>
            </section>

            <section style={sectionStyle}>
              <h3>Policy Information</h3>
              {claim.policy ? (
                <>
                  <div style={detailItemStyle}><span style={labelStyle}>Policy #:</span> <Link to={`/admin/policies/${claim.policy._id}`}>{claim.policy.policyNumber}</Link></div>
                  {/* Further policy details can be shown or linked */}
                </>
              ) : <p>Policy details not available.</p>}
            </section>

            <section style={sectionStyle}>
              <h3>Customer Information</h3>
              {claim.customer ? (
                <>
                  <div style={detailItemStyle}><span style={labelStyle}>Name:</span> {claim.customer.firstName} {claim.customer.lastName}</div>
                  <div style={detailItemStyle}><span style={labelStyle}>Email:</span> {claim.customer.email}</div>
                  {/* Link to customer: <Link to={`/admin/users/edit/${claim.customer._id}`}>View Customer</Link> */}
                </>
              ) : <p>Customer details not available.</p>}
            </section>

             <section style={sectionStyle}>
              <h3>Product Information</h3>
              {claim.product ? (
                <>
                  <div style={detailItemStyle}><span style={labelStyle}>Name:</span> {claim.product.name}</div>
                  <div style={detailItemStyle}><span style={labelStyle}>Type:</span> {claim.product.productType}</div>
                </>
              ) : <p>Product details not available.</p>}
            </section>
          </div>

          <div> {/* Right Column */}
            <section style={sectionStyle}>
                <h3>Assigned Adjuster</h3>
                {claim.adjuster ? (
                    <div>{claim.adjuster.firstName} {claim.adjuster.lastName} ({claim.adjuster.email})</div>
                ) : (
                    <div>Unassigned</div>
                )}
                {!isAssigningAdjuster ? (
                    <button onClick={() => setIsAssigningAdjuster(true)} style={{marginTop: '5px', fontSize: '0.8em'}}>Assign/Reassign Adjuster</button>
                ) : (
                    <form onSubmit={handleAssignAdjuster} style={{ marginTop: '10px', fontSize: '0.9em', border: '1px solid #ccc', padding: '10px', borderRadius: '4px' }}>
                        <label htmlFor="adjusterId" style={labelStyle}>Select Adjuster:</label>
                        <select id="adjusterId" value={adjusterId} onChange={(e) => setAdjusterId(e.target.value)} required style={{width: '100%', padding: '5px', marginBottom: '5px'}}>
                            <option value="">-- Select Adjuster --</option>
                            {potentialAdjusters.map(adj => (
                                <option key={adj._id} value={adj._id}>{adj.firstName} {adj.lastName} ({adj.role})</option>
                            ))}
                        </select>
                        <input type="text" value={assignmentNote} onChange={(e) => setAssignmentNote(e.target.value)} placeholder="Optional note for assignment" style={{width: '100%', padding: '5px', marginBottom: '5px', fontSize: '0.9em'}}/>
                        <button type="submit" disabled={submittingAssignment} style={{fontSize: '0.9em', padding: '3px 6px'}}>{submittingAssignment ? 'Assigning...' : 'Assign'}</button>
                        <button type="button" onClick={() => setIsAssigningAdjuster(false)} style={{marginLeft: '5px', fontSize: '0.9em', padding: '3px 6px'}}>Cancel</button>
                    </form>
                )}
            </section>

            <section style={sectionStyle}>
              <h3>Attachments</h3>
              {claim.attachments && claim.attachments.length > 0 ? (
                <ul style={{listStyle: 'none', paddingLeft: 0}}>
                  {claim.attachments.map((doc) => ( // Use doc._id if available and unique, otherwise fileUrl
                    <li key={doc._id || doc.fileUrl} style={{border: '1px solid #eee', padding: '10px', marginBottom: '5px', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                      <div>
                        <strong>{doc.fileName}</strong> {doc.description ? `(${doc.description})` : ''}
                        <br />
                        <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" style={{fontSize: '0.9em', color: '#007bff'}}>View/Download</a>
                      </div>
                      <button
                        onClick={() => handleDeleteAttachment(doc._id)} // Assuming doc._id is the attachment's ID in the array
                        style={{color: 'red', background: 'none', border: '1px solid red', padding: '3px 8px', cursor: 'pointer', fontSize: '0.8em', borderRadius: '3px'}}
                        disabled={submittingAttachmentDelete === doc._id} // Disable specific button during its delete operation
                      >
                        {submittingAttachmentDelete === doc._id ? 'Deleting...' : 'Delete'}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : <p>No documents uploaded for this claim yet.</p>}

              <form onSubmit={handleAddAttachment} style={{ marginTop: '15px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
                <h4>Upload New Attachment</h4>
                <div>
                  <label htmlFor="attachmentFile" style={labelStyle}>File:</label>
                  <input type="file" id="attachment-file-input" name="attachmentFile" onChange={handleFileChange} required style={{display: 'block', marginBottom: '10px'}}/>
                </div>
                <div>
                  <label htmlFor="attachmentDescription" style={labelStyle}>Description (optional):</label>
                  <input
                    type="text"
                    id="attachmentDescription"
                    name="attachmentDescription"
                    value={attachmentDescription}
                    onChange={(e) => setAttachmentDescription(e.target.value)}
                    style={{width: 'calc(100% - 12px)', padding: '5px', marginBottom: '10px', border: '1px solid #ccc', borderRadius: '4px'}}
                  />
                </div>
                <button type="submit" disabled={submittingAttachment || !attachmentFile} style={{fontSize: '0.9em', padding: '5px 10px'}}>
                  {submittingAttachment ? 'Uploading...' : 'Upload Attachment'}
                </button>
              </form>
            </section>

            <section>
                <h3>Notes Log</h3>
                 <form onSubmit={handleAddNote} style={{ marginBottom: '15px' }}>
                    <textarea
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        placeholder="Add a new note..."
                        required
                        style={{width: 'calc(100% - 12px)', minHeight: '60px', padding: '5px', marginBottom: '5px', border: '1px solid #ccc', borderRadius: '4px'}}
                    />
                    <button type="submit" disabled={submittingNote} style={{fontSize: '0.9em', padding: '5px 10px'}}>{submittingNote ? 'Adding Note...' : 'Add Note'}</button>
                </form>
                {claim.notes && claim.notes.length > 0 ? (
                    [...claim.notes].reverse().map((note, index) => ( // Display newest first
                    <div key={index} style={{borderBottom: '1px dashed #eee', paddingBottom: '8px', marginBottom: '8px'}}>
                        <p style={{margin: '0 0 5px 0'}}>{note.note}</p>
                        <small style={{color: '#777'}}>
                        By: {note.authorName || (note.author ? `${note.author.firstName} ${note.author.lastName}` : 'Unknown')} on {new Date(note.createdAt).toLocaleString()}
                        </small>
                    </div>
                    ))
                ) : <p>No notes for this claim yet.</p>}
            </section>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ClaimDetailPage;
