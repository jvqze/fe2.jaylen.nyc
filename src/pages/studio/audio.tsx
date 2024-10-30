import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { FaCheckCircle, FaCopy } from "react-icons/fa";

const isValidAudioUrl = (url: string) => {
    try {
        const parsedUrl = new URL(url);
        return parsedUrl.protocol === "https:" && parsedUrl.hostname === "cdn.jaylen.nyc";
    } catch {
        return false;
    }
};

export default function AudioStudio() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const { file } = router.query;

    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [startTime, setStartTime] = useState<number>(0);
    const [endTime, setEndTime] = useState<number | null>(null);
    const [newAudioUrl, setNewAudioUrl] = useState<string | null>(null);
    const [uploadedAudioUrl, setUploadedAudioUrl] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [isCopied, setIsCopied] = useState<boolean>(false);
    useEffect(() => {
        if (typeof file === "string" && isValidAudioUrl(file)) {
            setAudioUrl(file);
        } else {
            console.error("Invalid audio URL.");
        }
    }, [file]);

    const handleTrimAudio = async () => {
        if (!audioUrl || endTime === null || startTime >= endTime) {
            alert("Please set a valid start and end time.");
            return;
        }

        setIsProcessing(true);

        try {
            const response = await fetch("/api/AudioTrim", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    audioUrl,
                    startTime,
                    endTime,
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error("Error response from API:", errorText);
                alert("Error from the server: " + response.status);
                return;
            }

            const data = await response.json();
            if (data.success) {
                setNewAudioUrl(data.trimmedAudioUrl);
            } else {
                alert("Audio trimming failed.");
            }
        } catch (error) {
            console.error("Error trimming audio:", error);
            alert("An error occurred while trimming the audio.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleUploadNewAudio = async () => {
        if (!newAudioUrl) return;
        setIsUploading(true);

        try {
            const keyResponse = await fetch("/api/getKey");
            const { tixteApiKey } = await keyResponse.json();
            const audioResponse = await fetch(newAudioUrl);
            const audioBlob = await audioResponse.blob();
            const audioFile = new File([audioBlob], `Trimmed_Audio_${Date.now()}.mp3`, {
                type: "audio/mpeg",
            });

            const formData = new FormData();
            const payloadJson = JSON.stringify({
                domain: "cdn.jaylen.nyc",
                name: audioFile.name,
            });
            formData.append("payload_json", payloadJson);
            formData.append("file", audioFile);

            const uploadResponse = await fetch("https://api.tixte.com/v1/upload", {
                method: "POST",
                headers: { Authorization: tixteApiKey },
                body: formData,
            });

            const uploadData = await uploadResponse.json();
            if (uploadData.success) {
                const trimmedAudioLink = uploadData.data.direct_url;
                setUploadedAudioUrl(trimmedAudioLink);
                await fetch("/api/saveFile", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        userid: session?.user?.email,
                        audioLink: trimmedAudioLink,
                        title: audioFile.name,
                        createdAt: new Date(),
                    }),
                });

                alert("Trimmed audio uploaded and saved successfully!");
            } else {
                alert("Failed to upload audio to Tixte.");
            }
        } catch (error) {
            console.error("Error uploading trimmed audio:", error);
            alert("An error occurred while uploading the trimmed audio.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleCopyToClipboard = () => {
        if (uploadedAudioUrl) {
            navigator.clipboard.writeText(uploadedAudioUrl).then(() => {
                setIsCopied(true);
                setTimeout(() => setIsCopied(false), 2000);
            });
        }
    };

    if (status === "loading") {
        return <p className="text-white">Loading...</p>;
    }

    if (!session) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-black via-black to-gray-950 p-8 text-white">
                <h1 className="mb-2 text-3xl font-extrabold text-gray-100">Audio Studio</h1>
                <p className="mb-4 text-sm text-gray-400">
                    Please authorize with Discord to continue.
                </p>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-black via-black to-gray-950 p-8 text-white">
            <h1 className="mb-2 text-3xl font-extrabold text-gray-100">Audio Studio</h1>
            <p className="mb-4 text-sm text-gray-400">
                Trimming your audio is best for the best gameplay!
            </p>
            {audioUrl ? (
                <>
                    <audio
                        controls
                        src={audioUrl}
                        className="my-4 w-full max-w-md rounded-lg shadow-lg"
                    >
                        Your browser does not support the audio element.
                    </audio>

                    <div className="w-full max-w-md space-y-4">
                        <div className="flex items-center justify-between">
                            <label htmlFor="start-time" className="font-semibold text-gray-200">
                                Start Time (seconds)
                            </label>
                            <input
                                type="number"
                                id="start-time"
                                step="any"
                                className="w-20 rounded bg-gray-800 p-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-600"
                                value={startTime}
                                min="0"
                                max={endTime || 0}
                                onChange={e => setStartTime(parseFloat(e.target.value) || 0)}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <label htmlFor="end-time" className="font-semibold text-gray-200">
                                End Time (seconds)
                            </label>
                            <input
                                type="number"
                                id="end-time"
                                step="any"
                                className="w-20 rounded bg-gray-800 p-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-600"
                                value={endTime ?? ""}
                                min={startTime}
                                onChange={e => setEndTime(parseFloat(e.target.value) || null)}
                            />
                        </div>

                        <button
                            onClick={handleTrimAudio}
                            disabled={isProcessing}
                            className={`mt-6 w-full rounded-lg py-3 text-center font-semibold ${
                                isProcessing
                                    ? "cursor-not-allowed bg-gray-700"
                                    : "bg-gray-700 transition hover:bg-gray-600"
                            } text-gray-100`}
                        >
                            {isProcessing ? "Processing..." : "Trim Audio"}
                        </button>
                    </div>

                    {newAudioUrl && (
                        <div className="mt-8 w-full max-w-md rounded-lg bg-gray-900 p-4 shadow-lg">
                            <h2 className="mb-2 text-lg font-bold text-gray-100">Trimmed Audio</h2>
                            <audio controls src={newAudioUrl} className="w-full rounded">
                                Your browser does not support the audio element.
                            </audio>
                            <button
                                onClick={handleUploadNewAudio}
                                disabled={isUploading}
                                className={`mt-4 w-full rounded-lg py-3 text-center font-semibold ${
                                    isUploading
                                        ? "cursor-not-allowed bg-gray-700"
                                        : "bg-blue-500 transition hover:bg-blue-600"
                                } text-gray-100`}
                            >
                                {isUploading ? "Uploading..." : "Upload as New"}
                            </button>
                        </div>
                    )}

                    {uploadedAudioUrl && (
                        <div className="mt-8 w-full max-w-md rounded-lg bg-gray-800 p-4 shadow-md">
                            <h3 className="mb-2 text-gray-200">Uploaded Audio</h3>
                            <p className="break-all text-sm text-blue-400 underline">
                                {uploadedAudioUrl}
                            </p>
                            <button
                                onClick={handleCopyToClipboard}
                                className={`mt-2 flex items-center justify-center rounded-lg px-4 py-2 font-semibold ${
                                    isCopied ? "bg-green-600" : "bg-gray-700 hover:bg-gray-600"
                                } text-white transition`}
                            >
                                {isCopied ? (
                                    <>
                                        <FaCheckCircle className="mr-2" />
                                        Copied!
                                    </>
                                ) : (
                                    <>
                                        <FaCopy className="mr-2" />
                                        Copy to Clipboard
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </>
            ) : (
                <p className="text-gray-400">Loading audio...</p>
            )}
        </div>
    );
}
