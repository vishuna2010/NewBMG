const Claim = require('../models/Claim');
const Policy = require('../models/Policy');
// const { uploadFileToS3, getSignedUrl, deleteFileFromS3 } = require('../utils/s3Handler'); // Placeholder for S3 utility
// const multer = require('multer'); // For handling multipart/form-data (file uploads)
// const path = require('path');

// --- File Upload Configuration (Conceptual - using Multer for local storage as placeholder) ---
// This would be more complex with direct S3 uploads or a dedicated file handling service.
// For now, we'll assume file URLs are provided directly or handled by a simplified mechanism.
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, 'uploads/claims/'); // Make sure this directory exists
//   },
//   filename: function (req, file, cb) {
//     cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
//   }
// });
// const upload = multer({ storage: storage, limits: { fileSize: 5 * 1024 * 1024 /* 5MB */ } }).array('attachments', 5); // Example: up to 5 files, field name 'attachments'


// @desc    Log a new claim (FNOL - First Notice of Loss)
// @route   POST /api/v1/claims
// @access  Private (Customer, Agent) - TODO: Add auth middleware
exports.logNewClaim = async (req, res, next) => {
  // For file uploads, you'd typically use multer or similar middleware before this controller action.
  // The middleware would populate req.files.
  // For now, we'll assume attachment URLs might be passed in the body if files are uploaded elsewhere first,
  // or we'll just create the claim without attachments initially and add them via another endpoint.

  const { policyId, dateOfLoss, descriptionOfLoss, estimatedLossAmount, currency, initialAttachments } = req.body;

  if (!policyId || !dateOfLoss || !descriptionOfLoss) {
    return res.status(400).json({ success: false, error: 'Please provide policyId, dateOfLoss, and descriptionOfLoss' });
  }

  try {
    const policy = await Policy.findById(policyId).populate('customer').populate('product');
    if (!policy) {
      return res.status(404).json({ success: false, error: `Policy not found with id ${policyId}` });
    }

    // TODO: Verify that the person reporting the claim is authorized for this policy (e.g., policyholder)

    const claimData = {
      policy: policy._id,
      customer: policy.customer._id, // Denormalize customer ID
      product: policy.product._id,   // Denormalize product ID for context
      dateOfLoss,
      descriptionOfLoss,
      status: 'Open', // Initial status
      estimatedLossAmount,
      currency: currency || policy.premiumCurrency || 'USD',
      attachments: [], // Will be populated below if initialAttachments are provided or via S3 logic
      notes: [{ // Initial note
        note: `Claim reported by customer (or system). Description: ${descriptionOfLoss}`,
        // author: req.user.id, // If authenticated user
        authorName: policy.customer.firstName ? `${policy.customer.firstName} ${policy.customer.lastName}` : 'System/Customer', // Placeholder
      }]
    };

    // --- Placeholder for S3 Attachment Logic ---
    // if (req.files && req.files.length > 0) { // If using multer and files are uploaded
    //   for (const file of req.files) {
    //     // const s3Data = await uploadFileToS3(file.path, file.filename, file.mimetype); // Example
    //     // claimData.attachments.push({ fileName: file.originalname, fileUrl: s3Data.Location, fileType: file.mimetype });
    //     // fs.unlinkSync(file.path); // Clean up local file if multer saves it temporarily
    //      claimData.attachments.push({ fileName: file.originalname, fileUrl: `/uploads/claims/${file.filename}`, fileType: file.mimetype }); // Local placeholder
    //   }
    // } else
    if (initialAttachments && Array.isArray(initialAttachments)) { // If URLs are provided directly
        initialAttachments.forEach(att => {
            if(att.fileName && att.fileUrl) {
                claimData.attachments.push({
                    fileName: att.fileName,
                    fileUrl: att.fileUrl,
                    fileType: att.fileType || 'application/octet-stream',
                    description: att.description || ''
                });
            }
        });
    }
    // --- End Placeholder ---

    const newClaim = await Claim.create(claimData);

    res.status(201).json({
      success: true,
      data: newClaim,
    });

  } catch (error) {
    if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(val => val.message);
        return res.status(400).json({ success: false, error: messages });
    }
    console.error("Log New Claim Error:", error);
    res.status(500).json({ success: false, error: error.message || 'Server Error logging claim' });
  }
};


// @desc    Get all claims (with filtering)
// @route   GET /api/v1/claims
// @access  Private (Admin, Agent, or Customer for their own) - TODO: Add auth & filtering
exports.getAllClaims = async (req, res, next) => {
  try {
    let query = Claim.find();

    // TODO: Based on user role (req.user from auth middleware):
    // if (req.user.role === 'customer') query = query.where('customer').equals(req.user.id);
    // else if (req.user.role === 'agent') query = query.where('adjuster').equals(req.user.id); // Or based on policies they manage

    // Example basic filtering from query params
    if (req.query.status) query = query.where('status').equals(req.query.status);
    if (req.query.policyId) query = query.where('policy').equals(req.query.policyId);
    if (req.query.customerId) query = query.where('customer').equals(req.query.customerId);


    query = query.populate('policy', 'policyNumber')
                 .populate('customer', 'firstName lastName email')
                 .populate('product', 'name productType')
                 .populate('adjuster', 'firstName lastName'); // Assuming User model has firstName, lastName

    const claims = await query.sort({ reportedDate: -1 }); // Sort by most recent

    res.status(200).json({
      success: true,
      count: claims.length,
      data: claims,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message || 'Server Error' });
  }
};

// @desc    Get a single claim by ID
// @route   GET /api/v1/claims/:id
// @access  Private - TODO: Add auth (owner, adjuster, admin)
exports.getClaimById = async (req, res, next) => {
  try {
    const claim = await Claim.findById(req.params.id)
      .populate('policy')
      .populate('customer')
      .populate('product')
      .populate('adjuster', 'firstName lastName email')
      .populate('notes.author', 'firstName lastName');


    if (!claim) {
      return res.status(404).json({ success: false, error: `Claim not found with id ${req.params.id}` });
    }
    // TODO: Authorization check
    res.status(200).json({ success: true, data: claim });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ success: false, error: `Claim not found with id ${req.params.id}` });
    }
    res.status(500).json({ success: false, error: error.message || 'Server Error' });
  }
};

// @desc    Update claim status
// @route   PUT /api/v1/claims/:id/status
// @access  Private (Admin, Adjuster) - TODO: Add auth
exports.updateClaimStatus = async (req, res, next) => {
  try {
    const { status, note, authorName } = req.body; // authorName for now, should be req.user
    if (!status) {
      return res.status(400).json({ success: false, error: 'Status is required' });
    }

    const claim = await Claim.findById(req.params.id);
    if (!claim) {
      return res.status(404).json({ success: false, error: `Claim not found with id ${req.params.id}` });
    }

    // TODO: Add more sophisticated status transition logic if needed
    const oldStatus = claim.status;
    claim.status = status;

    if (note) {
        claim.notes.push({
            note: `Status changed from ${oldStatus} to ${status}. ${note}`,
            // author: req.user.id,
            authorName: authorName || 'System Update'
        });
    } else {
         claim.notes.push({
            note: `Status changed from ${oldStatus} to ${status}.`,
            // author: req.user.id,
            authorName: authorName || 'System Update'
        });
    }

    // If status is 'Approved' or 'Paid', update relevant amount fields
    if (status === 'Approved' && req.body.approvedAmount !== undefined) {
        claim.approvedAmount = req.body.approvedAmount;
        if (req.body.currency) claim.currency = req.body.currency; // Update currency if provided
    }
    if (status === 'Paid' && req.body.paidAmount !== undefined) {
        claim.paidAmount = req.body.paidAmount;
        // Could also set a paymentDate field here
    }


    await claim.save();
    res.status(200).json({ success: true, data: claim });
  } catch (error) { /* ... error handling (similar to other updates) ... */ }
};

// @desc    Assign an adjuster to a claim
// @route   PUT /api/v1/claims/:id/assign
// @access  Private (Admin) - TODO: Add auth
exports.assignClaimToAdjuster = async (req, res, next) => {
  try {
    const { adjusterId, note, authorName } = req.body; // authorName for now, should be req.user
    if (!adjusterId) {
      return res.status(400).json({ success: false, error: 'Adjuster ID is required' });
    }

    const claim = await Claim.findById(req.params.id);
    if (!claim) {
      return res.status(404).json({ success: false, error: `Claim not found with id ${req.params.id}` });
    }

    // TODO: Verify adjusterId is a valid User with 'adjuster' or similar role

    claim.adjuster = adjusterId;
     if (note) {
        claim.notes.push({
            note: `Claim assigned to adjuster ${adjusterId}. ${note}`,
            // author: req.user.id,
            authorName: authorName || 'System Update'
        });
    } else {
         claim.notes.push({
            note: `Claim assigned to adjuster ${adjusterId}.`,
            // author: req.user.id,
            authorName: authorName || 'System Update'
        });
    }

    await claim.save();
    const populatedClaim = await Claim.findById(claim._id).populate('adjuster', 'firstName lastName email');

    res.status(200).json({ success: true, data: populatedClaim });
  } catch (error) { /* ... error handling ... */ }
};


// @desc    Add an attachment to a claim
// @route   POST /api/v1/claims/:id/attachments
// @access  Private - TODO: Add auth
exports.addClaimAttachment = async (req, res, next) => {
    // Similar to logNewClaim, this would use multer or expect pre-uploaded file URLs.
    // For S3, this is where you'd call your S3 upload utility.
    const { fileName, fileUrl, fileType, description } = req.body; // Assuming URL is provided after upload elsewhere

    if (!fileName || !fileUrl) {
        return res.status(400).json({ success: false, error: 'fileName and fileUrl are required for attachments.' });
    }

    try {
        const claim = await Claim.findById(req.params.id);
        if (!claim) {
            return res.status(404).json({ success: false, error: `Claim not found with id ${req.params.id}` });
        }

        // TODO: S3 upload logic would go here if file is part of request body (e.g. req.file from multer)
        // const s3Data = await uploadFileToS3(req.file.buffer, uniqueName, req.file.mimetype);
        // const newAttachment = { fileName: req.file.originalname, fileUrl: s3Data.Location, fileType: req.file.mimetype, description };

        const newAttachment = {
            fileName,
            fileUrl,
            fileType: fileType || 'application/octet-stream',
            description: description || ''
        };
        claim.attachments.push(newAttachment);

        claim.notes.push({
            note: `Attachment added: ${fileName}`,
            // author: req.user.id,
            authorName: 'System/User' // Placeholder
        });

        await claim.save();
        res.status(200).json({ success: true, data: claim.attachments });
    } catch (error) { /* ... error handling ... */ }
};

// @desc    Add a note to a claim
// @route   POST /api/v1/claims/:id/notes
// @access  Private - TODO: Add auth
exports.addClaimNote = async (req, res, next) => {
    const { note, authorName } = req.body; // authorName for now, should be req.user.name or similar
    // const authorId = req.user.id; // From auth middleware

    if (!note) {
        return res.status(400).json({ success: false, error: 'Note content is required.' });
    }

    try {
        const claim = await Claim.findById(req.params.id);
        if (!claim) {
            return res.status(404).json({ success: false, error: `Claim not found with id ${req.params.id}` });
        }

        const newNote = {
            note,
            // author: authorId,
            authorName: authorName || 'User' // Placeholder
        };
        claim.notes.push(newNote);

        await claim.save();
        // Populate author for the new note before sending back, if needed for immediate display
        // For simplicity, returning all notes. Could also return just the new note.
        const populatedClaim = await Claim.findById(claim._id).populate('notes.author', 'firstName lastName');

        res.status(200).json({ success: true, data: populatedClaim.notes });
    } catch (error) { /* ... error handling ... */ }
};
