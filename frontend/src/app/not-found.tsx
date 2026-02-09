import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F0F0F]">
      <div className="text-center max-w-md px-4">
        <h1 className="text-6xl font-bold text-white mb-4">404</h1>
        <p className="text-zinc-400 mb-8">
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link
          href="/"
          className="bg-[#FFBE18] hover:bg-[#e6ab15] text-black font-semibold py-2 px-6 rounded-lg transition-colors inline-block"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
