import { Layers3 } from 'lucide-react';
import { useId } from 'react';

const tiles = [
  { name: 'Hidrografia', fill: '#16594e', stroke: '#9ce1e1',
    detail: 'M137 18c0 13-21 14-11 24s-13 19-40 25c-13 3-15 11-19 15M112 55l-29-12-25 1-19-7m93 3 39 3 30-10' },
  { name: 'Relevo', fill: '#fbefce', stroke: '#9b640f',
    detail: 'M30 41q28 24 63 3t66-4 57-3M51 52q26 22 65 2t77-5m-127 12q28 16 57 0t53-3' },
  { name: 'Uso do solo', fill: '#d5ded1', stroke: '#315e50',
    detail: 'M60 47h28v20H60zm38 7h32v20H98zm42-23h25v17h-25zm35 10h26v10h-26zM39 39l150 24' },
  { name: 'Cobertura vegetal', fill: '#3d7160', stroke: '#d0e398',
    detail: 'M42 48l23-13 29 7-14 13-23 2Zm31 14 27-6 23 8-16 13Zm55-24 42-10 23 10-22 17-36-7Z' },
];

export function GisDiagram() {
  const id = useId();
  return <figure className="concept-diagram gis-diagram">
    <svg viewBox="0 0 250 231" role="img" aria-labelledby={id}>
      <title id={id}>Quatro camadas de dados sobre a mesma área</title>
      <path d="M8 52v140m234-140v140M125 8v183" fill="none" stroke="currentColor" strokeDasharray="3 4" opacity=".45" />
      {tiles.map((_, index) => {
        const layer = 3 - index;
        const tile = tiles[layer];
        return <g key={tile.name} transform={`translate(0 ${layer * 43})`}>
          <path d="m8 52 117-44 117 44-117 45Z" fill={tile.fill} stroke="#1f4e44" strokeWidth="1.2" />
          <path d={tile.detail} stroke={tile.stroke} fill={layer > 1 ? tile.stroke : 'none'} fillOpacity=".65" strokeWidth="1.5" />
        </g>;
      })}
    </svg>
    <figcaption><strong><Layers3 size={21} /> Representação em um SIG</strong>
      <p>Camadas de informação podem ser cruzadas sobre a mesma área.</p>
      <ul>{tiles.map(tile => <li key={tile.name}>{tile.name}</li>)}</ul>
    </figcaption>
  </figure>;
}
