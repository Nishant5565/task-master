require("dotenv").config();
const {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");
const multer = require("multer");
const { createResponse } = require("../utility/responseUtil");
const path = require("path");

// Configure Multer to use memory storage with a file size limit of 2MB
const storage = multer.memoryStorage();
const multipleUpload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
}).array("images", 10);

const singleUpload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
}).single("file"); // Single file upload for "file" field

// Initialize S3 Client for Cloudflare R2
const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

// Controller function to handle file upload (original only)
const uploadFile = async (file) => {
  const bucketName = process.env.R2_BUCKET_NAME;
  const publicEndpoint = process.env.R2_PUBLIC_ENDPOINT;

  if (!bucketName || !publicEndpoint) {
    throw new Error("R2 bucket name or public endpoint is not configured");
  }

  try {
    // Upload original file only
    const originalParams = {
      Bucket: bucketName,
      Key: file.originalname,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: "public-read",
    };
    await s3.send(new PutObjectCommand(originalParams));
    const originalFileUrl = `${publicEndpoint}${file.originalname}`;

    return { originalFileUrl }; // Return only the original file URL
  } catch (err) {
    console.error("Error uploading file:", err);
    throw new Error("Error uploading file");
  }
};

const deleteFromCloudflareR2 = async (fileUrl) => {
  try {
    if (!fileUrl || typeof fileUrl !== "string") {
      throw new Error("File URL is undefined, invalid, or not a string");
    }

    const bucketName = process.env.R2_BUCKET_NAME;
    const publicEndpoint = process.env.R2_PUBLIC_ENDPOINT;

    // Extract the key from the file URL
    const key = fileUrl.replace(publicEndpoint, "");

    if (!key || key === fileUrl) {
      throw new Error("Invalid file URL format");
    }

    // Delete only the original file
    const originalParams = {
      Bucket: bucketName,
      Key: key,
    };
    await s3.send(new DeleteObjectCommand(originalParams));
  } catch (error) {
    console.error("Error deleting file from R2:", error.message);
    throw new Error("Failed to delete file from R2");
  }
};

const uploadBlogImage = async (file, title, isThumbnailImage = false) => {
  const bucketName = process.env.R2_BUCKET_NAME;
  const publicEndpoint = process.env.R2_PUBLIC_ENDPOINT;

  if (!bucketName || !publicEndpoint) {
    throw new Error("R2 bucket name or public endpoint is not configured");
  }

  // Extract file extension
  const ext = path.extname(file.originalname).toLowerCase();

  // Unique filename (slug + timestamp)
  let uniqueFilename = isThumbnailImage
    ? `${title}`
    : `${title}-${Date.now()}${ext}`;

  try {
    const params = {
      Bucket: bucketName,
      Key: uniqueFilename,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: "public-read",
    };

    await s3.send(new PutObjectCommand(params));

    const fileUrl = `${publicEndpoint}${uniqueFilename}`;
    return { fileUrl };
  } catch (err) {
    console.error("Error uploading blog image:", err);
    throw new Error("Error uploading blog image");
  }
};

const uploadUserProfile = async (file, userId) => {
  const bucketName = process.env.R2_BUCKET_NAME;
  const publicEndpoint = process.env.R2_PUBLIC_ENDPOINT;
  if (!bucketName || !publicEndpoint) {
    throw new Error("R2 bucket name or public endpoint is not configured");
  }
  // Use user id as filename to ensure uniqueness and date prefix for better organization
  // Include timestamp to allow cache busting
  const timestamp = Date.now();
  const ext = path.extname(file.originalname);
  const uniqueFilename = `profiles/${userId}-${timestamp}${ext}`;

  try {
    const params = {
      Bucket: bucketName,
      Key: uniqueFilename,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: "public-read",
    };

    await s3.send(new PutObjectCommand(params));

    const fileUrl = `${publicEndpoint}${uniqueFilename}`;
    return { fileUrl };
  } catch (err) {
    console.error("Error uploading user profile image:", err);
    throw new Error("Error uploading user profile image");
  }
};

module.exports = {
  singleUpload,
  uploadFile,
  multipleUpload,
  uploadUserProfile,
  deleteFromCloudflareR2,
  uploadBlogImage,
};
