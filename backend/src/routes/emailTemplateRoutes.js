const express = require('express');
const {
  createEmailTemplate,
  getAllEmailTemplates,
  getEmailTemplate,
  updateEmailTemplate,
  deleteEmailTemplate,
} = require('../controllers/emailTemplateController');

const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes in this file are admin-only
router.use(protect);
router.use(authorize('admin')); // Or a more specific 'template_manager' role if defined

router.route('/')
  .post(createEmailTemplate)
  .get(getAllEmailTemplates);

router.route('/:identifier') // :identifier can be an ID or templateName
  .get(getEmailTemplate)
  .put(updateEmailTemplate)
  .delete(deleteEmailTemplate);

module.exports = router;
