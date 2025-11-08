import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const generateFileName = () => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `${timestamp}-${random}`;
};

const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;
const AWS_REGION = process.env.AWS_REGION;

const s3Client = new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
});

export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image file provided" });
    }
    if (!BUCKET_NAME) {
      return res.status(500).json({ error: "S3 bucket not configured" });
    }
    const file = req.file;
    const fileExtension = file.originalname.split('.').pop() || 'jpg';
    const fileName = `inventory-images/${generateFileName()}.${fileExtension}`;
    const uploadParams = {
      Bucket: BUCKET_NAME,
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype,
    };
    const useAcl = process.env.AWS_S3_USE_ACL === 'true'
    const paramsWithAcl = useAcl ? { ...uploadParams, ACL: 'public-read' } : uploadParams
    try {
      await s3Client.send(new PutObjectCommand(paramsWithAcl));
    } catch (err) {
      if (useAcl && err?.name === 'AccessDenied') {
        await s3Client.send(new PutObjectCommand(uploadParams))
      } else {
        throw err
      }
    }
    const imageUrl = `https://${BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${fileName}`;
    res.status(200).json({
      url: imageUrl,
      fileName: fileName,
    });
  } catch (error) {
    console.error("Image upload error:", error);
    res.status(500).json({ error: "Failed to upload image" });
  }
};
