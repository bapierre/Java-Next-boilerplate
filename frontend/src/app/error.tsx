"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F0F0F]">
      <div className="text-center max-w-md px-4">
        <h1 className="text-4xl font-bold text-white mb-4">
          Something went wrong
        </h1>
        <p className="text-zinc-400 mb-8">
          An unexpected error occurred. Please try again.
        </p>
        <button
          onClick={reset}
          className="bg-[#FFBE18] hover:bg-[#e6ab15] text-black font-semibold py-2 px-6 rounded-lg transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
