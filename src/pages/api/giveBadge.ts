import { NextApiRequest, NextApiResponse } from 'next';

import userProfileModel from '../../models/UserProfile';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const { userId, badge } = req.body;

        if (!userId || !badge) {
            return res.status(400).json({ message: 'User ID and badge data are required' });
        }

        await userProfileModel.findOneAndUpdate(
            { userID: userId },
            { $push: { badges: badge } },
            { new: true, upsert: true },
        );

        return res.status(200).json({ message: 'Badge awarded successfully' });
    } else {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }
}
