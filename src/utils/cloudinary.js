import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET 
});

// Upload an image to Cloudinary
const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;

        // Upload to Cloudinary
        const uploadResult = await cloudinary.uploader.upload(localFilePath, {
            folder: "public", // Change to your preferred folder name
        });

        // Remove file from local storage after successful upload
        await fs.promises.unlink(localFilePath);

        return uploadResult;
    } catch (error) {
        console.error("Cloudinary upload error:", error);

        // Ensure local file is deleted if upload fails
        try {
            await fs.promises.unlink(localFilePath);
        } catch (unlinkError) {
            console.error("Error deleting local file:", unlinkError);
        }

        return null;
    }
};

export { uploadOnCloudinary };
