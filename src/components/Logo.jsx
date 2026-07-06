export default function Logo({ className = '' }) {
  return (
    <svg viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Sun Background */}
      <circle cx="230" cy="100" r="70" fill="#fcd34d" />
      <path d="M160 100 A70 70 0 0 0 300 100 Z" fill="#fb923c" />
      <path d="M165 125 A70 70 0 0 0 295 125 Z" fill="#f43f5e" />
      <path d="M178 150 A70 70 0 0 0 282 150 Z" fill="#e11d48" />

      {/* Speed Trails */}
      <rect x="120" y="80" width="80" height="12" rx="6" fill="#5eead4" />
      <rect x="100" y="100" width="110" height="12" rx="6" fill="#5eead4" />
      <rect x="140" y="120" width="80" height="12" rx="6" fill="#5eead4" />
      
      {/* Speed Dots */}
      <circle cx="100" cy="86" r="6" fill="#5eead4" />
      <circle cx="85" cy="106" r="6" fill="#5eead4" />
      <circle cx="120" cy="126" r="6" fill="#5eead4" />

      {/* Airplane */}
      <path
        d="M275 65 L290 60 L320 50 C325 48 330 50 330 55 L325 65 L310 70 L260 130 C258 133 255 135 250 135 L230 140 L235 105 L190 95 L170 105 L165 95 L195 80 L230 70 Z"
        fill="#0f766e"
      />
      <path
        d="M260 80 L240 60 L210 50 L230 75 Z"
        fill="#115e59"
      />
    </svg>
  );
}
