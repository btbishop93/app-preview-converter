import { FileQuestion } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-neutral-950 p-8 text-center">
      <div className="mb-8 rounded-full bg-neutral-900 p-6">
        <FileQuestion className="h-16 w-16 text-cyan-400" />
      </div>

      <h1 className="mb-4 text-2xl font-bold text-white">Page Not Found</h1>

      <p className="mb-6 max-w-sm text-neutral-400 leading-relaxed">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>

      <Link
        href="/"
        className="rounded-lg bg-neutral-800 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-neutral-700"
      >
        Go Home
      </Link>
    </div>
  );
}
