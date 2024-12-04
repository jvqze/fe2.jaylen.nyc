import { GetServerSideProps } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { FaAward, FaCrown, FaFlask } from 'react-icons/fa';
import { MdStar, MdVerified } from 'react-icons/md';

interface Badge {
    name: string;
    description: string;
    icon: string;
    type: string;
    awardedAt: string;
}

interface Profile {
    username: string;
    userID: string;
    discordAvatar: string;
    createdAt: string;
    badges: Badge[];
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

const iconMap: Record<string, JSX.Element> = {
    FaAward: <FaAward className="text-white" />,
    FaCrown: <FaCrown className="text-white" />,
    FaFlask: <FaFlask className="text-white" />,
    MdStar: <MdStar className="text-white" />,
    MdVerified: <MdVerified className="text-white" />,
};

const ProfilesPage = ({ profiles }: ProfilesPageProps) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredProfiles = profiles.filter(
        profile =>
            profile.userID.toLowerCase().includes(searchTerm.toLowerCase()) ||
            profile.username?.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    return (
        <div className="min-h-screen p-8 text-white">
            <Head>
                <title>User Profiles</title>
            </Head>
            <h1 className="mb-4 text-center text-4xl font-bold">User Profiles</h1>

            <div className="mb-6 flex justify-center">
                <input
                    type="text"
                    placeholder="Search profiles..."
                    className="w-full max-w-md rounded bg-[#31313baf] p-3 text-white focus:outline-none focus:ring-2 focus:ring-gray-600"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredProfiles.length > 0 ? (
                    filteredProfiles.map(profile => (
                        <Link key={profile.userID} href={`/profiles/${profile.userID}`}>
                            <div className="transform cursor-pointer rounded-lg bg-[#31313baf] p-4 transition hover:scale-105 hover:bg-[#3c3c46af]">
                                <div className="flex items-center space-x-4">
                                    <Image
                                        src={`${profile.discordAvatar || 'https://cdn.jaylen.nyc/r/default-profile.jpg'}`}
                                        alt={`${profile.userID}'s Avatar`}
                                        width={60}
                                        height={60}
                                        className="rounded-full shadow"
                                    />
                                    <div>
                                        <h2 className="flex items-center text-lg font-semibold text-white">
                                            <span>{profile.username || profile.userID}</span>
                                            <span className="ml-2 flex space-x-1">
                                                {profile.badges?.map((badge, index) => (
                                                    <span key={index} title={badge.name}>
                                                        {iconMap[badge.icon] || null}
                                                    </span>
                                                ))}
                                            </span>
                                        </h2>

                                        <p className="text-sm text-gray-400">
                                            Joined on{' '}
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
