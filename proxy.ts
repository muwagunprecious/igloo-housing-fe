import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse, type NextRequest, type NextFetchEvent } from "next/server";

const publishableKey =
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
  "pk_test_Y2xvc2UtYmVkYnVnLTYyMzQuY2xlcmsuYWNjb3VudHMuZGV2JA";

const secretKey =
  process.env.CLERK_SECRET_KEY ||
  "sk_test_YhOsk0z2Xx5fNyiGUm46fuoMSkJif4vFkA2BD9aW6P";

const handler = clerkMiddleware(
  () => {
    return NextResponse.next();
  },
  {
    publishableKey,
    secretKey,
  }
);

export default async function middleware(request: NextRequest, event: NextFetchEvent) {
  try {
    return await handler(request, event);
  } catch (err) {
    console.error("Clerk middleware warning (proceeding):", err);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/:path*",
  ],
};
