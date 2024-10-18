const { Storage } = require("@google-cloud/storage");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config();
console.log("Google cloud project ID", process.env.GOOGLE_CLOUD_PROJECT_ID);
console.log(
  "Google cloud key_file path",
  process.env.GOOGLE_CLOUD_KEYFILE_PATH
);

// Create a storage client
const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  keyFilename: path.join(
    __dirname,
    "..",
    process.env.GOOGLE_CLOUD_KEYFILE_PATH
  ),
});

// Reference the bucket
const bucket = storage.bucket(process.env.GOOGLE_CLOUD_BUCKET_NAME);

// Upload function
const uploadToGCS = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject("No file provided");
    }

    const blob = bucket.file(file.originalname);
    const blobStream = blob.createWriteStream({
      resumable: false,
    });

    blobStream.on("error", (err) => {
      reject(err);
    });

    blobStream.on("finish", () => {
      // The public URL for the uploaded file
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
      resolve(publicUrl);
    });

    blobStream.end(file.buffer);
  });
};

module.exports = {
  uploadToGCS,
};
