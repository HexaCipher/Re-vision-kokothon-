import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/(.*)',
  '/quiz/share/(.*)', // Public shared quiz routes
  // PWA files — must be publicly accessible or browsers get CORS-blocked
  '/manifest.json',
  '/sw.js',
])

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    // Exclude Next.js internals, static assets, and common file extensions
    // Also exclude .json so manifest.json is never intercepted by the matcher
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|json)).*)',
    '/(api|trpc)(.*)',
  ],
}
