import { NextApiRequest, NextApiResponse } from "next";

import MongooseConnect from "../../lib/MongooseConnect";
import AudioFileModel from "../../models/AudioFile";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    await MongooseConnect();

    const { method } = req;
    switch (method) {
        case "GET":
            try {
                const { email } = req.query;
                if (!email || typeof email !== "string") {
                    return res.status(400).json({ message: "Invalid email parameter." });
                }

                const files = await AudioFileModel.find({ email });
                return res.status(200).json(
                    files.map(file => ({
                        name: file.title,
                        link: file.audioLink,
                        createdAt: file.createdAt,
                    })),
                );
            } catch (error) {
                console.error("Error fetching files:", error);
                return res.status(500).json({ message: "Error fetching files." });
            }

        default:
            res.setHeader("Allow", ["GET", "POST"]);
            return res.status(405).end(`Method ${method} Not Allowed`);
    }
}
