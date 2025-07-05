const EmailTemplate = require('../models/EmailTemplate');

// @desc    Create a new email template
// @route   POST /api/v1/email-templates
// @access  Private (Admin) - TODO: Add auth middleware
exports.createEmailTemplate = async (req, res, next) => {
  try {
    const { templateName, subject, htmlBody, textBody, placeholders, description, isActive } = req.body;

    if (!templateName || !subject || !htmlBody) {
        return res.status(400).json({ success: false, error: 'Template name, subject, and HTML body are required.' });
    }

    const existingTemplate = await EmailTemplate.findOne({ templateName });
    if (existingTemplate) {
        return res.status(400).json({ success: false, error: `Email template with name '${templateName}' already exists.`});
    }

    const emailTemplate = await EmailTemplate.create({
      templateName,
      subject,
      htmlBody,
      textBody,
      placeholders,
      description,
      isActive,
    });

    res.status(201).json({
      success: true,
      data: emailTemplate,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(val => val.message);
        return res.status(400).json({ success: false, error: messages });
    }
    console.error("Create Email Template Error:", error);
    res.status(500).json({ success: false, error: 'Server Error creating email template' });
  }
};

// @desc    Get all email templates
// @route   GET /api/v1/email-templates
// @access  Private (Admin) - TODO: Add auth middleware
exports.getAllEmailTemplates = async (req, res, next) => {
  try {
    const query = req.query.isActive ? { isActive: req.query.isActive === 'true' } : {};
    const emailTemplates = await EmailTemplate.find(query).sort({ templateName: 1 });

    res.status(200).json({
      success: true,
      count: emailTemplates.length,
      data: emailTemplates,
    });
  } catch (error) {
    console.error("Get All Email Templates Error:", error);
    res.status(500).json({ success: false, error: 'Server Error fetching email templates' });
  }
};

// @desc    Get a single email template by ID or templateName
// @route   GET /api/v1/email-templates/:identifier
// @access  Private (Admin) - TODO: Add auth middleware
exports.getEmailTemplate = async (req, res, next) => {
  try {
    const identifier = req.params.identifier;
    let emailTemplate;

    // Check if identifier is a valid ObjectId, if so try by ID first
    if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
      emailTemplate = await EmailTemplate.findById(identifier);
    }

    // If not found by ID (or not a valid ObjectId), try by templateName
    if (!emailTemplate) {
      emailTemplate = await EmailTemplate.findOne({ templateName: identifier });
    }

    if (!emailTemplate) {
      return res.status(404).json({
        success: false,
        error: `Email template not found with identifier: ${identifier}`,
      });
    }

    res.status(200).json({
      success: true,
      data: emailTemplate,
    });
  } catch (error) {
    console.error("Get Email Template Error:", error);
    res.status(500).json({ success: false, error: 'Server Error fetching email template' });
  }
};

// @desc    Update an email template by ID or templateName
// @route   PUT /api/v1/email-templates/:identifier
// @access  Private (Admin) - TODO: Add auth middleware
exports.updateEmailTemplate = async (req, res, next) => {
  try {
    const identifier = req.params.identifier;
    const { subject, htmlBody, textBody, placeholders, description, isActive } = req.body;

    let emailTemplate;

    if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
      emailTemplate = await EmailTemplate.findById(identifier);
    }
    if (!emailTemplate) {
      emailTemplate = await EmailTemplate.findOne({ templateName: identifier });
    }

    if (!emailTemplate) {
      return res.status(404).json({
        success: false,
        error: `Email template not found with identifier: ${identifier}`,
      });
    }

    // Update fields if they are provided in the request body
    if (subject !== undefined) emailTemplate.subject = subject;
    if (htmlBody !== undefined) emailTemplate.htmlBody = htmlBody;
    if (textBody !== undefined) emailTemplate.textBody = textBody;
    if (placeholders !== undefined) emailTemplate.placeholders = placeholders;
    if (description !== undefined) emailTemplate.description = description;
    if (isActive !== undefined) emailTemplate.isActive = isActive;
    // templateName is unique and probably shouldn't be updated easily.
    // If templateName needs to be updatable, ensure uniqueness check for new name.

    const updatedEmailTemplate = await emailTemplate.save({ runValidators: true });

    res.status(200).json({
      success: true,
      data: updatedEmailTemplate,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(val => val.message);
        return res.status(400).json({ success: false, error: messages });
    }
    console.error("Update Email Template Error:", error);
    res.status(500).json({ success: false, error: 'Server Error updating email template' });
  }
};

// @desc    Delete an email template by ID or templateName
// @route   DELETE /api/v1/email-templates/:identifier
// @access  Private (Admin) - TODO: Add auth middleware
exports.deleteEmailTemplate = async (req, res, next) => {
  try {
    const identifier = req.params.identifier;
    let emailTemplate;

    if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
      emailTemplate = await EmailTemplate.findById(identifier);
    }
    if (!emailTemplate) {
      emailTemplate = await EmailTemplate.findOne({ templateName: identifier });
    }

    if (!emailTemplate) {
      return res.status(404).json({
        success: false,
        error: `Email template not found with identifier: ${identifier}`,
      });
    }

    await emailTemplate.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
      message: `Email template '${emailTemplate.templateName}' deleted successfully.`,
    });
  } catch (error) {
    console.error("Delete Email Template Error:", error);
    res.status(500).json({ success: false, error: 'Server Error deleting email template' });
  }
};
