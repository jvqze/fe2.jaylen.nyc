import { signIn, signOut, useSession } from "next-auth/react";
import { useState } from "react";

export default function AccountButton() {
    const { data: session } = useSession();
    const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const tooltipWidth = 150;
        const screenWidth = window.innerWidth;

        let adjustedX = e.clientX;
        if (e.clientX + tooltipWidth / 2 > screenWidth) {
            adjustedX = screenWidth - tooltipWidth / 2 - 10;
        } else if (e.clientX - tooltipWidth / 2 < 0) {
            adjustedX = tooltipWidth / 2 + 10;
        }

        setTooltipPosition({ x: adjustedX, y: e.clientY });
    };

    return (
        <div className="fixed left-4 top-4 z-50 flex flex-col items-center">
            {session ? (
                <div
                    className="group relative"
                    onMouseMove={handleMouseMove}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    <button
                        onClick={() => signOut()}
                        className="rounded-xl bg-neutral-800 p-2 shadow-lg"
                    >
                        {session.user?.image && (
                            <img
                                src={session.user.image}
                                alt="User Avatar"
                                className="h-11 w-11 rounded-full border-2"
                            />
                        )}
                    </button>

                    {isHovered && (
                        <div
                            className="pointer-events-none absolute z-10 rounded-md bg-neutral-900 px-3 py-2 text-sm text-white shadow-lg"
                            style={{
                                top: tooltipPosition.y + 10,
                                left: tooltipPosition.x,
                                transform: "translateX(-50%)",
                                maxWidth: "150px",
                                whiteSpace: "nowrap",
                            }}
                        >
                            <p className="font-light">
                                Logged in as{" "}
                                <span className="font-semibold">{session.user?.name}</span>
                            </p>
                        </div>
                    )}
                </div>
            ) : (
                <button
                    onClick={() => signIn("discord")}
                    className="flex items-center justify-center space-x-3 rounded bg-blue-600 px-5 py-3 text-lg text-white shadow-lg transition hover:bg-blue-700"
                >
                    <span>Authorize with Discord</span>
                </button>
            )}
        </div>
    );
}
