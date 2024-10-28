import { signIn, signOut, useSession } from "next-auth/react";
import Head from "next/head";
import { ChangeEvent, useEffect, useState } from "react";
import {
    FaCheckCircle,
    FaCopy,
    FaDiscord,
    FaSearch,
    FaSignOutAlt,
    FaTrashAlt,
    FaUpload,
    FaUser,
} from "react-icons/fa";

function Notification({ message, type }: { message: string; type: "success" | "error" | "info" }) {
    const backgroundColor =
        type === "success" ? "bg-green-600" : type === "error" ? "bg-red-600" : "bg-gray-600";

    return (
        <div
            className={`${backgroundColor} fixed bottom-4 right-4 z-50 rounded-lg p-4 text-white shadow-lg transition-all`}
        >
            {message}
        </div>
    );
}

export default function Page(): JSX.Element {
    const { data: session, status } = useSession();
    const [uploadStatus, setUploadStatus] = useState<string>("");
    const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
    const [isCopied, setIsCopied] = useState<{ [key: string]: boolean }>({});
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [uploadedFiles, setUploadedFiles] = useState<
        Array<{ link: string; name: string; createdAt: string }>
    >([]);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [notification, setNotification] = useState<{
        message: string;
        type: "success" | "error" | "info";
    } | null>(null);

    const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const isValidAudio =
            file.type === "audio/mp3" || file.type === "audio/mpeg" || file.type === "audio/ogg";

        if (!isValidAudio) {
            setNotification({ message: "Please upload a valid .mp3 or .ogg file.", type: "error" });
            return;
        }

        setUploadStatus("");
        setIsUploading(true);
        setUploadedUrl(null);

        if (!session) {
            setUploadStatus("You must be logged in to upload a file.");
            setNotification({ message: "You must be logged in to upload a file.", type: "error" });
            setIsUploading(false);
            return;
        }

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
                `Error fetching upload configuration: ${error instanceof Error ? error.message : "Unknown error"}`,
            );
            setNotification({ message: "Error fetching upload configuration.", type: "error" });
            setIsUploading(false);
            return;
        }

        const formData = new FormData();
        const payloadJson = JSON.stringify({
            domain: "cdn.jaylen.nyc",
            name: file.name,
        });
        formData.append("payload_json", payloadJson);
        formData.append("file", file);

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
                setUploadStatus(`${data.message || data || "Upload failed. Please try again."}`);
                setNotification({ message: "Upload failed. Please try again.", type: "error" });
                setIsUploading(false);
                return;
            }

            const result = await res.json();
            if (result.success) {
                setUploadStatus("File uploaded successfully. Awaiting Data saving...");
                setNotification({ message: "File uploaded successfully!", type: "success" });
                await saveToMongoose(result.data.direct_url, file.name);
                navigator.clipboard.writeText(result.data.direct_url);
                setNotification({ message: "URL copied to clipboard!", type: "success" });
            } else {
                setUploadStatus(result.error?.message || "Upload failed. Please try again.");
                setNotification({ message: "Upload failed. Please try again.", type: "error" });
            }
        } catch (error) {
            setUploadStatus(
                `Error uploading file: ${error instanceof Error ? error.message : "Unknown error"}`,
            );
            setNotification({ message: "Error uploading file.", type: "error" });
        } finally {
            setIsUploading(false);
        }
    };

    const saveToMongoose = async (fileUrl: string, fileName: string) => {
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
                throw new Error("Failed to save file to database");
            }

            setUploadStatus("Saved Successfully!");
            setUploadedUrl(fileUrl);
            fetchUploadedFiles();
        } catch (error) {
            setUploadStatus(
                `Error saving file metadata: ${error instanceof Error ? error.message : "Unknown error"}`,
            );
            setNotification({ message: "Error saving file metadata.", type: "error" });
        }
    };

    const fetchUploadedFiles = async () => {
        if (session) {
            try {
                const res = await fetch(`/api/fe2/getFiles?email=${session.user?.email}`);
                if (res.ok) {
                    const files = await res.json();
                    setUploadedFiles(files);
                } else {
                    console.error("Error fetching uploaded files:", res.statusText);
                }
            } catch (error) {
                console.error("Error fetching uploaded files:", error);
            }
        }
    };

    useEffect(() => {
        if (session) {
            fetchUploadedFiles();
        }
    }, [session]);

    const handleCopyToClipboard = (fileLink: string, index: number) => {
        navigator.clipboard.writeText(fileLink).then(() => {
            setIsCopied(prev => ({ ...prev, [index]: true }));
            setTimeout(() => {
                setIsCopied(prev => ({ ...prev, [index]: false }));
            }, 1500);
        });
    };

    const filteredFiles = uploadedFiles.filter(file =>
        file.name?.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    return (
        <div>
            <Head>
                <title>FE2 Audio Uploader</title>
            </Head>

            <main className="flex min-h-screen flex-col items-center justify-center p-6 text-white">
                <div className="fixed left-4 top-4 z-50 flex flex-col items-center">
                    {session ? (
                        <div className="relative">
                            <button
                                onClick={() => signOut()}
                                className="flex items-center space-x-2 rounded-xl bg-neutral-800 p-2 shadow-lg"
                            >
                                <FaUser size={20} />
                                {session.user?.image && (
                                    <img
                                        src={session.user.image}
                                        alt="User Avatar"
                                        className="h-10 w-10 rounded-full border-2"
                                    />
                                )}
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-1 items-center justify-center">
                            <button
                                onClick={() => signIn("discord")}
                                className="flex items-center justify-center space-x-3 rounded bg-blue-600 px-5 py-3 text-lg text-white shadow-lg transition hover:bg-blue-700"
                            >
                                <FaDiscord size={20} />
                                <span>Authorize with Discord</span>
                            </button>
                        </div>
                    )}
                </div>

                {session && (
                    <>
                        <div className="fixed right-4 top-4">
                            <label htmlFor="file-upload" className="cursor-pointer">
                                <div
                                    className={`flex items-center justify-center space-x-2 rounded-lg p-3 shadow-lg transition ${isUploading ? "cursor-not-allowed bg-gray-800" : "bg-gray-600 hover:bg-gray-700"}`}
                                >
                                    <FaUpload size={20} />
                                    <span>Upload</span>
                                </div>
                            </label>
                            <input
                                type="file"
                                accept=".mp3, .ogg"
                                id="file-upload"
                                onChange={handleFileChange}
                                className="hidden"
                                disabled={isUploading}
                            />
                        </div>

                        <div className="mt-20 w-full max-w-6xl space-y-8 rounded-lg bg-neutral-800 p-8 shadow-2xl">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search files..."
                                    className="w-full rounded-md bg-black p-3 pl-10 text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500"
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                />
                                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                            </div>

                            <div>
                                {filteredFiles.length > 0 ? (
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                        {filteredFiles.map((file, index) => (
                                            <div
                                                key={index}
                                                className="group relative rounded-lg bg-zinc-900 p-6 shadow-lg transition hover:bg-zinc-800"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="max-w-[150px] truncate text-lg font-semibold text-blue-400">
                                                        {file.name}
                                                    </div>
                                                    <div className="text-sm text-gray-400">
                                                        {new Date(
                                                            file.createdAt,
                                                        ).toLocaleDateString()}
                                                    </div>
                                                </div>

                                                <audio controls className="mt-4 w-full">
                                                    <source src={file.link} type="audio/mpeg" />
                                                    Your browser does not support the audio element.
                                                </audio>

                                                <div className="absolute right-4 top-4 flex space-x-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                                                    <button
                                                        onClick={() =>
                                                            handleCopyToClipboard(file.link, index)
                                                        }
                                                        className={`rounded p-2 ${
                                                            isCopied[index]
                                                                ? "bg-green-600 hover:bg-green-700"
                                                                : "bg-gray-600 hover:bg-gray-700"
                                                        } transition`}
                                                    >
                                                        {isCopied[index] ? (
                                                            <FaCheckCircle size={16} />
                                                        ) : (
                                                            <FaCopy size={16} />
                                                        )}
                                                    </button>

                                                    {/* Delete Button (Disabled) */}
                                                    <button
                                                        disabled
                                                        className="cursor-not-allowed rounded bg-red-900 p-2 opacity-50"
                                                    >
                                                        <FaTrashAlt size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-center text-lg text-gray-400">
                                        No uploaded files found.
                                    </p>
                                )}
                            </div>
                        </div>
                    </>
                )}

                {notification && (
                    <Notification message={notification.message} type={notification.type} />
                )}
            </main>
        </div>
    );
}
