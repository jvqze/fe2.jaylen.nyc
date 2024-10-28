import "../styles/globals.css";

import { SessionProvider } from "next-auth/react";
import { AppProps } from "next/app";

export default function App({
    Component,
    pageProps: { session, ...pageProps },
}: AppProps): JSX.Element {
    return (
        <SessionProvider session={session}>
            <div className="mx-auto bg-ThemeDark">
                <div>
                    <Component {...pageProps} />
                </div>
            </div>
        </SessionProvider>
    );
}
