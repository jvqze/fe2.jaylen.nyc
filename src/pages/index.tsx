import { useSession } from "next-auth/react";
import Head from "next/head";
import { ChangeEvent, useCallback, useEffect, useState } from "react";
import { FaCheckCircle, FaCopy, FaEdit, FaSearch, FaTrashAlt, FaUpload } from "react-icons/fa";

import Modal from "../components/Modal";

const uploadDomain = "cdn.jaylen.nyc";

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
    const { data: session } = useSession();
    const [isCopied, setIsCopied] = useState<{ [key: string]: boolean }>({});
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [showModal, setShowModal] = useState(false);
    const [isPrivate, setIsPrivate] = useState(false);
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

        if (!session) {
            setNotification({ message: "You must be logged in to upload a file.", type: "error" });
            return;
        }
        setShowModal(true);
    };

    const handleModalConfirm = (isFilePrivate: boolean, title: string) => {
        setShowModal(false);
        const fileInput = document.getElementById("file-upload") as HTMLInputElement;
        if (fileInput?.files) {
            handleUpload(fileInput.files[0], isFilePrivate, title);
        }
    };

    const handleUpload = async (file: File, isPrivate: boolean, title: string) => {
        setIsUploading(true);
        let tixteApiKey: string;

        try {
            const response = await fetch("/api/getKey");
            if (!response.ok) throw new Error("Failed to get Tixte API key");
            const { tixteApiKey: apiKey } = await response.json();
            tixteApiKey = apiKey;
        } catch (error) {
            setNotification({
                message: `Error fetching upload configuration. ${error}`,
                type: "error",
            });
            setIsUploading(false);
            return;
        }

        const formData = new FormData();
        const payloadJson = JSON.stringify({
            domain: uploadDomain,
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
                setNotification({ message: "Upload failed. Please try again.", type: "error" });
                setIsUploading(false);
                return;
            }

            const result = await res.json();
            if (result.success) {
                setNotification({ message: "File uploaded successfully!", type: "success" });
                await saveToMongoose(result.data.direct_url, title, isPrivate);
                navigator.clipboard.writeText(result.data.direct_url);
                setNotification({ message: "URL copied to clipboard!", type: "success" });
            } else {
                setNotification({ message: "Upload failed. Please try again.", type: "error" });
            }
        } catch (error) {
            setNotification({ message: `Error uploading file: ${error}`, type: "error" });
        } finally {
            setIsUploading(false);
        }
    };

    const saveToMongoose = async (fileUrl: string, title: string, isPrivate: boolean) => {
        try {
            const res = await fetch("/api/saveFile", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    userid: session?.user?.email,
                    audioLink: fileUrl,
                    title: title,
                    private: isPrivate,
                    createdAt: new Date(),
                }),
            });

            if (!res.ok) throw new Error("Failed to save file to database");
        } catch (error) {
            setNotification({
                message: `We ran into some problem saving it to database. ${error}`,
                type: "error",
            });
        }
    };

    const fetchUploadedFiles = useCallback(async () => {
        if (session) {
            try {
                const res = await fetch(`/api/getFiles?userid=${session.user?.email}`);
                if (res.ok) {
                    const files = await res.json();
                    setUploadedFiles(
                        files.map((file: { name: string; link: string; createdAt: string }) => ({
                            name: file.name,
                            link: file.link,
                            createdAt: file.createdAt,
                        })),
                    );
                } else {
                    console.error("Error fetching uploaded files:", res.statusText);
                }
            } catch (error) {
                console.error("Error fetching uploaded files:", error);
            }
        }
    }, [session]);

    useEffect(() => {
        if (session) {
            fetchUploadedFiles();
        }
    }, [session, fetchUploadedFiles]);

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

                        {showModal && (
                            <Modal
                                onClose={() => setShowModal(false)}
                                onConfirm={handleModalConfirm}
                            />
                        )}

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

                                                    <button
                                                        onClick={() =>
                                                            (window.location.href = `/studio/audio?file=${encodeURIComponent(file.link)}`)
                                                        }
                                                        className="rounded bg-blue-600 p-2 transition hover:bg-blue-700"
                                                    >
                                                        <FaEdit size={16} />
                                                    </button>

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

                <p>
                    Please note that .ogg Files will mostly not work; it is recommended to use .mp3!{" "}
                    <span className="text-[#94cfff]">Microsoft Edge</span> will not work to listen
                    due to it not accepting the music data from Tixte.
                </p>

                {notification && (
                    <Notification message={notification.message} type={notification.type} />
                )}
            </main>
        </div>
    );
}
