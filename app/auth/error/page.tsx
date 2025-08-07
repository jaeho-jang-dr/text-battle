"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const getErrorMessage = () => {
    switch (error) {
      case "Configuration":
        return "There is a problem with the server configuration.";
      case "AccessDenied":
        return "You do not have permission to sign in.";
      case "Verification":
        return "The verification token has expired or has already been used.";
      case "OAuthSignin":
        return "Error in constructing an authorization URL.";
      case "OAuthCallback":
        return "Error in handling the response from the OAuth provider.";
      case "OAuthCreateAccount":
        return "Could not create OAuth provider user in the database.";
      case "EmailCreateAccount":
        return "Could not create email provider user in the database.";
      case "Callback":
        return "Error in the OAuth callback handler route.";
      case "OAuthAccountNotLinked":
        return "This account is already linked with another provider.";
      case "EmailSignin":
        return "The e-mail could not be sent.";
      case "CredentialsSignin":
        return "Sign in failed. Check the details you provided are correct.";
      default:
        return "An unexpected error occurred.";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-900 to-purple-900">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 w-full max-w-md">
        <div className="text-center">
          <div className="mb-6">
            <svg
              className="w-20 h-20 mx-auto text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          <h1 className="text-3xl font-bold text-white mb-4">
            Authentication Error
          </h1>

          <p className="text-white/80 mb-8">
            {getErrorMessage()}
          </p>

          <div className="space-y-3">
            <Link
              href="/auth/email"
              className="block w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-center"
            >
              Try Again
            </Link>

            <Link
              href="/"
              className="block w-full py-3 px-4 bg-white/20 text-white font-bold rounded-lg hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all text-center"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}