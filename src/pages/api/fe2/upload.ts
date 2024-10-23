import fs from "fs";
import path from "path";

import FormData from "form-data";
import { Fields, Files, File as FormidableFile, IncomingForm } from "formidable";
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

// Extend the default Session interface
interface CustomSession extends Session {
    user: {
        email: string;
    };
}

interface ChunkUploadFields {
    chunkIndex?: string | string[];
    totalChunks?: string | string[];
    fileName?: string | string[];
}

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

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    try {
        // Get session to verify authentication
        await MongooseConnect();
        const session = (await getServerSession(req, res, authOptions)) as CustomSession | null;
        if (!session) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const { email } = session.user;
        const form = new IncomingForm();
        const chunksDir = path.join(process.cwd(), "chunks"); // Temporary chunks storage directory

        // Ensure the chunks directory exists
        if (!fs.existsSync(chunksDir)) {
            fs.mkdirSync(chunksDir);
        }

        // Parse the form
        form.parse(req, async (err: Error | null, fields: ChunkUploadFields, files: Files) => {
            if (err) {
                console.error("Error parsing files:", err);
                return res.status(500).json({ message: "Error parsing files" });
            }

            // Handle the uploaded chunk
            const chunkIndex = parseInt(
                Array.isArray(fields.chunkIndex) ? fields.chunkIndex[0] : fields.chunkIndex || "0",
            );
            const totalChunks = parseInt(
                Array.isArray(fields.totalChunks)
                    ? fields.totalChunks[0]
                    : fields.totalChunks || "0",
            );
            const fileName = Array.isArray(fields.fileName)
                ? fields.fileName[0]
                : fields.fileName || "";
            const chunkFile = files.chunk
                ? ((Array.isArray(files.chunk) ? files.chunk[0] : files.chunk) as FormidableFile)
                : undefined;

            if (!chunkFile) {
                return res.status(400).json({ message: "No chunk uploaded" });
            }

            const chunkPath = path.join(chunksDir, `${fileName}.part${chunkIndex}`);
            if (chunkFile?.filepath) {
                fs.renameSync(chunkFile.filepath, chunkPath);
            } else {
                return res.status(400).json({ message: "Invalid chunk file path" });
            }

            // If this is the last chunk, combine all chunks
            if (chunkIndex === totalChunks - 1) {
                const finalFilePath = path.join(chunksDir, fileName);
                const writeStream = fs.createWriteStream(finalFilePath);

                for (let i = 0; i < totalChunks; i++) {
                    const chunkPath = path.join(chunksDir, `${fileName}.part${i}`);
                    if (fs.existsSync(chunkPath)) {
                        const data = fs.readFileSync(chunkPath);
                        writeStream.write(data);
                        fs.unlinkSync(chunkPath);
                    } else {
                        return res
                            .status(500)
                            .json({ message: `Missing chunk file: ${chunkPath}` });
                    }
                }

                writeStream.on("finish", async () => {
                    try {
                        const fileStream = fs.createReadStream(finalFilePath);
                        const formData = new FormData();

                        const payloadJson = JSON.stringify({
                            domain: "cdn.jaylen.nyc",
                            name: fileName,
                        });
                        formData.append("payload_json", payloadJson);
                        formData.append("file", fileStream, fileName);

                        const response = await fetch("https://api.tixte.com/v1/upload", {
                            method: "POST",
                            headers: {
                                Authorization: `${process.env.TIXTE_API_KEY}`,
                                ...formData.getHeaders(),
                            },
                            body: formData,
                        });

                        const result = (await response.json()) as TixteResponse;

                        if (!response.ok) {
                            console.error(result);
                            console.error(
                                `Upload failed with status: ${response.status}, message: ${result.error?.message ?? result.message}`,
                            );
                            throw new Error(
                                result.error?.message ?? result.message ?? "Error uploading file",
                            );
                        }

                        // Save metadata to MongoDB
                        const newAudioFile = new AudioFileModel({
                            email,
                            audioLink: result.data.direct_url,
                            title: null,
                            createdAt: new Date(),
                        });

                        await newAudioFile.save();

                        res.status(200).json({
                            message: "File uploaded successfully",
                            audioLink: result.data.direct_url,
                        });

                        // Clean up final file
                        fs.unlinkSync(finalFilePath);
                    } catch (uploadError) {
                        console.error("Error uploading to Tixte:", uploadError);
                        res.status(500).json({
                            message:
                                uploadError instanceof Error
                                    ? uploadError.message
                                    : "Error uploading file",
                        });
                    }
                });

                writeStream.end();
            }
        });
    } catch (error) {
        console.error("Error in upload handler:", error);
        res.status(500).json({
            message: error instanceof Error ? error.message : "Unknown error",
        });
    }
}
