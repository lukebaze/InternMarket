import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { SiweMessage } from "siwe";

// next-auth beta + pnpm requires explicit NextAuthResult annotation to avoid
// TS2742 phantom-dep error on the signIn type referencing @auth/core internals.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const nextAuth = NextAuth({
  providers: [
    Credentials({
      name: "Ethereum",
      credentials: {
        message: { type: "text" },
        signature: { type: "text" },
      },
      async authorize(credentials) {
        try {
          const siwe = new SiweMessage(credentials.message as string);
          const result = await siwe.verify({
            signature: credentials.signature as string,
          });
          if (!result.success) return null;
          return {
            id: siwe.address,
            address: siwe.address,
            chainId: siwe.chainId,
          };
        } catch {
          return null;
        }
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.address = (user as { address?: string }).address;
        token.chainId = (user as { chainId?: number }).chainId;
      }
      return token;
    },
    session({ session, token }) {
      (session.user as { address?: string; chainId?: number }).address =
        token.address as string | undefined;
      (session.user as { address?: string; chainId?: number }).chainId =
        token.chainId as number | undefined;
      return session;
    },
  },
}) satisfies ReturnType<typeof NextAuth>;

export const handlers = nextAuth.handlers;
export const auth = nextAuth.auth;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const signIn = nextAuth.signIn as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const signOut = nextAuth.signOut as any;
