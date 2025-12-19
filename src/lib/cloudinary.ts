import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = async (file: File, fileType: string): Promise<string> => {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    return new Promise((resolve, reject) => {
        const resourceType = fileType === 'image' ? 'image' : 'raw';

        cloudinary.uploader
            .upload_stream(
                {
                    resource_type: resourceType,
                    folder: 'procedures',
                },
                (error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(result!.secure_url);
                    }
                },
            )
            .end(buffer);
    });
};

export default cloudinary;
