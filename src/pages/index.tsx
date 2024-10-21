import { signIn, signOut, useSession } from "next-auth/react";
import Head from "next/head";
import { ChangeEvent, useEffect, useState } from "react";

export default function Page(): JSX.Element {
    const { data: session } = useSession();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploadStatus, setUploadStatus] = useState<string>("");
    const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
    const [isCopied, setIsCopied] = useState<boolean>(false);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (file) {
            console.log("File Type:", file.type);
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

        if (!session) {
            setUploadStatus("You must be logged in to upload a file.");
            return;
        }

        if (selectedFile) {
            const formData = new FormData();
            formData.append("audioFile", selectedFile);
            formData.append("email", session.user?.email || "");

            try {
                const res = await fetch("/api/fe2/upload", {
                    method: "POST",
                    body: formData,
                    credentials: "include",
                });

                const data = await res.json();
                console.log("data", data);

                if (res.ok) {
                    setUploadStatus("File uploaded successfully.");
                    setUploadedUrl(data.audioLink);
                    setSelectedFile(null);
                } else {
                    console.error("Upload error response:", data);
                    setUploadStatus(`${data.message || "Upload failed. Please try again."}`);
                }
            } catch (error) {
                console.error("Error uploading file:", error);
                setUploadStatus("Error uploading file.");
            }
        } else {
            setUploadStatus("Please select a file to upload.");
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

            <main className="flex min-h-screen flex-col items-center justify-center p-6">
                <h1 className="mb-6 text-4xl font-extrabold">FE2 AUDIO UPLOADER BY JVQZE</h1>
                {session ? (
                    <div className="w-full max-w-md rounded-lg p-6 shadow-lg">
                        <p className="mb-4">
                            Logged in as{" "}
                            <span className="font-extrabold">{session.user?.name}</span>
                        </p>
                        <form onSubmit={handleSubmit} className="flex flex-col">
                            <input
                                type="file"
                                accept=".mp3, .ogg"
                                onChange={handleFileChange}
                                className="mb-4 rounded border border-gray-300 p-2 transition hover:border-blue-500 focus:outline-none focus:ring focus:ring-blue-300"
                            />
                            <button
                                type="submit"
                                className="mb-2 rounded bg-blue-600 px-4 py-2 transition hover:bg-blue-700"
                            >
                                Upload
                            </button>
                            {uploadStatus && (
                                <p
                                    className={`mt-2 ${
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
                            <div className="mt-4 flex flex-col items-center space-y-2">
                                <p className="text-blue-500 underline">{uploadedUrl}</p>
                                <button
                                    onClick={handleCopyToClipboard}
                                    className="rounded bg-gray-600 px-4 py-2 text-white transition hover:bg-gray-700"
                                >
                                    {isCopied ? "Copied!" : "Copy Direct URL to Clipboard"}
                                </button>
                            </div>
                        )}

                        <button
                            onClick={() => signOut()}
                            className="mt-4 rounded bg-red-600 px-4 py-2 transition hover:bg-red-700"
                        >
                            Sign out
                        </button>
                    </div>
                ) : (
                    <div className="w-full max-w-md rounded-lg bg-neutral-950 p-6 text-center shadow-lg">
                        <p>You must be logged in to upload a file.</p>
                        <button
                            onClick={() => signIn("discord")}
                            className="mt-4 rounded bg-green-600 px-4 py-2 transition hover:bg-green-700"
                        >
                            Sign in with Discord
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}
