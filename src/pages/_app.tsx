import "../styles/globals.css";

import { motion } from "framer-motion";
import { SessionProvider } from "next-auth/react";
import { AppProps } from "next/app";
import { useState } from "react";
import { FaBars, FaDiscord, FaGamepad, FaGithub, FaTimes } from "react-icons/fa";

import ErrorBoundary from "../components/ErrorBoundary";

export default function App({
    Component,
    pageProps: { session, ...pageProps },
}: AppProps): JSX.Element {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const icons = [
        { id: 1, name: "GitHub", icon: FaGithub, link: "https://github.com/jvqze" },
        { id: 2, name: "Steam", icon: FaGamepad, link: "https://steamcommunity.com/id/jvqze/" },
        {
            id: 3,
            name: "Discord",
            icon: FaDiscord,
            link: "https://discord.com/users/1203092268672753785",
        },
    ];

    return (
        <SessionProvider session={session}>
            <ErrorBoundary>
                <div className="mx-auto bg-ThemeDark">
                    {/*<div className="flex items-center justify-between">
                        
                        <nav className="flex-1">
                            <ul className="hidden space-x-4 px-5 py-10 md:flex">
                                <motion.li
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="shrink-0"
                                >
                                    <a
                                        className="block rounded-md py-3 font-mono text-base no-underline transition-transform dark:hover:text-white sm:inline-block sm:rounded-full sm:bg-white/0 sm:px-5 sm:font-normal sm:hover:bg-neutral-900/5 dark:sm:hover:bg-white/10 md:text-xl"
                                        href="/"
                                    >
                                        uploader
                                    </a>
                                </motion.li>

                                <motion.li
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="shrink-0"
                                >
                                    <a
                                        className="block rounded-md py-3 font-mono text-base no-underline transition-transform dark:hover:text-white sm:inline-block sm:rounded-full sm:bg-white/0 sm:px-5 sm:font-normal sm:hover:bg-neutral-900/5 dark:sm:hover:bg-white/10 md:text-xl"
                                        href="/list"
                                    >
                                        list
                                    </a>
                                </motion.li>
                            </ul>

                            <div className="md:hidden">
                                <button
                                    className="px-5 py-10 text-xl focus:outline-none"
                                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                                >
                                    {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
                                </button>
                            </div>
                        </nav>
                    </div>
                    <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: isMenuOpen ? "auto" : 0 }}
                        className="overflow-hidden md:hidden"
                    >
                        <ul className="mt-4 space-y-4">
                            <motion.li
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                className="shrink-0"
                            >
                                <a
                                    className="block rounded-md bg-white/0 px-5 py-3 font-mono text-lg font-normal no-underline hover:bg-neutral-900/5 dark:hover:bg-white/10 dark:hover:text-white"
                                    href="/"
                                >
                                    uploader
                                </a>
                            </motion.li>
                            <motion.li
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                className="shrink-0"
                            >
                                <a
                                    className="block rounded-md bg-white/0 px-5 py-3 font-mono text-lg font-normal no-underline hover:bg-neutral-900/5 dark:hover:bg-white/10 dark:hover:text-white"
                                    href="/list"
                                >
                                    list
                                </a>
                            </motion.li>
                        </ul>
                    </motion.div>*/}

                    <div>
                        <Component {...pageProps} />
                    </div>
                </div>
            </ErrorBoundary>
        </SessionProvider>
    );
}
