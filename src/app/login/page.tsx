"use client";

import { signIn } from "next-auth/react";
import { Github, Chrome, LogIn } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-text-primary p-4">
      <div className="w-full max-w-md bg-card border border-border rounded-lg shadow-xl p-8 space-y-6 animate-in fade-in zoom-in-95 duration-300">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <LogIn className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Welcome to VIDA</h1>
          <p className="text-text-secondary text-sm">
            Sign in to save your diagrams and access advanced features.
          </p>
        </div>

        <div className="space-y-4 pt-4">
          <button
            onClick={() => signIn("google", { callbackUrl: "/" })}
            className="w-full flex items-center justify-center gap-3 bg-white text-black hover:bg-gray-100 transition-colors py-2.5 px-4 rounded-md font-medium text-sm shadow-sm"
          >
            <Chrome className="w-5 h-5" />
            Continue with Google
          </button>

          <button
            onClick={() => signIn("github", { callbackUrl: "/" })}
            className="w-full flex items-center justify-center gap-3 bg-[#24292e] text-white hover:bg-[#2f363d] transition-colors py-2.5 px-4 rounded-md font-medium text-sm shadow-sm border border-transparent"
          >
            <Github className="w-5 h-5" />
            Continue with GitHub
          </button>
        </div>

        <div className="relative pt-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-text-secondary">
              Or continue as guest
            </span>
          </div>
        </div>

        <div className="text-center">
          <Link href="/" className="text-sm text-primary hover:underline">
            Go back to editor
          </Link>
        </div>
      </div>
    </div>
  );
}
