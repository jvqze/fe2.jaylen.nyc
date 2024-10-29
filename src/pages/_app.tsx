import "../styles/globals.css";

import { SessionProvider } from "next-auth/react";
import { AppProps } from "next/app";

import AccountButton from "../components/Account";

export default function App({
    Component,
    pageProps: { session, ...pageProps },
}: AppProps): JSX.Element {
    return (
        <SessionProvider session={session}>
            <AccountButton />
            <Component {...pageProps} />
        </SessionProvider>
    );
}
