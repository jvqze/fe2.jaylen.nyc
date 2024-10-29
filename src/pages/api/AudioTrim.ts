import cloudinary from "../../utils/cloudinary";

import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { audioUrl, startTime, endTime } = req.body;

    try {
        const uploadResponse = await cloudinary.uploader.upload(audioUrl, {
            resource_type: "video",
            format: "mp3",
        });

        if (!uploadResponse || !uploadResponse.secure_url) {
            throw new Error("Failed to upload audio to Cloudinary");
        }

        const trimmedAudio = cloudinary.url(uploadResponse.public_id, {
            resource_type: "video",
            start_offset: startTime,
            end_offset: endTime,
            format: "mp3",
        });

        res.status(200).json({ success: true, trimmedAudioUrl: trimmedAudio });
    } catch (error) {
        console.error("Error trimming audio:", error);
        res.status(500).json({ success: false, message: "Failed to trim audio" });
    }
}
