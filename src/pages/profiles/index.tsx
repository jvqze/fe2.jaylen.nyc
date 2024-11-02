import { GetServerSideProps } from "next";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

interface Profile {
    userID: string;
    discordAvatar: string;
    createdAt: string;
}

interface ProfilesPageProps {
    profiles: Profile[];
}

export const getServerSideProps: GetServerSideProps = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/profiles`);
    const profiles = await res.json();

    return {
        props: { profiles },
    };
};

const ProfilesPage = ({ profiles }: ProfilesPageProps) => {
    const [searchTerm, setSearchTerm] = useState("");

    const filteredProfiles = profiles.filter(profile =>
        profile.userID.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 p-8 text-white">
            <h1 className="mb-8 text-center text-4xl font-bold">User Profiles</h1>

            <div className="mb-6 flex justify-center">
                <input
                    type="text"
                    placeholder="Search profiles..."
                    className="w-full max-w-md rounded bg-gray-800 p-3 text-white focus:outline-none focus:ring-2 focus:ring-gray-600"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {filteredProfiles.length > 0 ? (
                    filteredProfiles.map(profile => (
                        <Link key={profile.userID} href={`/profiles/${profile.userID}`}>
                            <div className="transform cursor-pointer rounded-lg bg-gray-800 p-4 shadow-md transition hover:scale-105 hover:bg-gray-700">
                                <div className="flex items-center space-x-4">
                                    <Image
                                        src={`${profile.discordAvatar || "https://cdn.jaylen.nyc/r/default-profile.jpg"}`}
                                        alt={`${profile.userID}'s Avatar`}
                                        width={60}
                                        height={60}
                                        className="rounded-full shadow"
                                    />
                                    <div>
                                        <h2 className="text-lg font-semibold text-white">
                                            {profile.userID}
                                        </h2>
                                        <p className="text-sm text-gray-400">
                                            Joined on{" "}
                                            {new Date(profile.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))
                ) : (
                    <p className="col-span-full text-center text-gray-400">No profiles found.</p>
                )}
            </div>
        </div>
    );
};

export default ProfilesPage;
