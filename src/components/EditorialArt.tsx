import { useId } from 'react';

export function Contours() {
  return <svg className="contour-art" viewBox="0 0 300 190" preserveAspectRatio="none" fill="none" aria-hidden="true">
    {Array.from({ length: 15 }, (_, i) => <path key={i} d="M-45 102C17 81 32 103 71 111c49 10 91-74 147-91 34-10 49 20 86 32 23 8 45 3 60-8"
      transform={`translate(0 ${i * 7 - 6})`} stroke="currentColor" strokeWidth=".8" opacity={.88 - i * .038} />)}
  </svg>;
}

export function Cartography({ className = 'mission-art' }: { className?: string }) {
  const id = useId();
  return <svg className={className} viewBox="0 0 440 290" fill="none" aria-hidden="true">
    <defs>
      <pattern id={id} width="3.3" height="3.3" patternUnits="userSpaceOnUse">
        <circle cx="1.4" cy="1.4" r=".8" fill="currentColor" />
      </pattern>
    </defs>
    <g stroke="currentColor" strokeWidth=".8">
      <circle cx="253" cy="164" r="154" opacity=".25" /><circle cx="253" cy="164" r="142" opacity=".35" />
      <circle cx="253" cy="164" r="129" />
      <ellipse cx="253" cy="164" rx="93" ry="129" /><ellipse cx="253" cy="164" rx="46" ry="129" />
      <ellipse cx="253" cy="153" rx="128" ry="43" /><ellipse cx="253" cy="110" rx="106" ry="34" />
      <path d="M124 164h258M253 35v258M101 34h285M101 164h285" strokeDasharray="4 5" opacity=".4" />
      <path d="m179 62 29-13 34 8 12 10-10 15-14 2-8 17-16 4-3 21-13 5-10 19 12 20 13 3 12 16 22 8 9 19-7 16-13 12-7 23-12 8-6-19 1-16-11-17-2-21-11-13 5-10-14-15-20-5-12-12-14-7-4-32 14-23 18-15 16-1Z"
        fill={`url(#${id})`} opacity=".72" />
      <path d="m259 47 19 2 11 7-2 13-16 12-11-4 5-13Z" fill={`url(#${id})`} opacity=".69" />
    </g>
    <g stroke="var(--ornament)" strokeWidth=".85">
      {Array.from({ length: 9 }, (_, i) => <path key={i} transform={`translate(0 ${i * 6})`} opacity={.86 - i * .06}
        d="M37 282c77-114 125-27 184-60 53-29 65-44 108-22 33 16 64 43 130 25" />)}
      <path d="m270 197 49-21 49 21-49 21-49-21Zm0 15 49 21 49-21m-98 15 49 21 49-21m-49-64v18" />
      <path d="M319 131a10 10 0 0 0-10 10c0 8 10 18 10 18s10-10 10-18a10 10 0 0 0-10-10Z" strokeWidth="1.6" />
      <circle cx="319" cy="141" r="3" fill="var(--ornament)" />
    </g>
  </svg>;
}
