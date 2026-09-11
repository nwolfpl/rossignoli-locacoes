import type { Body, Vehicle } from "@/domain/types";

export type PhotoView = "lateral" | "frente" | "painel" | "interior";

export const PHOTO_VIEWS: PhotoView[] = ["lateral", "frente", "painel", "interior"];

export const VIEW_LABELS: Record<PhotoView, string> = {
  lateral: "Lateral",
  frente: "Frente",
  painel: "Painel",
  interior: "Interior",
};

/** Silhuetas laterais por carroceria (viewBox 0 0 480 300). */
const SIDE_PATHS: Record<Body, string> = {
  Hatch:
    "M56,214 C56,186 58,168 70,160 L150,150 L196,118 C210,110 232,108 258,110 L322,118 C346,124 360,138 372,158 L410,166 C428,172 434,186 432,214 Z",
  Sedã: "M50,216 C50,188 54,170 66,162 L148,152 L198,120 C214,112 238,110 266,112 L316,120 C332,126 342,136 350,150 L426,162 C442,168 446,188 444,216 Z",
  SUV: "M52,216 C52,182 56,162 68,152 L146,140 L188,104 C202,94 228,92 256,94 L332,104 C354,112 368,126 378,148 L418,158 C436,164 440,184 438,216 Z",
  Picape:
    "M50,216 C50,188 54,168 66,158 L140,148 L182,112 C196,104 220,102 246,104 L300,112 C312,118 318,130 320,146 L322,160 L430,160 C444,162 448,184 446,216 Z",
  Minivan:
    "M52,216 C52,182 56,160 68,150 L142,136 L180,100 C194,90 222,88 252,90 L336,102 C358,110 372,126 382,148 L420,158 C438,164 442,184 440,216 Z",
};

const GLASS_PATHS: Record<Body, string> = {
  Hatch:
    "M206,126 C218,118 238,116 258,118 L318,126 C330,134 340,144 346,152 L200,152 Z",
  Sedã: "M208,128 C220,120 240,118 262,120 L312,128 C324,134 332,142 338,150 L202,150 Z",
  SUV: "M198,112 C210,102 232,100 254,102 L328,112 C344,120 356,132 362,146 L192,146 Z",
  Picape: "M192,120 C204,112 224,110 244,112 L296,120 C306,126 310,134 312,146 L188,146 Z",
  Minivan:
    "M190,108 C202,98 226,96 250,98 L332,110 C348,118 360,130 366,146 L184,146 Z",
};

const WHEELS: Record<Body, [number, number]> = {
  Hatch: [136, 352],
  Sedã: [132, 358],
  SUV: [138, 356],
  Picape: [132, 366],
  Minivan: [136, 358],
};

type Props = {
  vehicle: Vehicle;
  view?: PhotoView;
  className?: string;
  priority?: boolean;
};

const Wheel = ({ x }: { x: number }) => (
  <g>
    <circle cx={x} cy={214} r={33} fill="#14181e" />
    <circle cx={x} cy={214} r={17} fill="#9aa3ae" />
    <circle cx={x} cy={214} r={7} fill="#5b6675" />
  </g>
);

/**
 * Ilustração vetorial do veículo. O protótipo não usa fotos reais:
 * cada anúncio recebe uma composição gerada a partir da carroceria e da cor.
 */
export function VehiclePhoto({ vehicle, view = "lateral", className }: Props) {
  const gradientId = `g-${vehicle.id}-${view}`;
  const body = vehicle.colorHex;

  return (
    <svg
      viewBox="0 0 480 300"
      className={className}
      role="img"
      aria-label={`Ilustração ${VIEW_LABELS[view].toLowerCase()} — ${vehicle.brand} ${vehicle.model} ${vehicle.version}`}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f3f5f8" />
          <stop offset="62%" stopColor="#e4e8ee" />
          <stop offset="100%" stopColor="#cfd5dd" />
        </linearGradient>
        <linearGradient id={`${gradientId}-body`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={body} stopOpacity="0.95" />
          <stop offset="100%" stopColor={body} stopOpacity="0.75" />
        </linearGradient>
      </defs>

      <rect width="480" height="300" fill={`url(#${gradientId})`} />
      <circle cx="392" cy="58" r="120" fill="#ffffff" opacity="0.35" />

      {view === "lateral" && (
        <g>
          <ellipse cx="244" cy="248" rx="196" ry="16" fill="#0b0e13" opacity="0.12" />
          <path d={SIDE_PATHS[vehicle.body]} fill={`url(#${gradientId}-body)`} />
          <path d={GLASS_PATHS[vehicle.body]} fill="#1b2430" opacity="0.82" />
          <path
            d={SIDE_PATHS[vehicle.body]}
            fill="none"
            stroke="#0b0e13"
            strokeOpacity="0.25"
            strokeWidth="2"
          />
          <Wheel x={WHEELS[vehicle.body][0]} />
          <Wheel x={WHEELS[vehicle.body][1]} />
        </g>
      )}

      {view === "frente" && (
        <g>
          <ellipse cx="240" cy="252" rx="150" ry="14" fill="#0b0e13" opacity="0.12" />
          <rect x="126" y="214" width="30" height="34" rx="8" fill="#14181e" />
          <rect x="324" y="214" width="30" height="34" rx="8" fill="#14181e" />
          <path
            d="M162,150 L186,106 C192,98 206,94 240,94 C274,94 288,98 294,106 L318,150 Z"
            fill={`url(#${gradientId}-body)`}
          />
          <path
            d="M178,146 L196,114 C202,106 214,104 240,104 C266,104 278,106 284,114 L302,146 Z"
            fill="#1b2430"
            opacity="0.85"
          />
          <path
            d="M124,240 C118,208 124,178 136,164 C148,150 180,144 240,144 C300,144 332,150 344,164 C356,178 362,208 356,240 Z"
            fill={`url(#${gradientId}-body)`}
            stroke="#0b0e13"
            strokeOpacity="0.2"
            strokeWidth="2"
          />
          <path d="M140,176 L198,183 L196,199 L142,193 Z" fill="#f8fafc" opacity="0.92" />
          <path d="M340,176 L282,183 L284,199 L338,193 Z" fill="#f8fafc" opacity="0.92" />
          <rect x="206" y="178" width="68" height="18" rx="5" fill="#0b0e13" opacity="0.42" />
          <rect x="166" y="210" width="148" height="20" rx="7" fill="#0b0e13" opacity="0.22" />
          <rect x="212" y="214" width="56" height="14" rx="3" fill="#f8fafc" opacity="0.9" />
        </g>
      )}

      {view === "painel" && (
        <g>
          <rect x="0" y="150" width="480" height="150" fill="#1b2430" opacity="0.9" />
          <rect x="0" y="132" width="480" height="26" fill="#0b0e13" opacity="0.55" />
          <rect x="46" y="176" width="150" height="70" rx="14" fill="#0b0e13" opacity="0.6" />
          <circle cx="121" cy="211" r="26" fill="none" stroke="#e4e8ee" strokeWidth="5" opacity="0.7" />
          <rect x="236" y="176" width="182" height="82" rx="10" fill="#0b0e13" opacity="0.75" />
          <rect x="252" y="192" width="150" height="10" rx="5" fill={body} opacity="0.8" />
          <rect x="252" y="212" width="110" height="8" rx="4" fill="#e4e8ee" opacity="0.5" />
          <rect x="252" y="230" width="86" height="8" rx="4" fill="#e4e8ee" opacity="0.35" />
        </g>
      )}

      {view === "interior" && (
        <g>
          <rect x="0" y="120" width="480" height="180" fill="#232a35" />
          <path d="M40,300 L40,196 C40,176 58,164 82,164 L186,164 C210,164 226,178 226,198 L226,300 Z" fill="#151a22" />
          <path d="M254,300 L254,198 C254,178 270,164 294,164 L398,164 C422,164 440,176 440,196 L440,300 Z" fill="#151a22" />
          <rect x="60" y="188" width="146" height="14" rx="7" fill={body} opacity="0.55" />
          <rect x="274" y="188" width="146" height="14" rx="7" fill={body} opacity="0.55" />
          <rect x="0" y="120" width="480" height="30" fill="#0b0e13" opacity="0.5" />
        </g>
      )}

      <g opacity="0.5">
        <text
          x="446"
          y="284"
          textAnchor="end"
          fontSize="13"
          fontWeight="700"
          fill="#0b0e13"
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          RV
        </text>
      </g>
    </svg>
  );
}
