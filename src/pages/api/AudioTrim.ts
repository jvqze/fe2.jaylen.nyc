import cloudinary from "../../utils/cloudinary";

import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ success: false, message: "Method Not Allowed" });
    }

    const { audioUrl, startTime, endTime } = req.body;

    if (
        !audioUrl ||
        typeof startTime !== "number" ||
        typeof endTime !== "number" ||
        startTime >= endTime
    ) {
        return res
            .status(400)
            .json({ success: false, message: "Invalid audioUrl or time offsets" });
    }

    try {
        const uploadResponse = await cloudinary.uploader.upload(audioUrl, {
            resource_type: "video",
            format: "mp3",
        });

        if (!uploadResponse || !uploadResponse.secure_url) {
            console.error("Upload response missing secure_url:", uploadResponse);
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
        if (error instanceof Error) {
            res.status(500).json({ success: false, message: error.message });
        } else {
            res.status(500).json({
                success: false,
                message: "Failed to trim audio due to an unknown error",
            });
        }
    }
}
