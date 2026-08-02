const zoneIconPaths: Record<string, string> = {
  "imunitas-kuat":
    "M12 2.5 19 5.5v5.5c0 5-3 8.5-7 10-4-1.5-7-5-7-10V5.5z M8.7 12.2l2.3 2.3 4.3-4.5",
  "pencernaan-sehat": "M8 3c-.5 2-2 3-2 6 0 4.4 3.1 8 7.5 8 3 0 5.5-2 5.5-5 0-2-1.3-3.3-3-3.3-1.1 0-2 .6-2 1.8",
  "ginjal-sehat":
    "M12 4c4.4 0 7 3.6 7 8s-2.6 8-7 8c-3 0-5.5-2.2-5.5-5 0-1.8 1-2.8 2.3-3.3-1.3-.6-2.3-1.6-2.3-3.4C6.5 6.1 9 4 12 4z",
  "hati-sehat":
    "M5 8c0-2.5 2-4 4.5-4 1 0 1.8.3 2.5.8.6-.5 1.4-.8 2.3-.8 3 0 6.2 2.3 6.2 6.5 0 3.8-3 6.5-7 6.5-1.3 0-2.3-.4-3-1-.5.6-1.3 1-2.2 1C6.5 17 5 15.5 5 13.5c0-1 .4-1.8 1-2.3C5.4 10.5 5 9.5 5 8z",
  "jantung-sehat":
    "M12 20.5 4.5 13c-2-2-2-5.2 0-7.2 2-2 5.2-2 7.2 0l.3.3.3-.3c2-2 5.2-2 7.2 0 2 2 2 5.2 0 7.2L12 20.5z M7 12h2.5l1.2-2.5 2 5 1.3-2.5H17",
  "tulang-dan-sendi": "M18.2 7.2A2.4 2.4 0 1 0 15.4 5 2.4 2.4 0 0 0 18.2 7.2z M8.6 16.8A2.4 2.4 0 1 0 5.8 14.6 2.4 2.4 0 0 0 8.6 16.8z M9.3 15.1l5.4-5.4",
  "kesehatan-mulut":
    "M12 3c-2.2 0-3.6 1-4.6 1-1.3 0-2.4 1.2-2.4 3.2 0 2.5.8 4.5 1.5 6.8.5 1.7.8 3.5 1.7 5.3.4.8 1 1.2 1.6 1.2.9 0 1.2-1 1.4-2.2.2-1.3.4-2.8 1.4-2.8s1.2 1.5 1.4 2.8c.2 1.2.5 2.2 1.4 2.2.6 0 1.2-.4 1.6-1.2.9-1.8 1.2-3.6 1.7-5.3.7-2.3 1.5-4.3 1.5-6.8 0-2-1.1-3.2-2.4-3.2-1 0-2.4-1-4.6-1z",
  "anti-mikroba":
    "M16.2 12a4.2 4.2 0 1 1-8.4 0 4.2 4.2 0 0 1 8.4 0z M12 4.5v2.4M12 17.1v2.4M4.5 12h2.4M17.1 12h2.4M7 7l1.7 1.7M15.3 15.3 17 17M7 17l1.7-1.7M15.3 8.7 17 7 M5 19 19 5",
  "kesehatan-perempuan": "M18 9A6 6 0 1 1 6 9a6 6 0 0 1 12 0z M12 15v6M9 18h6",
  "gula-darah-terkendali":
    "M12 3c3 4 6 7.5 6 11a6 6 0 1 1-12 0c0-3.5 3-7 6-11z M9.5 13l1.8 1.8L15 11",
  "pernapasan-lega":
    "M12 3v5.5 M12 8.5c-.8-2-2.8-2.8-4.3-1.8C6 7.8 5.2 9.8 5.2 12.5c0 3.5 1.3 7 3.3 7 1.4 0 2-1 2-2.8V8.5z M12 8.5c.8-2 2.8-2.8 4.3-1.8 1.7 1.1 2.5 3.1 2.5 5.8 0 3.5-1.3 7-3.3 7-1.4 0-2-1-2-2.8V8.5z",
  "otak-cerdas":
    "M9.5 4c-1.8 0-3.2 1.3-3.4 3-1.6.4-2.8 1.9-2.8 3.6 0 1.5.9 2.8 2.1 3.4-.1.3-.1.6-.1 1 0 2 1.6 3.6 3.6 3.6.4 0 .8-.1 1.1-.2.4.9 1.3 1.6 2.4 1.6h.1V4h-2.6c-.1 0-.3 0-.4 0z M14.5 4c1.8 0 3.2 1.3 3.4 3 1.6.4 2.8 1.9 2.8 3.6 0 1.5-.9 2.8-2.1 3.4.1.3.1.6.1 1 0 2-1.6 3.6-3.6 3.6-.4 0-.8-.1-1.1-.2-.4.9-1.3 1.6-2.4 1.6h-.1V4h2.6c.1 0 .3 0 .4 0z",
  "anak-ceria": "M20.5 12a8.5 8.5 0 1 1-17 0 8.5 8.5 0 0 1 17 0z M8.5 14c1 1.5 2.2 2.2 3.5 2.2s2.5-.7 3.5-2.2",
  "anak-ceria-eyes": "M9 10.5h.01M15 10.5h.01",
  "kulit-cantik":
    "M12 3l1.2 4.8L18 9l-4.8 1.2L12 15l-1.2-4.8L6 9l4.8-1.2L12 3z M18 15c1 1.3 1.8 2.3 1.8 3.4a1.8 1.8 0 1 1-3.6 0c0-1.1.8-2.1 1.8-3.4z",
  "detoks-dan-antioksidan":
    "M12 3c3 4 6 7.5 6 11a6 6 0 1 1-12 0c0-3.5 3-7 6-11z M9.5 15c0-2 1.5-3.5 3.5-3.5",
  "antiinflamasi-dan-nyeri":
    "M12 3c1 3-2 4-2 7 0 1.2 1 2 2 2s2-.8 2-2c0-.8-.4-1.3-.8-1.8 1.8.6 3.3 2.4 3.3 4.8a4.5 4.5 0 1 1-9 0c0-4 2.5-6 4.5-10z M5 19 19 5",
  "antikanker-potensial":
    "M12 3l2.2 5.5 M12 3l-2.2 5.5 M9.8 8.5c-2.5.8-4.3 3-4.3 5.6a3.2 3.2 0 0 0 6-1.5 M14.2 8.5c2.5.8 4.3 3 4.3 5.6a3.2 3.2 0 0 1-6-1.5",
  "obesitas-dan-metabolik": "M4 7a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3z M15.4 12a3.4 3.4 0 1 1-6.8 0 3.4 3.4 0 0 1 6.8 0z M12 12l1.8-1.8",
  "tidur-dan-relaksasi":
    "M16.5 4.5a8 8 0 1 0 3 12.4A9.5 9.5 0 0 1 16.5 4.5z M6 6l.6 1.4L8 8l-1.4.6L6 10l-.6-1.4L4 8l1.4-.6z",
  "kesehatan-mata": "M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z",
};

const defaultIconPath = "M12 3c3 4 6 7.5 6 11a6 6 0 1 1-12 0c0-3.5 3-7 6-11z";

type ZoneIconProps = {
  zoneSlug: string;
  className?: string;
};

/**
 * Small themed line-icon per health zone, matching the favicon's white-
 * stroke-on-brand-square style. Zones are HerbaCode's health-topic
 * groupings, not a specific physical location with its own signboard photo
 * (unlike streets), so there is no real photograph to show here.
 */
export function ZoneIcon({ zoneSlug, className }: ZoneIconProps) {
  const isAnakCeria = zoneSlug === "anak-ceria";
  const path = zoneIconPaths[zoneSlug] ?? defaultIconPath;

  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.6}
      viewBox="0 0 24 24"
    >
      <path d={path} />
      {isAnakCeria ? (
        <path d={zoneIconPaths["anak-ceria-eyes"]} strokeWidth={2.6} />
      ) : null}
    </svg>
  );
}
