// Motivo de arcos cian y amarillo del banner de gelsa.com.co
export default function Arcos({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 400 220" aria-hidden="true" focusable="false">
      <path d="M40 230 C 110 110, 230 45, 390 20" fill="none" stroke="var(--cian)" strokeWidth="26" strokeLinecap="round" />
      <path d="M150 235 C 200 160, 270 110, 360 90" fill="none" stroke="var(--amarillo)" strokeWidth="26" strokeLinecap="round" />
    </svg>
  );
}
