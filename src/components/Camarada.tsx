import React from 'react';
import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';

type Props = {
  size?: number;
};

export function Camarada({ size = 120 }: Props) {
  const h = size * 1.16;

  return (
    <Svg width={size} height={h} viewBox="0 0 120 140">
      <Circle cx="60" cy="28" r="20" fill="#D9A441" stroke="#111111" strokeWidth="5" />
      <Circle cx="60" cy="28" r="8" fill="none" stroke="#111111" strokeWidth="3" />
      <Line x1="60" y1="18" x2="60" y2="38" stroke="#111111" strokeWidth="3" />
      <Line x1="50" y1="28" x2="70" y2="28" stroke="#111111" strokeWidth="3" />

      <Path
        d="M38 54 Q60 42 82 54 L88 94 Q60 105 32 94 Z"
        fill="#B71C1C"
        stroke="#111111"
        strokeWidth="5"
      />
      <Circle cx="60" cy="73" r="12" fill="#D9A441" stroke="#111111" strokeWidth="4" />
      <Line x1="60" y1="61" x2="60" y2="85" stroke="#111111" strokeWidth="3" />
      <Line x1="48" y1="73" x2="72" y2="73" stroke="#111111" strokeWidth="3" />

      <Circle cx="31" cy="61" r="7" fill="#D9A441" stroke="#111111" strokeWidth="4" />
      <Circle cx="89" cy="61" r="7" fill="#D9A441" stroke="#111111" strokeWidth="4" />
      <Line x1="27" y1="65" x2="15" y2="92" stroke="#111111" strokeWidth="9" strokeLinecap="round" />
      <Line x1="93" y1="65" x2="105" y2="92" stroke="#111111" strokeWidth="9" strokeLinecap="round" />
      <Circle cx="13" cy="97" r="7" fill="#D9A441" stroke="#111111" strokeWidth="4" />
      <Circle cx="107" cy="97" r="7" fill="#D9A441" stroke="#111111" strokeWidth="4" />

      <Rect x="38" y="96" width="18" height="18" rx="5" fill="#D9A441" stroke="#111111" strokeWidth="4" />
      <Rect x="64" y="96" width="18" height="18" rx="5" fill="#D9A441" stroke="#111111" strokeWidth="4" />
      <Line x1="47" y1="114" x2="42" y2="132" stroke="#111111" strokeWidth="10" strokeLinecap="round" />
      <Line x1="73" y1="114" x2="78" y2="132" stroke="#111111" strokeWidth="10" strokeLinecap="round" />
    </Svg>
  );
}
