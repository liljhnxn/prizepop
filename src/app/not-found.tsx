import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background text-mainText text-center">
      <h2 className="text-3xl font-bold mb-2">404 - Page Not Found</h2>
      <p className="text-mutedText text-sm mb-6 max-w-sm">
        The page you are looking for does not exist.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-primary text-[#15171C] hover:bg-primary-hover shadow-md transition-all"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to PrizePop Draw</span>
      </Link>
    </div>
  );
}
