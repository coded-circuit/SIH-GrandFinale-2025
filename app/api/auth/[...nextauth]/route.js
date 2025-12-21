import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        await connectDB();
        const googleId = account.providerAccountId;
        let dbUser = await User.findOne({ googleProviderId: googleId });
        if (!dbUser) {
          dbUser = await User.findOne({ email: user.email });
        }
        if (!dbUser) {
          dbUser = await User.create({
            name: user.name,
            email: user.email,
            avatar: user.image,
            googleProviderId: googleId,
            isTooltip: true,
          });
        } else {
          if (!dbUser.googleProviderId) {
            dbUser.googleProviderId = googleId;
          }
          dbUser.name = user.name;
          dbUser.avatar = user.image;
          await dbUser.save();
        }

        return true;
      } catch (error) {
        console.error("Error in signIn callback:", error);
        return false;
      }
    },
    async session({ session, token }) {
      if (session?.user) {
        await connectDB();
        const dbUser = await User.findOne({ email: session.user.email });
        if (dbUser) {
          session.user.id = dbUser._id.toString();
          session.user.isTooltip = dbUser.isTooltip;
        }
      }
      return session;
    },
  },
  pages: {
    signIn: "/",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
