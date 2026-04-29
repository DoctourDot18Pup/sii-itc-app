type IconProps = { size?: number; className?: string; style?: React.CSSProperties }
import React from 'react'
const d = (props: IconProps) => ({ width: props.size ?? 16, height: props.size ?? 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, className: props.className, style: props.style })

export function IcoHome(p: IconProps) { return <svg {...d(p)}><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> }
export function IcoUser(p: IconProps) { return <svg {...d(p)}><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg> }
export function IcoGrade(p: IconProps) { return <svg {...d(p)}><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg> }
export function IcoBook(p: IconProps) { return <svg {...d(p)}><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg> }
export function IcoCalendar(p: IconProps) { return <svg {...d(p)}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> }
export function IcoClock(p: IconProps) { return <svg {...d(p)}><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 15"/></svg> }
export function IcoAward(p: IconProps) { return <svg {...d(p)}><circle cx="12" cy="8" r="6"/><path d="M8.56 14.41L7 22l5-3 5 3-1.56-7.59"/></svg> }
export function IcoTarget(p: IconProps) { return <svg {...d(p)}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg> }
export function IcoDownload(p: IconProps) { return <svg {...d(p)}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> }
export function IcoSearch(p: IconProps) { return <svg {...d(p)}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> }
export function IcoBell(p: IconProps) { return <svg {...d(p)}><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg> }
export function IcoRefresh(p: IconProps) { return <svg {...d(p)}><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg> }
export function IcoMenu(p: IconProps) { return <svg {...d(p)}><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg> }
export function IcoLogOut(p: IconProps) { return <svg {...d(p)}><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg> }
export function IcoChev(p: IconProps) { return <svg {...d(p)}><polyline points="9 18 15 12 9 6"/></svg> }
export function IcoArrow(p: IconProps) { return <svg {...d(p)}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg> }
export function IcoX(p: IconProps) { return <svg {...d(p)}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> }
export function IcoChevDown(p: IconProps) { return <svg {...d(p)}><polyline points="6 9 12 15 18 9"/></svg> }
export function IcoKardex(p: IconProps) { return <svg {...d(p)}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg> }
export function IcoBarChart(p: IconProps) { return <svg {...d(p)}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> }
export function IcoTrendUp(p: IconProps) { return <svg {...d(p)}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg> }
