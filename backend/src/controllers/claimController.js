const Claim = require('../models/Claim');
const Policy = require('../models/Policy');
const User = require('../models/User'); // For adjuster role check and author name
const { uploadToS3 /*, deleteFromS3 */ } = require('../utils/s3Handler'); // Import S3 utility

// Note: File upload middleware (e.g., using multer) should be applied at the route level
// before these controller actions if files are part of the request.
// This controller assumes req.file or req.files is populated by such middleware for new uploads.

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
  const loggedInUser = req.user; // Set by 'protect' middleware

  if (!policyId || !dateOfLoss || !descriptionOfLoss) {
    return res.status(400).json({ success: false, error: 'Please provide policyId, dateOfLoss, and descriptionOfLoss' });
  }

  try {
    const policy = await Policy.findById(policyId).populate('customer').populate('product');
    if (!policy) {
      return res.status(404).json({ success: false, error: `Policy not found with id ${policyId}` });
    }

    // Authorization: Verify that the person reporting the claim is authorized for this policy
    if (loggedInUser.role === 'customer' && policy.customer._id.toString() !== loggedInUser.id) {
        return res.status(403).json({ success: false, error: 'Not authorized to report a claim for this policy.' });
    }
    // TODO: Add agent authorization logic if agents can report claims for their customers.

    const claimData = {
      policy: policy._id,
      customer: policy.customer._id,
      product: policy.product._id,
      dateOfLoss,
      descriptionOfLoss,
      status: 'Open',
      estimatedLossAmount,
      currency: currency || policy.premiumCurrency || 'USD',
      attachments: [],
      notes: [{
        note: `Claim reported. Description: ${descriptionOfLoss}`,
        author: loggedInUser.id,
        authorName: `${loggedInUser.firstName} ${loggedInUser.lastName}`,
      }]
    };

    // --- S3 Attachment Logic ---
    if (req.files && req.files.length > 0) { // If using multer and files are uploaded (e.g., from handleMultipleUploads)
      for (const file of req.files) {
        try {
          const s3Data = await uploadToS3(file.buffer, file.originalname, file.mimetype, `claims/${policy._id.toString()}`);
          claimData.attachments.push({
            fileName: file.originalname,
            fileUrl: s3Data.Location, // URL from S3
            fileType: file.mimetype,
            // description: file.description // If description is part of file upload form data per file
          });
        } catch (s3Error) {
          console.error("S3 Upload Error in logNewClaim:", s3Error);
          // Decide if to fail the whole claim or log claim with failed uploads
          // For now, let's continue and log, attachments can be added later
        }
      }
    } else if (initialAttachments && Array.isArray(initialAttachments)) {
        // This path might be deprecated if direct S3 upload via middleware is the primary method
        console.warn("logNewClaim: Using 'initialAttachments' with pre-set URLs. Consider direct S3 upload via middleware.");
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
    // --- End S3 Attachment Logic ---

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
// @access  Private (Role-dependent filtering)
exports.getAllClaims = async (req, res, next) => {
  try {
    let queryFilters = { ...req.query }; // Copy query params for admin filtering
    const loggedInUser = req.user;

    if (loggedInUser.role === 'customer') {
      queryFilters.customer = loggedInUser.id;
    } else if (loggedInUser.role === 'agent') {
      // TODO: Agent-specific filtering (e.g., claims for their customers or policies they manage)
      // For now, an agent might be restricted like a customer or see claims they are assigned as adjuster.
      // queryFilters.adjuster = loggedInUser.id; // Example: if agent is an adjuster
      // Or, if agent is linked to customers, filter by those customer IDs.
      // This needs more defined business logic for agent's scope.
      // For simplicity, let's say an agent for now can only see claims they are assigned to as adjuster.
      // This means if they are not an adjuster on any claim, they see none by default via this.
      queryFilters.adjuster = loggedInUser.id;
    }
    // Admin/staff can see all claims or apply further filters from req.query
    // (e.g., req.query.status, req.query.policyId)
    // If an admin specifically queries for a customerId, it's already handled by queryFilters spread.

    // Remove pagination/sort params from queryFilters if they are handled separately
    delete queryFilters.page;
    delete queryFilters.limit;
    delete queryFilters.sort;

    let query = Claim.find(queryFilters);

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
// @access  Private (Owner, Adjuster, Admin/Staff)
exports.getClaimById = async (req, res, next) => {
  try {
    const claim = await Claim.findById(req.params.id)
      .populate('policy', 'policyNumber')
      .populate('customer', 'firstName lastName email')
      .populate('product', 'name productType')
      .populate('adjuster', 'firstName lastName email')
      .populate('notes.author', 'firstName lastName email'); // Added email to author populate

    if (!claim) {
      return res.status(404).json({ success: false, error: `Claim not found with id ${req.params.id}` });
    }

    const loggedInUser = req.user;
    // Authorization check:
    if (loggedInUser.role === 'customer' && (!claim.customer || claim.customer._id.toString() !== loggedInUser.id)) {
      return res.status(403).json({ success: false, error: 'Not authorized to access this claim' });
    }
    if (loggedInUser.role === 'agent' && (!claim.adjuster || claim.adjuster._id.toString() !== loggedInUser.id)) {
      // This assumes agent's access is only if they are the assigned adjuster.
      // More complex logic might be needed if agents can see all claims for their customers.
      // A quick check for customer ownership if agent is also the customer on the claim (edge case)
      if (!claim.customer || claim.customer._id.toString() !== loggedInUser.id) {
         return res.status(403).json({ success: false, error: 'Not authorized to access this claim as agent/adjuster' });
      }
    }
    // Admin/staff can access any claim.

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
// @access  Private (Admin, Adjuster/Staff)
exports.updateClaimStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;
    const loggedInUser = req.user;

    if (!status) {
      return res.status(400).json({ success: false, error: 'Status is required' });
    }

    const claim = await Claim.findById(req.params.id);
    if (!claim) {
      return res.status(404).json({ success: false, error: `Claim not found with id ${req.params.id}` });
    }

    // Authorization: Only admin, staff, or assigned adjuster can update status (adjuster might have limited status changes)
    if (!(loggedInUser.role === 'admin' || loggedInUser.role === 'staff' ||
        (loggedInUser.role === 'agent' && claim.adjuster && claim.adjuster.toString() === loggedInUser.id))) {
        return res.status(403).json({ success: false, error: 'Not authorized to update status for this claim.' });
    }
    // TODO: Add more sophisticated status transition logic based on current status and user role.

    const oldStatus = claim.status;
    claim.status = status;

    const noteText = note ? `Status changed from ${oldStatus} to ${status}. ${note}` : `Status changed from ${oldStatus} to ${status}.`;
    claim.notes.push({
        note: noteText,
        author: loggedInUser.id,
        authorName: `${loggedInUser.firstName} ${loggedInUser.lastName}`
    });

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

// @access  Private (Admin/Staff)
exports.assignClaimToAdjuster = async (req, res, next) => {
  try {
    const { adjusterId, note } = req.body;
    const loggedInUser = req.user;

    if (!adjusterId) {
      return res.status(400).json({ success: false, error: 'Adjuster ID is required' });
    }

    const claim = await Claim.findById(req.params.id);
    if (!claim) {
      return res.status(404).json({ success: false, error: `Claim not found with id ${req.params.id}` });
    }

    // TODO: Verify adjusterId is a valid User with 'agent' or 'staff' role suitable for adjusting.
    const adjusterUser = await User.findById(adjusterId);
    if (!adjusterUser || !['agent', 'staff', 'admin'].includes(adjusterUser.role)) { // Example role check
        return res.status(400).json({ success: false, error: 'Invalid Adjuster ID or user is not an eligible adjuster.' });
    }

    claim.adjuster = adjusterId;
    const noteText = note ? `Claim assigned to adjuster ${adjusterUser.firstName} ${adjusterUser.lastName} (${adjusterId}). ${note}` : `Claim assigned to adjuster ${adjusterUser.firstName} ${adjusterUser.lastName} (${adjusterId}).`;
    claim.notes.push({
        note: noteText,
        author: loggedInUser.id,
        authorName: `${loggedInUser.firstName} ${loggedInUser.lastName}`
    });

    await claim.save();
    const populatedClaim = await Claim.findById(claim._id).populate('adjuster', 'firstName lastName email');

    res.status(200).json({ success: true, data: populatedClaim });
  } catch (error) { /* ... error handling ... */ }
};


// @desc    Add an attachment to a claim
// @route   POST /api/v1/claims/:id/attachments
// @access  Private (User associated with claim, Adjuster, Admin/Staff)
exports.addClaimAttachment = async (req, res, next) => {
    // This function now expects req.file (from single upload middleware) or req.files (from multiple)
    // For simplicity, let's assume single file upload via req.file for this example.
    // The route would use handleSingleUpload('claimAttachment') or handleMultipleUploads('claimAttachments', 5)
    const loggedInUser = req.user;

    if (!req.file && (!req.files || req.files.length === 0)) {
        return res.status(400).json({ success: false, error: 'No file uploaded.' });
    }

    // For single file:
    const fileToUpload = req.file;
    // If multiple: const filesToUpload = req.files; // Then loop through filesToUpload

    if (!fileToUpload) { // Fallback if somehow middleware didn't attach but no error
         return res.status(400).json({ success: false, error: 'File processing error.' });
    }

    try {
        const claim = await Claim.findById(req.params.id);
        if (!claim) {
            return res.status(404).json({ success: false, error: `Claim not found with id ${req.params.id}` });
        }

        // Authorization: Check if user is customer, assigned adjuster, or admin/staff
        const isCustomer = loggedInUser.role === 'customer' && claim.customer.toString() === loggedInUser.id;
        const isAdjuster = claim.adjuster && claim.adjuster.toString() === loggedInUser.id;
        const isAdminOrStaff = ['admin', 'staff'].includes(loggedInUser.role);

        if (!isCustomer && !isAdjuster && !isAdminOrStaff) {
            return res.status(403).json({ success: false, error: 'Not authorized to add attachments to this claim.' });
        }

        // Upload to S3
        const s3Data = await uploadToS3(
            fileToUpload.buffer,
            fileToUpload.originalname,
            fileToUpload.mimetype,
            `claims/${claim._id.toString()}/attachments` // Example S3 folder structure
        );

        const newAttachment = {
            fileName: fileToUpload.originalname,
            fileUrl: s3Data.Location, // URL from S3
            fileType: fileToUpload.mimetype,
            description: req.body.description || '' // Optional description from form body
        };
        claim.attachments.push(newAttachment);

        claim.notes.push({
            note: `Attachment added: ${newAttachment.fileName}`,
            author: loggedInUser.id,
            authorName: `${loggedInUser.firstName} ${loggedInUser.lastName}`
        });

        await claim.save();
        res.status(200).json({ success: true, data: claim.attachments, message: 'Attachment added successfully.' });
    } catch (error) {
        console.error("Add Claim Attachment Error:", error);
        if (error.message.includes("File upload only supports")) { // From our fileFilter
            return res.status(400).json({ success: false, error: error.message });
        }
        res.status(500).json({ success: false, error: 'Server error adding attachment.' });
    }
};

// @desc    Add a note to a claim
// @route   POST /api/v1/claims/:id/notes
// @access  Private (User associated with claim, Adjuster, Admin/Staff)
exports.addClaimNote = async (req, res, next) => {
    const { note } = req.body;
    const loggedInUser = req.user;

    if (!note) {
        return res.status(400).json({ success: false, error: 'Note content is required.' });
    }

    try {
        const claim = await Claim.findById(req.params.id);
        if (!claim) {
            return res.status(404).json({ success: false, error: `Claim not found with id ${req.params.id}` });
        }

        // Authorization: Check if user is customer, assigned adjuster, or admin/staff
        const isCustomer = loggedInUser.role === 'customer' && claim.customer.toString() === loggedInUser.id;
        const isAdjuster = claim.adjuster && claim.adjuster.toString() === loggedInUser.id;
        const isAdminOrStaff = ['admin', 'staff'].includes(loggedInUser.role);

        if (!isCustomer && !isAdjuster && !isAdminOrStaff) {
            return res.status(403).json({ success: false, error: 'Not authorized to add a note to this claim.' });
        }

        const newNote = {
            note,
            author: loggedInUser.id,
            authorName: `${loggedInUser.firstName} ${loggedInUser.lastName}`
        };
        claim.notes.push(newNote);

        await claim.save();
        // Populate author for the new note before sending back, if needed for immediate display
        // For simplicity, returning all notes. Could also return just the new note.
        const populatedClaim = await Claim.findById(claim._id).populate('notes.author', 'firstName lastName');

        res.status(200).json({ success: true, data: populatedClaim.notes });
    } catch (error) { /* ... error handling ... */ }
};
