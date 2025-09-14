"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"

export default function GoogleRedirect() {
  const router = useRouter();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(true);

  useEffect(() => {
    const handleGoogleCallback = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        // Try different token parameters that Strapi might return
        const accessToken = params.get("access_token");
        const idToken = params.get("id_token");
        const jwt = params.get("jwt");

        // If we have a direct JWT from Strapi, use it
        if (jwt) {
          await login(jwt);
          router.push("/dashboard");
          return;
        }

        // If we have Google tokens, exchange them for Strapi JWT
        if (accessToken || idToken) {
          const response = await fetch("/api/auth/google-exchange", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              access_token: accessToken,
              id_token: idToken,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            if (data.jwt) {
              await login(data.jwt);
              router.push("/dashboard");
              return;
            }
          }
        }

        // If no valid token, show error
        setError("No valid token received from Google OAuth. Please try signing in again.");
      } catch (error) {
        setError("Google authentication failed. Please try again.");
      } finally {
        setProcessing(false);
      }
    };
    handleGoogleCallback();
  }, [router, login]);

  const handleGoogleSignIn = () => {
    window.location.href = "/api/auth/google";
  };

  if (processing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <span className="text-lg">Processing Google sign-in...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <span className="text-red-600 text-lg font-semibold">{error}</span>
        <button
          onClick={handleGoogleSignIn}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Sign in with Google
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Completing Google sign-in...</p>
      </div>
    </div>
  );
}