const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid'); // For generating unique file names

// Configure AWS SDK
// Credentials and region will be loaded from environment variables:
// AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, AWS_S3_BUCKET_NAME

let s3;
if (process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY &&
    process.env.AWS_REGION &&
    process.env.AWS_S3_BUCKET_NAME) {

    AWS.config.update({
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.AWS_REGION,
    });
    s3 = new AWS.S3();
} else {
    console.warn(
        "S3 Uploader: AWS S3 credentials or bucket name not fully configured in .env. " +
        "File uploads to S3 will fail. Ensure AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, " +
        "AWS_REGION, and AWS_S3_BUCKET_NAME are set."
    );
    // Create a mock s3 object if not configured, to prevent crashes during early dev
    // and allow code structure to remain the same.
    s3 = {
        upload: () => ({
            promise: () => {
                console.error("S3 Upload Error: AWS S3 not configured. Check .env variables.");
                throw new Error("AWS S3 not configured for file upload.");
            }
        }),
        deleteObject: () => ({
            promise: () => {
                console.error("S3 Delete Error: AWS S3 not configured. Check .env variables.");
                throw new Error("AWS S3 not configured for file deletion.");
            }
        }),
        // getSignedUrlPromise: () => Promise.reject(new Error("AWS S3 not configured.")) // If using signed URLs
    };
}


/**
 * Uploads a file to S3.
 * @param {Buffer} fileBuffer - The buffer of the file to upload.
 * @param {string} originalName - The original name of the file.
 * @param {string} mimetype - The mimetype of the file.
 * @param {string} [folder='general'] - Optional folder within the bucket to store the file.
 * @returns {Promise<Object>} - Resolves with S3 upload data (including Location and Key).
 */
const uploadToS3 = async (fileBuffer, originalName, mimetype, folder = 'general') => {
  if (!s3.upload) { // Check if the mock object's upload is present
    console.error("S3 Upload Error: AWS S3 not configured (s3.upload is mock). Check .env variables.");
    throw new Error("AWS S3 service is not properly configured for file upload.");
  }

  const fileExtension = originalName.substring(originalName.lastIndexOf('.'));
  const uniqueFileName = `${uuidv4()}${fileExtension}`;
  const s3Key = `${folder}/${uniqueFileName}`;

  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: s3Key,
    Body: fileBuffer,
    ContentType: mimetype,
    // ACL: 'public-read', // Uncomment if you want files to be publicly readable by default
  };

  try {
    const data = await s3.upload(params).promise();
    console.log(`File uploaded successfully to S3. Location: ${data.Location}, Key: ${data.Key}`);
    return data; // Contains Location (URL), Key, ETag, Bucket
  } catch (error) {
    console.error('Error uploading to S3:', error);
    throw error; // Re-throw to be handled by controller
  }
};

/**
 * Deletes a file from S3.
 * @param {string} fileKey - The Key of the file in the S3 bucket.
 * @returns {Promise<Object>} - Resolves with S3 delete data.
 */
const deleteFromS3 = async (fileKey) => {
   if (!s3.deleteObject) { // Check if the mock object's deleteObject is present
    console.error("S3 Delete Error: AWS S3 not configured (s3.deleteObject is mock). Check .env variables.");
    throw new Error("AWS S3 service is not properly configured for file deletion.");
  }

  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: fileKey,
  };

  try {
    const data = await s3.deleteObject(params).promise();
    console.log(`File deleted successfully from S3. Key: ${fileKey}`);
    return data;
  } catch (error) {
    console.error('Error deleting from S3:', error);
    throw error;
  }
};

// TODO: Add getSignedUrlForRead if needed for private files

module.exports = {
  uploadToS3,
  deleteFromS3,
};
