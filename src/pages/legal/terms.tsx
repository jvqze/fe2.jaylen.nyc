import Head from 'next/head';

export default function TermsOfService() {
    return (
        <div className="mx-auto max-w-4xl rounded-lg p-8 text-white shadow-lg">
            <Head>
                <title>Terms of Service</title>
            </Head>
            <h1 className="mb-6 text-center text-4xl font-extrabold">
                fe2.jaylen.nyc | Terms of Service
            </h1>
            <p className="mb-6 text-lg">
                By accessing and using <span className="font-semibold">fe2.jaylen.nyc</span> (the
                &quot;Service&quot;), you agree to comply with these Terms of Service. If you do not
                agree with any part of these terms, please do not use the Service.
            </p>

            <h2 className="mb-4 mt-10 border-b-2 border-gray-600 pb-2 text-3xl font-semibold">
                1. User Information Collection
            </h2>
            <p className="mb-6 text-lg">
                The website collects and stores your Discord user ID, Discord avatar, and the date
                when you authorized access to ensure the correct association of data with users and
                to maintain the security and integrity of the Service.
            </p>

            <h2 className="mb-4 mt-10 border-b-2 border-gray-600 pb-2 text-3xl font-semibold">
                2. Use of Service
            </h2>
            <p className="mb-6 text-lg">
                You agree to use the Service only for lawful purposes and in accordance with these
                terms. You are prohibited from:
            </p>
            <ul className="mb-6 list-inside list-disc space-y-2 text-lg">
                <li>
                    Engaging in any activity that could harm or disrupt the Service or other users.
                </li>
                <li>Using the Service in violation of any applicable laws or regulations.</li>
            </ul>

            <h2 className="mb-4 mt-10 border-b-2 border-gray-600 pb-2 text-3xl font-semibold">
                3. Account Responsibility
            </h2>
            <p className="mb-6 text-lg">
                You are responsible for maintaining the confidentiality of your account information.
                Any activity that occurs under your account is your responsibility.
            </p>

            <h2 className="mb-4 mt-10 border-b-2 border-gray-600 pb-2 text-3xl font-semibold">
                4. Data Security
            </h2>
            <p className="mb-6 text-lg">
                We implement measures to ensure that the data you provide (such as your private
                audios) is stored securely and not exposed to unauthorized access. However, you
                acknowledge that no system can be completely secure.
            </p>

            <h2 className="mb-4 mt-10 border-b-2 border-gray-600 pb-2 text-3xl font-semibold">
                5. Modifications to Terms
            </h2>
            <p className="mb-6 text-lg">
                We reserve the right to modify these Terms of Service at any time. Any changes will
                be posted on this page, and your continued use of the Service constitutes acceptance
                of those changes.
            </p>
        </div>
    );
}
