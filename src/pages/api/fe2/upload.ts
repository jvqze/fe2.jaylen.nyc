import fs from "fs";

import FormData from "form-data";
import { File, Files, IncomingForm } from "formidable";
import { NextApiRequest, NextApiResponse } from "next";
import { Session } from "next-auth/core/types";
import { getServerSession } from "next-auth/next";
import fetch from "node-fetch";

import MongooseConnect from "../../../lib/MongooseConnect";
import AudioFileModel from "../../../models/AudioFile";
import authOptions from "../auth/[...nextauth]";

export const config = {
    api: {
        bodyParser: false,
    },
};

interface TixteResponse {
    success: boolean;
    size: number;
    data: {
        id: string;
        name: string;
        region: string;
        filename: string;
        extension: string;
        domain: string;
        type: number;
        expiration: string | null;
        permissions: Array<Record<string, any>>;
        url: string;
        direct_url: string;
        deletion_url: string;
        message: string;
    };
    message?: string;
    error?: {
        message: string;
    };
}

interface CustomSession extends Session {
    user: {
        email: string;
    };
}

/* FOR FUTURE USES
 const cleanTitle = (input: string) => {
    return input.replace(/[^a-zA-Z0-9]/g, "");
}; **/

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    try {
        const session = (await getServerSession(req, res, authOptions)) as CustomSession | null;
        if (!session) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const { email } = session.user;
        const form = new IncomingForm();

        form.parse(req, async (err: Error | null, fields: any, files: Files): Promise<void> => {
            if (err) {
                console.error("Error parsing files:", err);
                return res.status(500).json({ message: "Error parsing files" });
            }

            await MongooseConnect().catch(error => {
                console.error("Failed to connect to the database:", error);
                res.status(400).json({
                    message: "Service Unavailable: Database connection failed",
                });
                throw new Error("Service Unavailable: Database connection failed");
            });

            const audioFile = files.audioFile as File | File[] | undefined;
            if (!audioFile) {
                return res.status(400).json({ message: "No file uploaded" });
            }

            const fileToUpload = Array.isArray(audioFile) ? audioFile[0] : audioFile;
            const filePath = fileToUpload.filepath;
            const fileStream = fs.createReadStream(filePath);

            const formData = new FormData();
            const uploadDomain = "cdn.jaylen.nyc";

            let cleanedTitle: string | undefined;
            /* if (fields.title) {
                cleanedTitle = cleanTitle(fields.title);
            }*/
            const newFilename = fileToUpload.originalFilename || "uploaded_file";

            const payloadJson = JSON.stringify({
                domain: uploadDomain,
                name: newFilename,
            });
            formData.append("payload_json", payloadJson);
            formData.append("file", fileStream, newFilename);

            try {
                const response = await fetch("https://api.tixte.com/v1/upload", {
                    method: "POST",
                    headers: {
                        Authorization: `${process.env.TIXTE_API_KEY}`,
                        ...formData.getHeaders(),
                    },
                    body: formData,
                });

                const responseData = (await response.json()) as TixteResponse;
                const statusCode = response.status;

                if (statusCode === 200) {
                    const newFilePath = responseData.data.direct_url;

                    const newAudioFile = new AudioFileModel({
                        email,
                        audioLink: newFilePath,
                        title: cleanedTitle || null,
                        createdAt: new Date(),
                    });

                    await newAudioFile.save();

                    res.status(200).json({
                        message: "File uploaded successfully",
                        audioLink: newFilePath,
                    });
                } else {
                    res.status(400).json({
                        message: `Error uploading: ${responseData.error?.message ?? responseData}`,
                    });
                }
            } catch (uploadError) {
                console.error("Error uploading to Tixte:", uploadError);
                res.status(500).json({
                    message: uploadError instanceof Error ? uploadError.message : "Unknown error",
                });
            }
        });
    } catch (error) {
        console.error("Error in upload handler:", error);
        res.status(500).json({
            message: error instanceof Error ? error.message : "Unknown error",
        });
    }
}
