
import React from 'react';

export const KurdistanFlag: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 450">
    <rect width="900" height="450" fill="#ED2E38"/>
    <rect width="900" height="300" fill="#FFF"/>
    <rect width="900" height="150" fill="#007A3D"/>
    <circle cx="450" cy="225" r="80" fill="#FEBF19"/>
    <circle cx="450" cy="225" r="70" fill="#FFF"/>
    <path d="M450,155 v140 a70,70 0 0,0 0,-140" fill="#FEBF19"/>
    <g transform="translate(450,225)">
      <g id="ray">
        <path d="M0,-100 20,0 -20,0 z" fill="#FEBF19" transform="rotate(8.5)"/>
        <path d="M0,-100 20,0 -20,0 z" fill="#FEBF19" transform="rotate(-8.5)"/>
      </g>
      <use href="#ray" transform="rotate(17)"/>
      <use href="#ray" transform="rotate(34)"/>
      <use href="#ray" transform="rotate(51)"/>
      <use href="#ray" transform="rotate(68)"/>
      <use href="#ray" transform="rotate(85)"/>
      <use href="#ray" transform="rotate(102)"/>
      <use href="#ray" transform="rotate(119)"/>
      <use href="#ray" transform="rotate(136)"/>
      <use href="#ray" transform="rotate(153)"/>
      <use href="#ray" transform="rotate(170)"/>
      <use href="#ray" transform="rotate(187)"/>
      <use href="#ray" transform="rotate(204)"/>
      <use href="#ray" transform="rotate(221)"/>
      <use href="#ray" transform="rotate(248)"/>
      <use href="#ray" transform="rotate(265)"/>
      <use href="#ray" transform="rotate(282)"/>
      <use href="#ray" transform="rotate(299)"/>
      <use href="#ray" transform="rotate(316)"/>
      <use href="#ray" transform="rotate(333)"/>
      <use href="#ray" transform="rotate(350)"/>
    </g>
  </svg>
);

export const IraqFlag: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600">
    <rect width="900" height="600" fill="#ce1126"/>
    <rect width="900" height="400" fill="#fff"/>
    <rect width="900" height="200" fill="#000"/>
    <text x="450" y="350" fontFamily="Kufi" fontSize="120" fill="#007a3d" textAnchor="middle">الله أكبر</text>
  </svg>
);

export const USFlag: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1235 650">
        <rect width="1235" height="650" fill="#b22234"/>
        <path d="M0,50H1235M0,150H1235M0,250H1235M0,350H1235M0,450H1235M0,550H1235" stroke="#fff" strokeWidth="50"/>
        <rect width="494" height="350" fill="#3c3b6e"/>
    </svg>
);
