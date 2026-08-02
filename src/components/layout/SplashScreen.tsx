export function SplashScreen() {
  return (
    <div
      aria-hidden="true"
      className="splash-screen fixed inset-0 z-[999] flex flex-col items-center justify-center gap-4 bg-herbal-cream"
    >
      <div className="splash-screen-icon flex h-20 w-20 items-center justify-center overflow-hidden rounded-[1.15rem] shadow-[0_18px_45px_rgba(12,62,34,0.22)]">
        {/* eslint-disable-next-line @next/next/no-img-element -- fixed tiny static SVG, next/image cannot optimize SVG sources */}
        <img alt="" height={80} src="/icons/leaf.svg" width={80} />
      </div>
      <p className="text-sm font-bold uppercase tracking-[0.24em] text-herbal-green">
        Kampung Herbal Berua
      </p>
    </div>
  );
}
