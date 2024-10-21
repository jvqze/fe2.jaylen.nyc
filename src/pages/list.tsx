import { signIn, signOut, useSession } from "next-auth/react";
import Head from "next/head";
import { useEffect, useState } from "react";

export default function UploadedFilesPage(): JSX.Element {
    const { data: session } = useSession();
    const [uploadedFiles, setUploadedFiles] = useState<Array<{ link: string }>>([]);

    useEffect(() => {
        const fetchUploadedFiles = async () => {
            if (session) {
                try {
                    const res = await fetch(`/api/fe2/getFiles?email=${session.user?.email}`);
                    if (res.ok) {
                        const files = await res.json();
                        console.log("Fetched files:", files);
                        setUploadedFiles(files);
                    } else {
                        console.error("Error fetching uploaded files:", res.statusText);
                    }
                } catch (error) {
                    console.error("Error fetching uploaded files:", error);
                }
            }
        };
        fetchUploadedFiles();
    }, [session]);

    // Function to extract filename from the link
    const extractFilename = (url: string) => {
        return url.split("/").pop();
    };

    return (
        <div>
            <Head>
                <title>FE2 | Uploaded Files</title>
            </Head>

            <main className="flex min-h-screen flex-col items-center justify-center p-6">
                <h1 className="mb-6 text-4xl font-extrabold">Your Uploaded Files</h1>
                {session ? (
                    <div className="w-full max-w-md rounded-lg p-6 shadow-lg">
                        <p className="mb-4">
                            Logged in as{" "}
                            <span className="font-extrabold">{session.user?.name}</span>
                        </p>
                        <div className="mt-8">
                            <h2 className="mb-4 text-2xl font-bold">Uploaded Files</h2>
                            {uploadedFiles.length > 0 ? (
                                <ul className="space-y-2">
                                    {uploadedFiles.map((file, index) => (
                                        <li key={index} className="flex items-center space-x-2">
                                            <a
                                                href={file.link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-500 underline"
                                            >
                                                {extractFilename(file.link)}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p>No uploaded files found.</p>
                            )}
                        </div>

                        <button
                            onClick={() => signOut()}
                            className="mt-4 rounded bg-red-600 px-4 py-2 transition hover:bg-red-700"
                        >
                            Sign out
                        </button>
                    </div>
                ) : (
                    <div className="w-full max-w-md rounded-lg bg-neutral-950 p-6 text-center shadow-lg">
                        <p>You must be logged in to view your uploaded files.</p>
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
