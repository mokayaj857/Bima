"use client";

import { Button } from "@/components/ui/button";

export default function GoogleSignInButton() {
  const handleGoogleLogin = () => {
    window.location.href = "/api/auth/google"
  };

  return (
    <Button
      variant="outline"
      onClick={handleGoogleLogin}
      className="w-full h-12 rounded-2xl bg-transparent border-white/30 text-white hover:bg-white/10 font-medium"
    >
      <div className="flex items-center space-x-3">
        <svg width="20" height="20" viewBox="0 0 24 24" className="flex-shrink-0">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.26 1.05-3.71 1.05-2.86 0-5.28-1.93-6.14-4.53H2.18v2.84C3.99 20.67 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.86 14.09c-.22-.66-.35-1.37-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.01 10.01 0 0 0 2 12c0 1.61.38 3.13 1.18 4.93l2.68-2.07z"
          />
          <path
            fill="#EA4335"
            d="M12 4.84c1.62 0 3.07.56 4.21 1.65l3.15-3.15C17.46 1.02 14.97 0 12 0 7.7 0 3.99 2.33 2.18 7.07l2.68 2.07C6.72 6.77 9.14 4.84 12 4.84z"
          />
        </svg>
        <span>Sign in with Google</span>
      </div>
    </Button>
  );
}
