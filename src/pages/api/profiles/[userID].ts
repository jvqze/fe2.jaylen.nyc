import { NextApiRequest, NextApiResponse } from "next";

import MongooseConnect from "../../../lib/MongooseConnect";
import userProfileModel from "../../../models/UserProfile";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    await MongooseConnect();

    const { method } = req;

    switch (method) {
        case "GET":
            try {
                const { userID } = req.query;
                if (!userID || typeof userID !== "string") {
                    return res.status(400).json({ message: "Invalid userID parameter." });
                }

                const userProfile = await userProfileModel.findOne({ userID });
                if (!userProfile) {
                    return res.status(404).json({ message: "User profile not found." });
                }

                return res.status(200).json({
                    userID: userProfile.userID,
                    discordAvatar: userProfile.discordAvatar,
                    createdAt: userProfile.createdAt,
                    uploads: userProfile.uploads
                        .filter((upload: { private: boolean | null }) => upload.private === false)
                        .map((upload: { title: string; audioLink: string; createdAt: Date }) => ({
                            title: upload.title,
                            audioLink: upload.audioLink,
                            createdAt: upload.createdAt,
                        })),
                });
                       
            } catch (error) {
                console.error("Error fetching user profile:", error);
                return res.status(500).json({ message: "Error fetching user profile." });
            }

        default:
            res.setHeader("Allow", ["GET"]);
            return res.status(405).end(`Method ${method} Not Allowed`);
    }
}
