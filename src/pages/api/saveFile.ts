import { NextApiRequest, NextApiResponse } from 'next';

import MongooseConnect from '../../lib/MongooseConnect';
import userProfileModel from '../../models/UserProfile';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    await MongooseConnect();
    const { userid, audioLink, title, private: isPrivate, createdAt } = req.body;
    if (typeof userid !== 'string') {
        return res.status(400).json({ message: 'Invalid userID format' });
    }

    try {
        const userProfile = await userProfileModel.findOneAndUpdate(
            { userID: userid },
            {
                $setOnInsert: { userID: userid },
                $push: {
                    uploads: {
                        audioLink,
                        title,
                        private: isPrivate,
                        createdAt,
                    },
                },
            },
            { new: true, upsert: true },
        );
        res.status(200).json({ message: 'File metadata saved successfully', profile: userProfile });
    } catch (error) {
        console.error('Error saving metadata:', error);
        res.status(500).json({ message: 'Error saving metadata' });
    }
}
