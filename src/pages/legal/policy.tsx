import Head from "next/head";

export default function PrivacyPolicy() {
    return (
        <div className="mx-auto max-w-4xl rounded-lg p-8 text-white shadow-lg">
            <Head>
                <title>Privacy Policy</title>
            </Head>
            <h1 className="mb-6 text-center text-4xl font-extrabold">
                fe2.jaylen.nyc | Privacy Policy
            </h1>
            <p className="mb-6 text-lg">
                The Developer of <span className="font-semibold">fe2.jaylen.nyc</span> (Jaylen)
                takes your privacy seriously. This policy explains what information we collect, how
                we use it, and how we keep it secure.
            </p>

            <h2 className="mb-4 mt-10 border-b-2 border-gray-600 pb-2 text-3xl font-semibold">
                1. Information the Website collects
            </h2>
            <p className="mb-4 text-lg">
                We collect the following information when you use our Service:
            </p>
            <ul className="mb-6 list-inside list-disc space-y-2 text-lg">
                <li>
                    <strong className="text-purple-300">Discord User ID:</strong> Used to identify
                    your account and associate it with your activity.
                </li>
                <li>
                    <strong className="text-purple-300">Discord Avatar:</strong> Stored to
                    personalize your user profile.
                </li>
                <li>
                    <strong className="text-purple-300">Date of Authorization:</strong> Collected to
                    track when you authorized access to our Service.
                </li>
            </ul>

            <h2 className="mb-4 mt-10 border-b-2 border-gray-600 pb-2 text-3xl font-semibold">
                2. Purpose of Data Collection
            </h2>
            <p className="mb-6 text-lg">
                The data we collect is used to ensure the correct association of user accounts and
                maintain a secure environment. We do not share your personal data with third parties
                for marketing purposes.
            </p>

            <h2 className="mb-4 mt-10 border-b-2 border-gray-600 pb-2 text-3xl font-semibold">
                3. Data Security
            </h2>
            <p className="mb-6 text-lg">
                Measures are taken to protect your data from unauthorized access and leaks. However,
                please be aware that no method of electronic storage is 100% secure.
            </p>

            <h2 className="mb-4 mt-10 border-b-2 border-gray-600 pb-2 text-3xl font-semibold">
                4. Your Rights
            </h2>
            <p className="mb-6 text-lg">
                Depending on your jurisdiction, you may have rights to access, update, or delete
                your data per your request. If you have any questions about your data, please
                contact Jaylen at{" "}
                <a href="mailto:me@jaylen.nyc" className="text-purple-300 underline">
                    me@jaylen.nyc
                </a>
                .
            </p>

            <h2 className="mb-4 mt-10 border-b-2 border-gray-600 pb-2 text-3xl font-semibold">
                5. Changes to This Policy
            </h2>
            <p className="mb-6 text-lg">
                We may update this Privacy Policy from time to time. Changes will be posted on this
                page, and your continued use of the Service constitutes acceptance of the updated
                policy.
            </p>
        </div>
    );
}
