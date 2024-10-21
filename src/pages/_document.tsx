import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Document, { Head, Html, Main, NextScript } from "next/document";

export default class ADocument extends Document {
    render() {
        return (
            <Html
                lang="en"
                className="min-h-screen w-full overflow-x-hidden overscroll-none antialiased dark:bg-ThemeDark dark:text-white"
            >
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1, viewport-fit=cover"
                ></meta>
                <Head>
                    <meta charSet="utf-8" />
                    <link
                        rel="icon"
                        type="image/png"
                        href="https://avatars.githubusercontent.com/u/159128860?v=4"
                    />
                    <meta name="theme-color" content="#ffffff" />
                    <meta name="description" content="GE2 Uploader for the cool kids 😎" />

                    <link rel="preconnect" href="https://fonts.googleapis.com" />
                    <link rel="preconnect" href="https://fonts.gstatic.com" />
                    <link
                        href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400&display=swap"
                        rel="stylesheet"
                    />
                </Head>
                <body>
                    <Main />
                    <NextScript />
                    <script async src="/theme.js" />
                </body>
                <SpeedInsights />
                <Analytics />
            </Html>
        );
    }
}
