import NextAuth, { NextAuthOptions } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";

export const authOptions: NextAuthOptions = {
    providers: [
        DiscordProvider({
            clientId: process.env.DISCORD_CLIENT_ID as string,
            clientSecret: process.env.DISCORD_CLIENT_SECRET as string,
        }),
    ],
    callbacks: {
        async jwt({ token, account, profile }) {
            if (account) {
                token.email = account.providerAccountId;
                token.name = profile?.username;
                token.picture = profile?.avatar
                    ? `https://cdn.discordapp.com/avatars/${account.providerAccountId}/${profile.avatar}.png`
                    : null;
            }
            return token;
        },
        async session({ session, token }) {
            session.user.email = token.email as string;
            session.user.name = token.name as string;
            session.user.image = token.picture as string;
            return session;
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);