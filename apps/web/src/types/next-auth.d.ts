import "next-auth";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    address?: string;
    chainId?: number;
  }
  interface Session {
    user: {
      address?: string;
      chainId?: number;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    address?: string;
    chainId?: number;
  }
}
