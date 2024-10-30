import { GetServerSideProps } from "next";
import Image from "next/image";
import { useEffect, useState } from "react";

interface Upload {
    name: string;
    link: string;
    createdAt: string;
}

interface UserProfile {
    userID: string;
    discordAvatar: string;
    uploads: Upload[];
    createdAt: string;
}

export const getServerSideProps: GetServerSideProps = async context => {
    const { userID } = context.params || {};

    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    const res = await fetch(`${baseUrl}/api/getFiles?userid=${userID}`);
    if (!res.ok) {
        return {
            notFound: true,
        };
    }

    const uploads = await res.json();
    return {
        props: { uploads, userID },
    };
};


const UserProfilePage = ({ uploads, userID }: { uploads: Upload[]; userID: string }) => {
    const [profile, setProfile] = useState<UserProfile | null>(null);

    useEffect(() => {
        async function fetchProfile() {
            const res = await fetch(`/api/profile/${userID}`);
            if (res.ok) {
                const data = await res.json();
                setProfile(data);
            } else {
                console.error("Failed to fetch profile data.");
            }
        }

        if (userID) {
            fetchProfile();
        }
    }, [userID]);

    if (!profile) return <p className="text-center text-lg text-gray-300">User not found</p>;

    return (
        <div className="flex min-h-screen flex-col bg-gradient-to-br from-gray-900 via-black to-gray-800 p-4 md:flex-row">
            <aside className="mb-6 flex flex-col items-center rounded-lg bg-gradient-to-b from-gray-800 to-black p-6 shadow-md md:mb-0 md:mr-6 md:w-1/4 md:items-start">
                <Image
                    src={profile.discordAvatar}
                    alt="User Avatar"
                    width={100}
                    height={100}
                    className="mb-4 rounded-full shadow-lg"
                />
                <h1 className="mb-2 text-3xl font-bold text-white">{profile.userID}</h1>
                <p className="mb-2 text-sm text-gray-400">
                    Account Created: {new Date(profile.createdAt).toLocaleDateString()}
                </p>
                <div className="text-lg font-semibold text-white">
                    Uploads: {profile.uploads.length}
                </div>
            </aside>

            <main className="flex-grow rounded-lg bg-gradient-to-b from-gray-800 to-black p-6 text-white shadow-lg md:w-3/4">
                <h2 className="mb-4 text-center text-2xl font-semibold">Uploads</h2>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {uploads.length > 0 ? (
                        uploads.map((upload, index) => (
                            <div
                                key={index}
                                className="transform rounded-lg bg-gray-700 p-4 shadow-md transition-transform hover:scale-105"
                            >
                                <p className="truncate font-semibold text-white">{upload.name}</p>
                                <audio controls className="mt-3 w-full overflow-hidden rounded-lg">
                                    <source src={upload.link} type="audio/mpeg" />
                                    Your browser does not support the audio element.
                                </audio>
                                <p className="mt-2 text-sm text-gray-400">
                                    Uploaded on {new Date(upload.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        ))
                    ) : (
                        <p className="col-span-full text-center text-gray-400">No uploads found.</p>
                    )}
                </div>
            </main>
        </div>
    );
};

export default UserProfilePage;
