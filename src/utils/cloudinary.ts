import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: 'dsqvyyfkx',
    api_key: '782576771745263',
    api_secret: process.env.CLOUDINARY_API_KEY,
});

export default cloudinary;
