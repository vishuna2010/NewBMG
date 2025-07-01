const express = require('express');
const {
  logNewClaim,
  getAllClaims,
  getClaimById,
  updateClaimStatus,
  assignClaimToAdjuster,
  addClaimAttachment,
  addClaimNote,
} = require('../controllers/claimController');

const { protect, authorize } = require('../middleware/authMiddleware');
const { handleSingleUpload, handleMultipleUploads } = require('../middleware/fileUploadMiddleware');

const router = express.Router();

// All claim routes should be protected as they relate to sensitive user/policy data
router.use(protect); // Apply protect to all routes in this file by default

router.route('/')
  // Authenticated users (customers, agents) can log new claims.
  // Using handleMultipleUploads for 'initialAttachments' field, allowing up to 5 files.
  .post(handleMultipleUploads('initialClaimAttachments', 5), logNewClaim)
  // Admins/staff/agents can see all claims (controllers will filter). Customers only their own (controller logic).
  .get(getAllClaims);

router.route('/:id')
  // Owner, adjuster, or admin/staff/agent can view a specific claim. Controller needs to implement ownership/role check.
  .get(getClaimById);

router.route('/:id/status')
  // Typically admin or adjuster updates status.
  .put(authorize('admin', 'staff', 'agent'), updateClaimStatus);

router.route('/:id/assign')
  // Typically admin or senior staff/agent assigns.
  .put(authorize('admin', 'staff'), assignClaimToAdjuster);

router.route('/:id/attachments')
  // Owner, adjuster, or admin/staff can add attachments.
  // Using handleSingleUpload for 'claimAttachment' field.
  .post(handleSingleUpload('claimAttachment'), addClaimAttachment);

router.route('/:id/notes')
  // Owner, adjuster, or admin/staff can add notes.
  .post(addClaimNote);

module.exports = router;
