import React from 'react';
import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';

const INK = '#111111';
const RED = '#B71C1C';
const YELLOW = '#D9A441';
const PAPER = '#F1E5C8';

function Dummy({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <>
      <Circle cx={x} cy={y} r={7 * scale} fill={YELLOW} stroke={INK} strokeWidth={2.5} />
      <Line x1={x} y1={y + 7 * scale} x2={x} y2={y + 27 * scale} stroke={INK} strokeWidth={5 * scale} strokeLinecap="round" />
      <Line x1={x} y1={y + 15 * scale} x2={x - 12 * scale} y2={y + 25 * scale} stroke={INK} strokeWidth={4 * scale} strokeLinecap="round" />
      <Line x1={x} y1={y + 15 * scale} x2={x + 12 * scale} y2={y + 25 * scale} stroke={INK} strokeWidth={4 * scale} strokeLinecap="round" />
      <Line x1={x} y1={y + 27 * scale} x2={x - 10 * scale} y2={y + 42 * scale} stroke={INK} strokeWidth={4 * scale} strokeLinecap="round" />
      <Line x1={x} y1={y + 27 * scale} x2={x + 10 * scale} y2={y + 42 * scale} stroke={INK} strokeWidth={4 * scale} strokeLinecap="round" />
    </>
  );
}

export function EquipmentSketch({ name }: { name: string }) {
  const n = name.toLowerCase();

  if (n.includes('esteira') || n.includes('caminhada')) {
    return (
      <Svg width="100%" height={110} viewBox="0 0 220 110">
        <Rect x="18" y="82" width="165" height="10" rx="4" fill={INK} />
        <Line x1="170" y1="82" x2="193" y2="28" stroke={INK} strokeWidth="6" />
        <Rect x="181" y="20" width="25" height="15" rx="2" fill={RED} stroke={INK} strokeWidth="3" />
        <Circle cx="43" cy="95" r="6" fill={YELLOW} stroke={INK} strokeWidth="3" />
        <Circle cx="163" cy="95" r="6" fill={YELLOW} stroke={INK} strokeWidth="3" />
        <Dummy x={104} y={29} scale={0.95} />
        <Path d="M80 70 Q102 58 124 70" fill="none" stroke={RED} strokeWidth="3" strokeDasharray="5 4" />
      </Svg>
    );
  }

  if (n.includes('leg press')) {
    return (
      <Svg width="100%" height={110} viewBox="0 0 220 110">
        <Path d="M26 93 L68 34 L162 34 L197 93" fill="none" stroke={INK} strokeWidth="7" />
        <Rect x="142" y="22" width="14" height="63" fill={RED} stroke={INK} strokeWidth="3" transform="rotate(-18 149 54)" />
        <Rect x="45" y="67" width="47" height="11" rx="3" fill={INK} transform="rotate(-35 68 72)" />
        <Circle cx="87" cy="54" r="7" fill={YELLOW} stroke={INK} strokeWidth="3" />
        <Line x1="92" y1="59" x2="113" y2="71" stroke={INK} strokeWidth="6" strokeLinecap="round" />
        <Line x1="112" y1="70" x2="143" y2="56" stroke={INK} strokeWidth="6" strokeLinecap="round" />
        <Line x1="112" y1="70" x2="143" y2="73" stroke={INK} strokeWidth="6" strokeLinecap="round" />
        <Path d="M157 50 L178 39" stroke={RED} strokeWidth="4" />
        <Path d="M172 35 L182 37 L177 47" fill={RED} />
      </Svg>
    );
  }

  if (n.includes('flexora')) {
    return (
      <Svg width="100%" height={110} viewBox="0 0 220 110">
        <Rect x="36" y="61" width="92" height="12" rx="4" fill={INK} />
        <Line x1="48" y1="73" x2="40" y2="95" stroke={INK} strokeWidth="6" />
        <Line x1="118" y1="73" x2="126" y2="95" stroke={INK} strokeWidth="6" />
        <Rect x="163" y="22" width="22" height="69" fill={PAPER} stroke={INK} strokeWidth="5" />
        <Circle cx="77" cy="47" r="7" fill={YELLOW} stroke={INK} strokeWidth="3" />
        <Line x1="85" y1="51" x2="115" y2="62" stroke={INK} strokeWidth="6" strokeLinecap="round" />
        <Line x1="112" y1="63" x2="144" y2="68" stroke={INK} strokeWidth="6" strokeLinecap="round" />
        <Circle cx="148" cy="66" r="8" fill={RED} stroke={INK} strokeWidth="3" />
        <Path d="M145 72 Q155 55 161 45" fill="none" stroke={RED} strokeWidth="4" />
      </Svg>
    );
  }

  if (n.includes('extensora')) {
    return (
      <Svg width="100%" height={110} viewBox="0 0 220 110">
        <Rect x="48" y="47" width="46" height="12" fill={INK} />
        <Rect x="48" y="24" width="12" height="35" fill={INK} />
        <Line x1="57" y1="59" x2="48" y2="95" stroke={INK} strokeWidth="6" />
        <Line x1="92" y1="59" x2="101" y2="95" stroke={INK} strokeWidth="6" />
        <Rect x="164" y="18" width="24" height="76" fill={PAPER} stroke={INK} strokeWidth="5" />
        <Dummy x={82} y={26} scale={0.72} />
        <Line x1="82" y1="54" x2="119" y2="72" stroke={INK} strokeWidth="6" strokeLinecap="round" />
        <Line x1="118" y1="72" x2="149" y2="50" stroke={INK} strokeWidth="6" strokeLinecap="round" />
        <Circle cx="150" cy="50" r="8" fill={RED} stroke={INK} strokeWidth="3" />
        <Path d="M138 72 Q151 62 157 48" fill="none" stroke={RED} strokeWidth="4" />
      </Svg>
    );
  }

  if (n.includes('voador') || n.includes('peck')) {
    return (
      <Svg width="100%" height={110} viewBox="0 0 220 110">
        <Rect x="96" y="18" width="28" height="78" fill={PAPER} stroke={INK} strokeWidth="5" />
        <Line x1="110" y1="28" x2="45" y2="48" stroke={INK} strokeWidth="6" />
        <Line x1="110" y1="28" x2="175" y2="48" stroke={INK} strokeWidth="6" />
        <Circle cx="110" cy="45" r="7" fill={YELLOW} stroke={INK} strokeWidth="3" />
        <Line x1="110" y1="52" x2="110" y2="78" stroke={INK} strokeWidth="6" />
        <Line x1="109" y1="60" x2="70" y2="50" stroke={INK} strokeWidth="5" strokeLinecap="round" />
        <Line x1="111" y1="60" x2="150" y2="50" stroke={INK} strokeWidth="5" strokeLinecap="round" />
        <Path d="M57 39 Q70 28 84 38" fill="none" stroke={RED} strokeWidth="4" />
        <Path d="M136 38 Q150 28 163 39" fill="none" stroke={RED} strokeWidth="4" />
      </Svg>
    );
  }

  if (n.includes('supino') || n.includes('peitoral')) {
    return (
      <Svg width="100%" height={110} viewBox="0 0 220 110">
        <Rect x="45" y="50" width="28" height="42" fill={PAPER} stroke={INK} strokeWidth="5" />
        <Rect x="50" y="70" width="58" height="10" fill={INK} />
        <Line x1="168" y1="21" x2="168" y2="94" stroke={INK} strokeWidth="7" />
        <Line x1="165" y1="44" x2="127" y2="58" stroke={INK} strokeWidth="5" />
        <Circle cx="91" cy="48" r="7" fill={YELLOW} stroke={INK} strokeWidth="3" />
        <Line x1="93" y1="55" x2="99" y2="76" stroke={INK} strokeWidth="6" />
        <Line x1="99" y1="61" x2="130" y2="55" stroke={INK} strokeWidth="5" strokeLinecap="round" />
        <Path d="M126 42 L148 39" stroke={RED} strokeWidth="4" />
        <Path d="M145 34 L155 39 L146 45" fill={RED} />
      </Svg>
    );
  }

  if (n.includes('puxada')) {
    return (
      <Svg width="100%" height={110} viewBox="0 0 220 110">
        <Rect x="164" y="15" width="24" height="80" fill={PAPER} stroke={INK} strokeWidth="5" />
        <Line x1="176" y1="20" x2="176" y2="37" stroke={INK} strokeWidth="4" />
        <Line x1="89" y1="32" x2="176" y2="32" stroke={INK} strokeWidth="5" />
        <Line x1="92" y1="29" x2="71" y2="29" stroke={INK} strokeWidth="5" />
        <Rect x="77" y="78" width="65" height="9" fill={INK} />
        <Dummy x={110} y={49} scale={0.78} />
        <Line x1="101" y1="62" x2="82" y2="35" stroke={INK} strokeWidth="4" />
        <Line x1="119" y1="62" x2="138" y2="35" stroke={INK} strokeWidth="4" />
        <Path d="M147 42 L147 62" stroke={RED} strokeWidth="4" />
        <Path d="M141 58 L147 69 L153 58" fill={RED} />
      </Svg>
    );
  }

  if (n.includes('remada')) {
    return (
      <Svg width="100%" height={110} viewBox="0 0 220 110">
        <Rect x="167" y="21" width="22" height="71" fill={PAPER} stroke={INK} strokeWidth="5" />
        <Rect x="70" y="76" width="62" height="9" fill={INK} />
        <Circle cx="103" cy="43" r="7" fill={YELLOW} stroke={INK} strokeWidth="3" />
        <Line x1="103" y1="50" x2="101" y2="72" stroke={INK} strokeWidth="6" />
        <Line x1="100" y1="58" x2="137" y2="58" stroke={INK} strokeWidth="5" />
        <Line x1="137" y1="58" x2="168" y2="48" stroke={INK} strokeWidth="2" />
        <Path d="M145 42 L125 42" stroke={RED} strokeWidth="4" />
        <Path d="M128 36 L117 42 L128 48" fill={RED} />
      </Svg>
    );
  }

  if (n.includes('desenvolvimento') || n.includes('ombro') || n.includes('lateral')) {
    return (
      <Svg width="100%" height={110} viewBox="0 0 220 110">
        <Rect x="55" y="65" width="52" height="10" fill={INK} />
        <Rect x="55" y="32" width="10" height="43" fill={INK} />
        <Rect x="166" y="17" width="22" height="77" fill={PAPER} stroke={INK} strokeWidth="5" />
        <Circle cx="91" cy="44" r="7" fill={YELLOW} stroke={INK} strokeWidth="3" />
        <Line x1="91" y1="51" x2="91" y2="71" stroke={INK} strokeWidth="6" />
        <Line x1="91" y1="57" x2="75" y2="34" stroke={INK} strokeWidth="5" />
        <Line x1="91" y1="57" x2="108" y2="34" stroke={INK} strokeWidth="5" />
        <Line x1="74" y1="33" x2="74" y2="19" stroke={RED} strokeWidth="4" />
        <Line x1="109" y1="33" x2="109" y2="19" stroke={RED} strokeWidth="4" />
      </Svg>
    );
  }

  if (n.includes('bíceps') || n.includes('tríceps') || n.includes('pallof')) {
    return (
      <Svg width="100%" height={110} viewBox="0 0 220 110">
        <Rect x="168" y="17" width="22" height="77" fill={PAPER} stroke={INK} strokeWidth="5" />
        <Line x1="179" y1="27" x2="133" y2="55" stroke={INK} strokeWidth="2" />
        <Dummy x={93} y={31} scale={0.95} />
        <Line x1="104" y1="49" x2="134" y2="56" stroke={INK} strokeWidth="5" strokeLinecap="round" />
        <Path d="M128 43 Q138 54 130 69" fill="none" stroke={RED} strokeWidth="4" />
        <Rect x="43" y="92" width="118" height="4" fill={INK} />
      </Svg>
    );
  }

  if (n.includes('panturrilha')) {
    return (
      <Svg width="100%" height={110} viewBox="0 0 220 110">
        <Rect x="58" y="89" width="104" height="7" fill={INK} />
        <Line x1="74" y1="88" x2="74" y2="28" stroke={INK} strokeWidth="7" />
        <Line x1="146" y1="88" x2="146" y2="28" stroke={INK} strokeWidth="7" />
        <Rect x="71" y="25" width="78" height="9" fill={RED} />
        <Dummy x={110} y={43} scale={0.84} />
        <Path d="M171 76 L171 52" stroke={RED} strokeWidth="4" />
        <Path d="M165 58 L171 47 L177 58" fill={RED} />
      </Svg>
    );
  }

  if (n.includes('cadeira') || n.includes('sentar')) {
    return (
      <Svg width="100%" height={110} viewBox="0 0 220 110">
        <Rect x="103" y="55" width="55" height="10" fill={INK} />
        <Rect x="145" y="28" width="10" height="38" fill={INK} />
        <Line x1="111" y1="65" x2="105" y2="94" stroke={INK} strokeWidth="6" />
        <Line x1="151" y1="65" x2="157" y2="94" stroke={INK} strokeWidth="6" />
        <Dummy x={84} y={33} scale={0.92} />
        <Path d="M65 74 L65 48" stroke={RED} strokeWidth="4" />
        <Path d="M59 54 L65 43 L71 54" fill={RED} />
      </Svg>
    );
  }

  return (
    <Svg width="100%" height={110} viewBox="0 0 220 110">
      <Rect x="28" y="89" width="164" height="5" fill={INK} />
      <Dummy x={110} y={29} scale={1} />
      <Path d="M42 56 Q110 25 178 56" fill="none" stroke={RED} strokeWidth="4" strokeDasharray="7 5" />
    </Svg>
  );
}
