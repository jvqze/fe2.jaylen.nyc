import Head from 'next/head';

export default function Home(): JSX.Element {
    return (
        <main>
            <Head>
                <title>404 | fe2.jaylen.nyc</title>
            </Head>
            <div className="mx-auto space-y-4 md:py-24">
                <div className="space-y-4 text-center">
                    <span className="text-3xl font-extrabold sm:text-4xl md:text-6xl">404</span>
                    <p className="opacity-90">This page does not exist... so... yeah</p>
                </div>
            </div>
        </main>
    );
}
