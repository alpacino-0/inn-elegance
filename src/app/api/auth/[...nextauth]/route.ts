import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth-options";

// Next.js 15 App Router API Route
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST }; 