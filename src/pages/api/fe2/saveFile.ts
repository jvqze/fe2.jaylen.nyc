import { NextApiRequest, NextApiResponse } from "next";

import MongooseConnect from "../../../lib/MongooseConnect";
import AudioFileModel from "../../../models/AudioFile";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    await MongooseConnect();

    const { email, audioLink, title, createdAt } = req.body;

    try {
        const newAudioFile = new AudioFileModel({
            email,
            audioLink,
            title,
            createdAt,
        });

        await newAudioFile.save();

        res.status(200).json({ message: "File metadata saved successfully" });
    } catch (error) {
        console.error("Error saving metadata:", error);
        res.status(500).json({ message: "Error saving metadata" });
    }
}
