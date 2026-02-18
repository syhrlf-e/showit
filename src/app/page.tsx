"use client";

import Link from "next/link";
import { ArrowRight, Database, Wand2, Share2, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { LandingEditorPreview } from "@/components/landing/LandingEditorPreview";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-text-primary overflow-x-hidden selection:bg-primary/20 selection:text-primary font-sans">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white shadow-lg shadow-primary/20">
              <Database className="w-4 h-4" />
            </div>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
              ShowIt
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors hidden sm:block"
            >
              Sign In
            </Link>
            <Link
              href="/editor"
              className="px-5 py-2 text-sm font-medium bg-white text-black rounded-full hover:bg-gray-200 transition-colors shadow-lg hover:shadow-xl"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 min-h-[90vh] flex items-center justify-center">
        {/* Background Gradients */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-primary/20 blur-[120px] rounded-full pointer-events-none opacity-30" />

        <div className="container mx-auto max-w-6xl text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-primary mb-8 hover:bg-white/10 transition-colors cursor-default">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              v1.0 Now Available
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8 bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/50">
              Transform Ideas into <br />
              <span className="text-primary bg-clip-text bg-gradient-to-r from-primary to-purple-500">
                Intelligent Schemas
              </span>
            </h1>

            <p className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed font-light">
              Designing databases shouldn't be a chore. Experience the future of
              ERD verification and generation, powered by advanced AI.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
              <Link
                href="/editor"
                className="group px-8 py-4 bg-primary text-white rounded-full font-semibold text-lg hover:bg-primary/90 transition-all hover:scale-105 active:scale-95 flex items-center gap-2 shadow-lg shadow-primary/25 ring-4 ring-primary/20"
              >
                Start Designing Free{" "}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="#"
                className="px-8 py-4 bg-white/5 text-white rounded-full font-semibold text-lg hover:bg-white/10 transition-all border border-white/10 backdrop-blur-sm"
              >
                View Documentation
              </Link>
            </div>
          </motion.div>

          {/* Editor Preview with Glassmorphism */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative mx-auto mt-10 max-w-5xl rounded-2xl border border-white/10 bg-card/40 backdrop-blur-md shadow-2xl overflow-hidden aspect-[16/9] group"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 pointer-events-none" />

            {/* Mockup Top Bar */}
            <div className="absolute top-0 left-0 right-0 h-8 bg-black/40 border-b border-white/5 flex items-center px-4 gap-2 z-20">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
              </div>
            </div>

            <LandingEditorPreview />
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-32 bg-background relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <div className="container mx-auto px-6">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Built for speed and precision
            </h2>
            <p className="text-text-secondary text-lg">
              Everything you need to architect robust databases, from concept to
              export.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard
              icon={<Wand2 className="w-6 h-6 text-white" />}
              color="bg-purple-500"
              title="AI Generation"
              desc="Describe your database in plain English. We generate tables, columns, and relationships automatically."
            />
            <FeatureCard
              icon={<Share2 className="w-6 h-6 text-white" />}
              color="bg-blue-500"
              title="Multi-Format Export"
              desc="Export to MySQL, PostgreSQL, MongoDB, or pure JSON with a single click. Production-ready code."
            />
            <FeatureCard
              icon={<Zap className="w-6 h-6 text-white" />}
              color="bg-amber-500"
              title="Real-time Visualization"
              desc="Drag, drop, and connect. Smooth 60fps canvas with smart auto-layout and precise connection lines."
            />
          </div>
        </div>
      </section>

      <footer className="py-12 border-t border-white/5 bg-[#050505]">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 font-bold text-lg">
            <div className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center text-primary">
              <Database className="w-3 h-3" />
            </div>
            ShowIt
          </div>
          <p className="text-text-secondary text-sm">
            &copy; 2026 ShowIt. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-text-secondary">
            <Link
              href="#"
              className="hover:text-text-primary transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="#"
              className="hover:text-text-primary transition-colors"
            >
              Terms
            </Link>
            <Link
              href="#"
              className="hover:text-text-primary transition-colors"
            >
              Twitter
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  desc,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  color: string;
}) {
  return (
    <div className="group p-8 rounded-3xl bg-card border border-white/5 hover:border-white/10 transition-all hover:bg-white/[0.03] hover:-translate-y-1 relative overflow-hidden">
      <div
        className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center mb-6 shadow-lg shadow-${color}/20 group-hover:scale-110 transition-transform duration-300`}
      >
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3 text-text-primary">{title}</h3>
      <p className="text-text-secondary leading-relaxed group-hover:text-text-secondary/80 transition-colors">
        {desc}
      </p>

      <div className="absolute top-0 right-0 p-32 bg-white/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </div>
  );
}
