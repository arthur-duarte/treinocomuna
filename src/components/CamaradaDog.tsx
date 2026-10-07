import React from 'react';
import Svg, { Circle, Ellipse, Path, Polygon, Rect } from 'react-native-svg';

export type DogMood = 'inicio' | 'vitoria' | 'dificil' | 'conquista';

export function CamaradaDog({ size=92, mood='inicio' }:{size?:number; mood?:DogMood}) {
  const bg = mood === 'vitoria' || mood === 'conquista' ? '#B71C1C' : '#151515';
  const eyeY = mood === 'dificil' ? 61 : 59;
  return (
    <Svg width={size} height={size} viewBox="0 0 120 120">
      <Circle cx="60" cy="60" r="57" fill={bg} stroke="#E5AA27" strokeWidth="4"/>
      <Path d="M28 48 C18 42 15 55 25 70 C29 76 37 71 38 61 Z" fill="#9B551F" stroke="#111" strokeWidth="3"/>
      <Path d="M92 48 C102 42 105 55 95 70 C91 76 83 71 82 61 Z" fill="#9B551F" stroke="#111" strokeWidth="3"/>
      <Ellipse cx="60" cy="66" rx="29" ry="31" fill="#C77732" stroke="#111" strokeWidth="3"/>
      <Ellipse cx="60" cy="76" rx="18" ry="15" fill="#E9B56A"/>
      <Circle cx="49" cy={eyeY} r="3.5" fill="#111"/>
      <Circle cx="71" cy={eyeY} r="3.5" fill="#111"/>
      <Ellipse cx="60" cy="72" rx="5.5" ry="4.5" fill="#111"/>
      {mood === 'dificil'
        ? <Path d="M51 83 Q60 78 69 83" fill="none" stroke="#111" strokeWidth="3" strokeLinecap="round"/>
        : <Path d="M49 82 Q60 92 71 82" fill="#8B1B16" stroke="#111" strokeWidth="3" strokeLinecap="round"/>}
      {mood === 'vitoria' && <Path d="M58 87 Q60 98 66 87" fill="#D95A5A"/>}
      <Path d="M28 42 Q58 16 93 38 L82 49 Q57 37 35 51 Z" fill="#B71C1C" stroke="#111" strokeWidth="3"/>
      <Path d="M52 29 Q63 16 77 24 Q65 35 52 29" fill="#8B1010"/>
      <Polygon points="61,28 64,35 72,35 66,40 69,48 61,43 54,48 56,40 50,35 58,35" fill="#E5AA27"/>
      <Rect x="44" y="96" width="32" height="7" rx="3.5" fill="#B71C1C"/>
      {mood === 'conquista' && <>
        <Circle cx="96" cy="24" r="13" fill="#E5AA27" stroke="#111" strokeWidth="3"/>
        <Polygon points="96,14 99,21 107,21 101,26 103,34 96,29 89,34 91,26 85,21 93,21" fill="#B71C1C"/>
      </>}
    </Svg>
  );
}
