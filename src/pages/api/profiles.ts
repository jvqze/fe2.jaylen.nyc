import { NextApiRequest, NextApiResponse } from "next";

import MongooseConnect from "../../lib/MongooseConnect";
import userProfileModel from "../../models/UserProfile";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") {
        return res.status(405).json({ success: false, message: "Method Not Allowed" });
    }

    try {
        await MongooseConnect();

        const profiles = await userProfileModel.find({}, "userID discordAvatar createdAt").lean();
        res.status(200).json(profiles);
    } catch (error) {
        console.error("Error fetching profiles:", error);
        res.status(500).json({ success: false, message: "Failed to fetch profiles" });
    }
}
