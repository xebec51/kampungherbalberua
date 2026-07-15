import Link from "next/link";

export function Logo() {
  return (
    <Link
      href="/"
      className="inline-flex items-center gap-3 rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-herbal-brown"
      aria-label="Kampung Herbal Berua"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-md bg-herbal-green text-white shadow-sm">
        <svg
          aria-hidden="true"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M19.5 4.5C12 4.8 6.6 8.2 5.1 14.1c-.7 2.8.5 4.9 2.7 5.4 5.9 1.3 10.7-5.7 11.7-15Z"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.7"
          />
          <path
            d="M5.5 18.5c2.7-4.4 6-7.1 10.2-8.5"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="1.7"
          />
        </svg>
      </span>
      <span className="leading-tight">
        <span className="block text-sm font-bold text-herbal-ink">
          Kampung Herbal
        </span>
        <span className="block text-xs font-medium text-herbal-muted">
          Berua RT 009/RW 006
        </span>
      </span>
    </Link>
  );
}
