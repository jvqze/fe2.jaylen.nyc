import fs from "fs";
import path from "path";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { IncomingForm, File as FormidableFile, Files } from "formidable";
import FormData from "form-data";
import fetch from "node-fetch";

import MongooseConnect from "../../../lib/MongooseConnect";
import AudioFileModel from "../../../models/AudioFile";
import authOptions from "../auth/[...nextauth]";
import { Session } from "next-auth/core/types";

export const config = {
  api: {
    bodyParser: false,
  },
};

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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Get session to verify authentication
    await MongooseConnect();
    const session = (await getServerSession(req, res, authOptions)) as CustomSession | null;
    if (!session) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { email } = session.user;
    const form = new IncomingForm();
    const chunksDir = path.join(process.cwd(), "chunks");

    // Ensure the chunks directory exists
    if (!fs.existsSync(chunksDir)) {
      fs.mkdirSync(chunksDir);
    }

    form.parse(req, async (err: Error | null, fields: ChunkUploadFields, files: Files) => {
      if (err) {
        console.error("Error parsing files:", err);
        return res.status(500).json({ message: "Error parsing files" });
      }

      // Extract chunk information
      const chunkIndex = parseInt(
        Array.isArray(fields.chunkIndex) ? fields.chunkIndex[0] : fields.chunkIndex || "0"
      );
      const totalChunks = parseInt(
        Array.isArray(fields.totalChunks) ? fields.totalChunks[0] : fields.totalChunks || "0"
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

      // Save the chunk to disk
      const chunkPath = path.join(chunksDir, `${fileName}.part${chunkIndex}`);
      if (chunkFile?.filepath) {
        fs.renameSync(chunkFile.filepath, chunkPath);
      } else {
        return res.status(400).json({ message: "Invalid chunk file path" });
      }

      // Combine chunks if this is the last one
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
            return res.status(500).json({ message: `Missing chunk file: ${chunkPath}` });
          }
        }

        writeStream.on("finish", async () => {
          try {
            // Create a stream of the final file and send it to Tixte
            const fileStream = fs.createReadStream(finalFilePath);
            const formData = new FormData();
            formData.append("file", fileStream, fileName);

            const payloadJson = JSON.stringify({
              domain: "cdn.jaylen.nyc",
              name: fileName,
            });
            formData.append("payload_json", payloadJson);

            // Streaming request to Tixte
            const response = await fetch("https://api.tixte.com/v1/upload", {
              method: "POST",
              headers: {
                Authorization: `${process.env.TIXTE_API_KEY}`,
                ...formData.getHeaders(),
              },
              body: formData,
            });

            if (!response.ok) {
              const responseBody = await response.text();
              console.error(
                `Upload failed with status: ${response.status}, response: ${responseBody}`
              );
              return res.status(response.status).json({
                message: `Tixte upload failed: ${responseBody}`,
              });
            }

            const result = (await response.json()) as TixteResponse;

            if (!result.success) {
              console.error(
                `Upload to Tixte failed: ${result.error?.message ?? "Unknown error"}`
              );
              return res.status(500).json({
                message: result.error?.message ?? "Failed to upload to Tixte",
              });
            }

            const newFilePath = result.data.direct_url;

            // Save metadata to MongoDB
            const newAudioFile = new AudioFileModel({
              email,
              audioLink: newFilePath,
              title: fields.fileName || null,
              createdAt: new Date(),
            });

            await newAudioFile.save();

            // Stream the response back to the client
            res.setHeader("Content-Type", "application/json");
            res.write(
              JSON.stringify({
                message: "File uploaded successfully",
                audioLink: newFilePath,
              })
            );
            res.end();

            // Clean up the final file
            fs.unlinkSync(finalFilePath);
          } catch (uploadError) {
            console.error("Error uploading to Tixte:", uploadError);
            res.status(500).json({
              message: uploadError instanceof Error
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
