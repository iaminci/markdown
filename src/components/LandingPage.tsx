"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FolderTree,
  Search,
  FileCode,
  Workflow,
  SquareRadical,
  Download,
  Shield,
  Zap,
  Database,
  AlertTriangleIcon,
  Github,
} from "lucide-react";

const FEATURES = [
  {
    icon: FolderTree,
    title: "Workspaces & nested folders",
    description: "Organize documents in separate workspaces. Create nested folders and mirror your file system.",
  },
  {
    icon: FileCode,
    title: "Markdown rendering",
    description: "GFM tables, code blocks with syntax highlighting, blockquotes, and more.",
  },
  {
    icon: Workflow,
    title: "Mermaid diagrams",
    description: "Flowcharts, sequence diagrams, and other diagrams directly in Markdown.",
  },
  {
    icon: SquareRadical,
    title: "KaTeX math",
    description: "Inline and block math. LaTeX syntax fully supported.",
  },
  {
    icon: Search,
    title: "Search across documents",
    description: "Find text across all documents in your workspace.",
  },
  {
    icon: Download,
    title: "Import / export",
    description: "Export workspaces to JSON. Import them back anytime. Keep backups locally.",
  },
];

const PILLARS = [
  {
    icon: Shield,
    title: "Private by default",
    description: "No accounts, no cloud, no servers. Nothing to sign up for.",
  },
  {
    icon: Zap,
    title: "Instant performance",
    description: "Everything runs in your browser. No network latency, no loading spinners.",
  },
  {
    icon: Database,
    title: "Your data stays yours",
    description: "IndexedDB and WebAssembly. Data never leaves your device.",
  },
];

const STEPS = [
  { step: 1, title: "Open the app", description: "No signup required. Click and start." },
  { step: 2, title: "Create workspace and folders", description: "Organize your Markdown files your way." },
  { step: 3, title: "Export workspace to keep backups", description: "Download JSON. Restore anytime." },
];

function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
          <span>Opsly</span>
          <span className="text-orange-500 dark:text-orange-400">MD</span>
        </Link>
        <div className="flex items-center gap-6">
          <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Features
          </a>
          <a href="#privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Privacy
          </a>
          <a
            href="https://github.com/iaminci/opsly-md"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            GitHub
          </a>
          <ThemeToggle />
          <Link
            href="/app"
            className={cn(
              "inline-flex h-7 items-center justify-center rounded-lg px-2.5 text-[0.8rem] font-medium",
              "bg-orange-600 text-white hover:bg-orange-700 dark:bg-orange-600 dark:hover:bg-orange-700"
            )}
          >
            Open App
          </Link>
        </div>
      </nav>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden px-4 py-24 sm:px-6 sm:py-32">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(249,115,22,0.08),transparent)] dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(249,115,22,0.15),transparent)]" />
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
          Local-first Markdown Workspaces
        </h1>
        <p className="mt-6 text-lg text-muted-foreground sm:text-xl">
          Write, organize, and view Markdown documents directly in your browser.
          No accounts. No cloud. Your data never leaves your device.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            href="/app"
            className={cn(buttonVariants({ size: "lg" }), "bg-orange-600 text-white hover:bg-orange-700 dark:bg-orange-600 dark:hover:bg-orange-700")}
          >
            Open App
          </Link>
          <Link href="/app" className={cn(buttonVariants({ size: "lg", variant: "outline" }))}>
            View Example
          </Link>
        </div>
        <Card className="mt-16 text-left ring-1 ring-border/50 dark:ring-border">
          <CardContent className="p-0">
            <div className="border-b border-border/50 bg-muted/30 px-4 py-2 font-mono text-xs text-muted-foreground">
              README.md
            </div>
            <pre className="overflow-x-auto p-4 font-mono text-sm leading-relaxed text-foreground">
{`# Welcome to Opsly MD

A minimal Markdown workspace that runs **entirely in your browser**.

## Features
- No accounts • No servers • No tracking
- Workspaces and nested folders
- Mermaid diagrams, LaTeX math, syntax highlighting
- Export workspaces to JSON`}
            </pre>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

function WhySection() {
  return (
    <section className="border-t border-border/50 px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Why Opsly MD Exists
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">
          Most note apps require accounts, cloud sync, and servers just to store text files.
          Opsly MD takes a different approach. Everything runs locally in your browser.
        </p>
        <div className="mt-12 grid gap-8 sm:grid-cols-3">
          {PILLARS.map(({ icon: Icon, title, description }) => (
            <Card key={title} className="ring-1 ring-border/50">
              <CardHeader>
                <div className="flex size-10 items-center justify-center rounded-lg bg-orange-500/10 dark:bg-orange-500/20">
                  <Icon className="size-5 text-orange-600 dark:text-orange-400" />
                </div>
                <CardTitle className="text-lg">{title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProductPreview() {
  return (
    <section id="features" className="border-t border-border/50 px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-center text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          A clean workspace for Markdown documents
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-muted-foreground">
          Workspace sidebar, folder tree, Markdown preview, and syntax highlighting—all in one place.
        </p>
        <div className="mt-12 overflow-hidden rounded-xl border border-border/50 bg-card shadow-lg ring-1 ring-border/30 dark:ring-border/50">
          <img
            src="/screenshot.png"
            alt="Opsly MD workspace with sidebar, folder tree, and Markdown preview"
            className="w-full object-contain"
          />
        </div>
      </div>
    </section>
  );
}

function FeaturesGrid() {
  return (
    <section className="border-t border-border/50 px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Features
        </h2>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <Card key={title} className="ring-1 ring-border/50">
              <CardHeader>
                <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                  <Icon className="size-5 text-muted-foreground" />
                </div>
                <CardTitle className="text-base">{title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function PrivacySection() {
  return (
    <section id="privacy" className="border-t border-border/50 px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Runs entirely in your browser
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">
          Opsly MD runs entirely in your browser.
        </p>
        <p className="mt-2 text-muted-foreground">
          Documents are stored locally using IndexedDB.
          SQLite runs in WebAssembly via sql.js.
        </p>
        <p className="mt-2 text-muted-foreground">
          There are no servers, accounts, or tracking.
        </p>
        <Card className="mt-8 ring-1 ring-border/50">
          <CardContent className="pt-6">
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Database className="size-4 shrink-0 text-orange-500" />
                IndexedDB for document storage
              </li>
              <li className="flex items-center gap-2">
                <Database className="size-4 shrink-0 text-orange-500" />
                sql.js for WebAssembly SQLite
              </li>
              <li className="flex items-center gap-2">
                <Shield className="size-4 shrink-0 text-orange-500" />
                Zero server round-trips for your data
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section className="border-t border-border/50 px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          How It Works
        </h2>
        <div className="mt-12 space-y-8">
          {STEPS.map(({ step, title, description }) => (
            <div key={step} className="flex gap-6">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-orange-500/10 font-semibold text-orange-600 dark:bg-orange-500/20 dark:text-orange-400">
                {step}
              </div>
              <div>
                <h3 className="font-medium text-foreground">{title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{description}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-12">
          <Link href="/app" className={cn(buttonVariants({ size: "lg" }), "bg-orange-600 text-white hover:bg-orange-700")}>
            Open App
          </Link>
        </div>
      </div>
    </section>
  );
}

function StorageNotice() {
  return (
    <section className="border-t border-border/50 px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-2xl">
        <Card className="border-amber-500/50 bg-amber-50/50 ring-1 ring-amber-500/30 dark:border-amber-600/50 dark:bg-amber-950/20 dark:ring-amber-500/20">
          <CardContent className="flex gap-4 pt-6">
            <AlertTriangleIcon className="size-5 shrink-0 text-amber-600 dark:text-amber-500" />
            <div>
              <h3 className="font-semibold text-foreground">Documents are stored locally in your browser.</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Clearing browser storage or site data may remove them.
                Export workspaces regularly to keep backups.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

function OpenSourceSection() {
  return (
    <section className="border-t border-border/50 px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Open Source
        </h2>
        <p className="mt-4 text-muted-foreground">
          Opsly MD is open source. View the code, contribute, or run it yourself.
        </p>
        <a href="https://github.com/iaminci/opsly-md" target="_blank" rel="noopener noreferrer" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "mt-6 inline-flex items-center gap-2")}>
          <Github className="size-4" />
          View on GitHub
        </a>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border/50 px-4 py-12 sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 sm:flex-row">
        <div className="flex items-center gap-2 font-semibold">
          <span>Opsly</span>
          <span className="text-orange-500 dark:text-orange-400">MD</span>
        </div>
        <p className="text-sm text-muted-foreground">
          Local-first Markdown workspaces.
        </p>
        <div className="flex gap-6">
          <a
            href="https://github.com/iaminci/opsly-md"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            GitHub
          </a>
          <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
            Docs
          </a>
          <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
            Issues
          </a>
        </div>
      </div>
    </footer>
  );
}

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <WhySection />
        <ProductPreview />
        <FeaturesGrid />
        <PrivacySection />
        <HowItWorks />
        <StorageNotice />
        <OpenSourceSection />
      </main>
      <Footer />
    </div>
  );
}
