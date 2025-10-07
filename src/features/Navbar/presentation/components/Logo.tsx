import Link from 'next/link';

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-3">
      <div className="w-9 h-9 bg-yellow-400 rounded flex items-center justify-center flex-shrink-0">
        <span className="text-black font-bold text-xl">F</span>
      </div>
      <span className="text-black text-lg hidden sm:block">
        Financial Simulator
      </span>
    </Link>
  );
}
