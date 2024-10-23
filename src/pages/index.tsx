import { signIn, signOut, useSession } from "next-auth/react";
import Head from "next/head";
import { ChangeEvent, useEffect, useState } from "react";
import { FaCheckCircle, FaDiscord } from "react-icons/fa";
export default function Page(): JSX.Element {
    const { data: session } = useSession();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploadStatus, setUploadStatus] = useState<string>("");
    const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
    const [isCopied, setIsCopied] = useState<boolean>(false);
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [title, setTitle] = useState<string>("");

    const sanitizeTitle = (input: string) => {
        return input.replace(/[^a-zA-Z0-9]/g, "");
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (file) {
            const isValidAudio =
                file.type === "audio/mp3" ||
                file.type === "audio/mpeg" ||
                file.type === "audio/ogg";
            if (isValidAudio) {
                setUploadStatus("");
                setSelectedFile(file);
            } else {
                setUploadStatus("Please upload a valid .mp3 or .ogg file.");
                setSelectedFile(null);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setUploadStatus("");
        setUploadedUrl(null);
        setIsCopied(false);
        setIsUploading(true);
    
        if (!session) {
            setUploadStatus("You must be logged in to upload a file.");
            setIsUploading(false);
            return;
        }
    
        if (selectedFile) {
            let tixteApiKey: string;
            try {
                const response = await fetch("/api/fe2/getKey");
                if (!response.ok) {
                    throw new Error("Failed to get Tixte API key");
                }
                const { tixteApiKey: apiKey } = await response.json();
                tixteApiKey = apiKey;
            } catch (error) {
                setUploadStatus(
                    `Error fetching upload configuration: ${error instanceof Error ? error.message : "Unknown error"}`
                );
                setIsUploading(false);
                return;
            }

            const formData = new FormData();    
            const payloadJson = JSON.stringify({
                domain: "cdn.jaylen.nyc",
                name: selectedFile.name,
            });
            formData.append("payload_json", payloadJson);
            formData.append("file", selectedFile);
    
            try {
                const res = await fetch("https://api.tixte.com/v1/upload", {
                    method: "POST",
                    headers: {
                        Authorization: tixteApiKey,
                    },
                    body: formData,
                });
    
                if (!res.ok) {
                    const contentType = res.headers.get("content-type");
                    let data;
                    if (contentType && contentType.includes("application/json")) {
                        data = await res.json();
                    } else {
                        data = await res.text();
                    }
                    setUploadStatus(
                        `${data.message || data || "Upload failed. Please try again."}`
                    );
                    setIsUploading(false);
                    return;
                }
    
                const result = await res.json();
                if (result.success) {
                    setUploadStatus("File uploaded successfully. Awaiting Data saving...");
                    await saveMetadataToDatabase(result.data.direct_url, selectedFile.name);
                } else {
                    setUploadStatus(result.error?.message || "Upload failed. Please try again.");
                }
            } catch (error) {
                setUploadStatus(
                    `Error uploading file: ${error instanceof Error ? error.message : "Unknown error"}`
                );
            } finally {
                setIsUploading(false);
                setSelectedFile(null);
                setTitle("");
            }
        } else {
            setUploadStatus("Please select a file to upload.");
            setIsUploading(false);
        }
    };

    const saveMetadataToDatabase = async (fileUrl: string, fileName: string) => {
        try {
            const res = await fetch("/api/fe2/saveFile", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: session?.user?.email,
                    audioLink: fileUrl,
                    title: fileName,
                    createdAt: new Date(),
                }),
            });
    
            if (!res.ok) {
                throw new Error("Failed to save metadata to database");
            }
    
            setUploadStatus("Saved Successfully!");
            setUploadedUrl(fileUrl);
        } catch (error) {
            console.error("Error saving metadata:", error);
            setUploadStatus(
                `Error saving file metadata: ${error instanceof Error ? error.message : "Unknown error"}`
            );
        }
    };
    

    const handleCopyToClipboard = () => {
        if (uploadedUrl) {
            navigator.clipboard.writeText(uploadedUrl).then(() => {
                setIsCopied(true);
                setUploadStatus("Direct URL copied to clipboard.");
            });
        }
    };

    useEffect(() => {
        if (isCopied) {
            const timer = setTimeout(() => setIsCopied(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [isCopied]);

    return (
        <div>
            <Head>
                <title>FE2 | Audio Uploader</title>
            </Head>

            <main className="flex min-h-screen flex-col items-center justify-center p-6 text-white">
                <h1 className="text-center text-4xl font-extrabold">FE2 Audio Uploader</h1>
                <p className="mb-6 text-slate-300">
                    Some ogg files may not play on all browsers; mp3 is recommended - Thanks Lucanos
                    for the notice.
                </p>

                {session ? (
                    <div className="w-full max-w-md rounded-lg bg-neutral-800 p-6 shadow-xl">
                        <p className="mb-4 text-center">
                            Logged in as{" "}
                            <span className="font-extrabold">{session.user?.name}</span>
                        </p>

                        <form onSubmit={handleSubmit} className="flex flex-col">
                            <label
                                htmlFor="file-upload"
                                className="mb-4 cursor-pointer rounded-lg border-2 border-dashed border-gray-600 p-4 text-center transition hover:bg-gray-700"
                            >
                                {selectedFile
                                    ? selectedFile.name
                                    : "Click to upload an .mp3 or .ogg file"}
                            </label>
                            <input
                                type="file"
                                accept=".mp3, .ogg"
                                id="file-upload"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                            <button
                                type="submit"
                                disabled={isUploading}
                                className={`mb-2 mt-2 w-full rounded px-4 py-2 text-white transition ${isUploading ? "bg-green-700" : "bg-green-500 hover:bg-green-600"}`}
                            >
                                {isUploading ? (
                                    <span className="flex items-center justify-center space-x-2">
                                        <span className="loader"></span>
                                        <span className="loader h-5 w-5 animate-spin rounded-full border-4 border-green-300 border-t-transparent"></span>
                                        <span>Uploading...</span>
                                    </span>
                                ) : (
                                    "Upload"
                                )}
                            </button>

                            {uploadStatus && (
                                <p
                                    className={`text-center ${
                                        uploadStatus.toLowerCase().includes("error") ||
                                        uploadStatus.toLowerCase().includes("failed")
                                            ? "text-red-600"
                                            : "text-green-600"
                                    }`}
                                >
                                    {uploadStatus}
                                </p>
                            )}
                        </form>

                        {uploadedUrl && (
                            <div className="mb-4 flex flex-col items-center space-y-2">
                                <p className="text-blue-400 underline">{uploadedUrl}</p>
                                <button
                                    onClick={handleCopyToClipboard}
                                    className="rounded bg-gray-600 px-4 py-2 text-white transition hover:bg-gray-700"
                                >
                                    {isCopied ? (
                                        <>
                                            <FaCheckCircle className="mr-2 inline-block" />
                                            Copied!
                                        </>
                                    ) : (
                                        "Copy Direct URL to Clipboard"
                                    )}
                                </button>
                            </div>
                        )}

                        <button
                            onClick={() => signOut()}
                            className="w-full rounded bg-red-600 px-4 py-2 transition hover:bg-red-700"
                        >
                            Sign out
                        </button>
                    </div>
                ) : (
                    <div className="w-full max-w-md rounded-lg bg-neutral-800 p-6 text-center shadow-xl">
                        <p className="mb-4">You must be logged in to upload a file.</p>
                        <button
                            onClick={() => signIn("discord")}
                            className="flex w-full items-center justify-center space-x-2 rounded bg-blue-600 px-4 py-2 transition hover:bg-blue-700"
                        >
                            <FaDiscord size={20} />
                            <span>Sign in with Discord</span>
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}
