import { GetServerSideProps } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import { AiOutlineFrown } from 'react-icons/ai';

interface Upload {
    title: string;
    audioLink: string;
    createdAt: string;
}

interface UserProfile {
    username: string;
    userID: string;
    discordAvatar: string;
    uploads: Upload[];
    createdAt: string;
}

export const getServerSideProps: GetServerSideProps = async context => {
    const { userID } = context.params || {};

    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    const res = await fetch(`${baseUrl}/api/profiles/${userID}`);
    if (!res.ok) {
        return {
            notFound: true,
        };
    }

    const profile = await res.json();
    return {
        props: { profile },
    };
};

export default function UserProfilePage({ profile }: { profile: UserProfile }): JSX.Element {
    const profileHeadMsg = `${profile.username || profile.userID}'s Profile`;
    return (
        <div className="flex min-h-screen flex-col p-4 md:flex-row">
            <Head>
                <title>{profileHeadMsg}</title>
            </Head>
            <aside className="mb-6 flex flex-col items-center rounded-lg bg-[#1d1d22be] p-6 shadow-md md:mb-0 md:mr-6 md:w-1/4 md:items-start">
                <div className="mb-4 flex items-center space-x-4">
                    <Image
                        src={
                            profile.discordAvatar || 'https://cdn.jaylen.nyc/r/default-profile.jpg'
                        }
                        alt="User Avatar"
                        width={60}
                        height={60}
                        className="rounded-full shadow-md"
                    />
                    <h1 className="text-2xl font-semibold text-white">
                        {profile.username || profile.userID}
                    </h1>
                </div>

                <p className="mb-2 text-xs text-gray-400">
                    Account Created: {new Date(profile.createdAt).toLocaleDateString()}
                </p>
                <div className="text-sm font-medium text-white">
                    Uploads: {profile.uploads.length}
                </div>
            </aside>

            <main className="flex-grow rounded-lg bg-[#1d1d22be] p-6 text-white shadow-lg md:w-3/4">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {profile.uploads.length > 0 ? (
                        profile.uploads.map((upload, index) => (
                            <div
                                key={index}
                                className="transform rounded-lg bg-[#383841be] p-4 shadow-md transition-transform hover:scale-105"
                            >
                                <p className="truncate font-semibold text-white">{upload.title}</p>
                                <audio controls className="mt-3 w-full overflow-hidden rounded-lg">
                                    <source src={upload.audioLink} type="audio/mpeg" />
                                    Your browser does not support the audio element.
                                </audio>
                                <p className="mt-2 text-sm text-gray-400">
                                    Uploaded on {new Date(upload.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full flex flex-col items-center justify-center text-gray-400">
                            <AiOutlineFrown size={40} className="mb-2" />
                            <p>No uploads found.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
