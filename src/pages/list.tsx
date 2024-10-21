import { signIn, signOut, useSession } from "next-auth/react";
import Head from "next/head";
import { useEffect, useState } from "react";
import { FaDiscord, FaSearch, FaSignOutAlt } from "react-icons/fa";

export default function UploadedFilesPage(): JSX.Element {
    const { data: session } = useSession();
    const [uploadedFiles, setUploadedFiles] = useState<Array<{ link: string }>>([]);
    const [searchTerm, setSearchTerm] = useState<string>("");

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

    const extractFilename = (url: string) => {
        return url.split("/").pop();
    };

    const filteredFiles = uploadedFiles.filter(file =>
        extractFilename(file.link)?.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    return (
        <div>
            <Head>
                <title>FE2 | Uploaded Files</title>
            </Head>

            <main className="flex min-h-screen flex-col items-center justify-center p-6 text-white">
                <h1 className="mb-6 text-center text-4xl font-extrabold">Your Uploaded Files</h1>

                {session ? (
                    <div className="w-full max-w-lg space-y-6 rounded-lg bg-neutral-800 p-6 shadow-xl">
                        <div className="flex items-center justify-between">
                            <p className="text-lg">
                                Logged in as{" "}
                                <span className="font-extrabold">{session.user?.name}</span>
                            </p>
                            <button
                                onClick={() => signOut()}
                                className="flex items-center space-x-2 rounded bg-red-600 px-4 py-2 text-white transition hover:bg-red-700"
                            >
                                <FaSignOutAlt />
                                <span>Sign out</span>
                            </button>
                        </div>

                        <div className="relative mt-4">
                            <input
                                type="text"
                                placeholder="Search files..."
                                className="w-full rounded-md bg-black p-3 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        </div>

                        <div className="mt-6">
                            <h2 className="mb-4 text-2xl font-bold">Uploaded Files</h2>

                            {filteredFiles.length > 0 ? (
                                <ul className="space-y-4">
                                    {filteredFiles.map((file, index) => (
                                        <li
                                            key={index}
                                            className="transform rounded-lg bg-zinc-900 p-4 text-center transition hover:scale-105 hover:bg-zinc-950"
                                        >
                                            <a
                                                href={file.link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-400 transition hover:text-blue-600"
                                            >
                                                {extractFilename(file.link)}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-center text-gray-400">
                                    No uploaded files found.
                                </p>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="w-full max-w-lg rounded-lg bg-neutral-800 p-6 text-center shadow-lg">
                        <p className="mb-4">You must be logged in to view your uploaded files.</p>
                        <button
                            onClick={() => signIn("discord")}
                            className="mt-4 flex w-full items-center justify-center space-x-2 rounded bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
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
