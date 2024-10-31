import "../styles/globals.css";

import { SessionProvider } from "next-auth/react";
import { AppProps } from "next/app";
import Link from "next/link";

import AccountProfile from "../components/Account";

function Navbar() {
    return (
        <nav className="flex items-center justify-between bg-black p-4 text-white shadow-md">
            <h1 className="text-2xl font-semibold">
                FE2 Audio Uploader <span className="font-light">By Jaylen</span>
            </h1>
            <div className="flex items-center space-x-6">
                <Link
                    href="/`"
                    className="relative transform rounded-md bg-blue-800 px-4 py-2 text-lg font-medium shadow-lg shadow-blue-500/50 transition duration-300 ease-in-out hover:scale-105 hover:bg-blue-500 hover:shadow-none"
                >
                    Home
                    <span className="absolute inset-0 rounded-md bg-gradient-to-r from-pink-500 to-purple-500 opacity-30 blur-xl"></span>
                </Link>
                <Link
                    href="/profiles"
                    className="relative transform rounded-md bg-indigo-600 px-4 py-2 text-lg font-medium shadow-lg shadow-indigo-500/50 transition duration-300 ease-in-out hover:scale-105 hover:bg-indigo-500 hover:shadow-none"
                >
                    Profiles
                    <span className="absolute inset-0 rounded-md bg-gradient-to-r from-pink-500 to-purple-500 opacity-30 blur-xl"></span>
                </Link>
                <AccountProfile />
            </div>
        </nav>
    );
}

export default function App({
    Component,
    pageProps: { session, ...pageProps },
}: AppProps): JSX.Element {
    return (
        <SessionProvider session={session}>
            <Navbar />
            <Component {...pageProps} />
        </SessionProvider>
    );
}
