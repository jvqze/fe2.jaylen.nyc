import { useSession } from 'next-auth/react';
import { useState } from 'react';

export default function BadgesPage() {
    const { data: session } = useSession();
    const [userIdToAward, setUserIdToAward] = useState('');
    const [badgeData, setBadgeData] = useState({ name: '', description: '', icon: '', type: '' });
    const developerId = '1203092268672753785';

    if (!session || session.user.email !== developerId) {
        return (
            <div className="flex h-screen items-center justify-center">
                <h1 className="text-3xl font-bold">Forbidden</h1>
            </div>
        );
    }

    const handleAwardBadge = async () => {
        const response = await fetch('/api/giveBadge', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId: userIdToAward,
                badge: badgeData,
            }),
        });

        if (response.ok) {
            alert('Badge awarded successfully!');
        } else {
            alert('Error awarding badge');
        }
    };

    return (
        <div className="text-white">
            <div className="mx-auto p-6">
                <h1 className="mb-8 text-center text-4xl font-bold text-indigo-400">
                    Admin Badge Management
                </h1>

                <div className="mx-auto max-w-xl rounded-lg bg-gray-800 p-6 shadow-lg">
                    <h2 className="mb-4 text-2xl font-semibold">Award a Badge</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-300">
                                User ID
                            </label>
                            <input
                                type="text"
                                className="w-full rounded-md border border-gray-600 bg-gray-700 p-2 text-white outline-none focus:ring focus:ring-indigo-500"
                                placeholder="User ID"
                                value={userIdToAward}
                                onChange={e => setUserIdToAward(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-300">
                                Badge Name
                            </label>
                            <input
                                type="text"
                                className="w-full rounded-md border border-gray-600 bg-gray-700 p-2 text-white outline-none focus:ring focus:ring-indigo-500"
                                placeholder="Badge Name"
                                value={badgeData.name}
                                onChange={e => setBadgeData({ ...badgeData, name: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-300">
                                Badge Description
                            </label>
                            <input
                                type="text"
                                className="w-full rounded-md border border-gray-600 bg-gray-700 p-2 text-white outline-none focus:ring focus:ring-indigo-500"
                                placeholder="Badge Description"
                                value={badgeData.description}
                                onChange={e =>
                                    setBadgeData({ ...badgeData, description: e.target.value })
                                }
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-300">
                                Icon Name
                            </label>
                            <input
                                type="text"
                                className="w-full rounded-md border border-gray-600 bg-gray-700 p-2 text-white outline-none focus:ring focus:ring-indigo-500"
                                placeholder="Icon Name"
                                value={badgeData.icon}
                                onChange={e => setBadgeData({ ...badgeData, icon: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-300">
                                Icon Type
                            </label>
                            <input
                                type="text"
                                className="w-full rounded-md border border-gray-600 bg-gray-700 p-2 text-white outline-none focus:ring focus:ring-indigo-500"
                                placeholder="Icon Type"
                                value={badgeData.type}
                                onChange={e => setBadgeData({ ...badgeData, type: e.target.value })}
                            />
                        </div>
                        <button
                            onClick={handleAwardBadge}
                            className="mt-6 w-full rounded-md bg-indigo-500 py-2 font-semibold text-white transition duration-150 hover:bg-indigo-600"
                        >
                            Award Badge
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
