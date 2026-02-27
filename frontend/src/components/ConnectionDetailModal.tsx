import React from 'react';
import { X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { ConnectionType } from './ConnectionHotspots';

interface ConnectionDetailModalProps {
  open: boolean;
  connectionType: ConnectionType | null;
  onClose: () => void;
}

function BasePlateDetail() {
  const W = 300;
  const H = 300;
  return (
    <svg width={W} height={H} style={{ background: '#0f172a', borderRadius: 8 }}>
      {/* Base plate */}
      <rect x="75" y="75" width="150" height="150" fill="none" stroke="#60a5fa" strokeWidth="3" />
      {/* Grout gap */}
      <rect x="80" y="80" width="140" height="140" fill="#1e3a5f" opacity="0.5" />
      <text x="150" y="155" fill="#94a3b8" fontSize="10" fontFamily="monospace" textAnchor="middle">GROUT GAP</text>
      <text x="150" y="168" fill="#94a3b8" fontSize="9" fontFamily="monospace" textAnchor="middle">25mm</text>
      {/* Stiffener plates */}
      <line x1="150" y1="75" x2="150" y2="225" stroke="#f59e0b" strokeWidth="2" />
      <line x1="75" y1="150" x2="225" y2="150" stroke="#f59e0b" strokeWidth="2" />
      {/* Anchor bolts */}
      {[[100, 100], [200, 100], [100, 200], [200, 200]].map(([cx, cy], i) => (
        <g key={i}>
          <circle cx={cx} cy={cy} r="8" fill="none" stroke="#ef4444" strokeWidth="2" />
          <circle cx={cx} cy={cy} r="3" fill="#ef4444" />
          <text x={cx + 12} y={cy + 4} fill="#ef4444" fontSize="8" fontFamily="monospace">M24</text>
        </g>
      ))}
      {/* Column stub */}
      <rect x="135" y="60" width="30" height="20" fill="#3b82f6" opacity="0.8" />
      <text x="150" y="55" fill="#e2e8f0" fontSize="9" fontFamily="monospace" textAnchor="middle">COLUMN</text>
      {/* Labels */}
      <text x="150" y="260" fill="#e2e8f0" fontSize="10" fontFamily="monospace" textAnchor="middle" fontWeight="bold">BASE PLATE DETAIL</text>
      <text x="150" y="275" fill="#64748b" fontSize="8" fontFamily="monospace" textAnchor="middle">PL 400×400×20 | 4-M24 Anchor Bolts</text>
      {/* Legend */}
      <line x1="20" y1="290" x2="35" y2="290" stroke="#f59e0b" strokeWidth="2" />
      <text x="38" y="294" fill="#e2e8f0" fontSize="8" fontFamily="monospace">Stiffener</text>
      <circle cx="110" cy="290" r="4" fill="none" stroke="#ef4444" strokeWidth="1.5" />
      <text x="118" y="294" fill="#e2e8f0" fontSize="8" fontFamily="monospace">Anchor Bolt</text>
    </svg>
  );
}

function HaunchDetail() {
  const W = 300;
  const H = 300;
  return (
    <svg width={W} height={H} style={{ background: '#0f172a', borderRadius: 8 }}>
      {/* Column */}
      <rect x="60" y="40" width="30" height="180" fill="#3b82f6" opacity="0.8" />
      {/* Rafter */}
      <polygon points="90,100 240,40 240,60 90,130" fill="#60a5fa" opacity="0.8" />
      {/* Haunch plate */}
      <polygon points="90,100 90,180 160,180 160,130" fill="#f59e0b" opacity="0.6" />
      <text x="120" y="165" fill="#1a2744" fontSize="9" fontFamily="monospace" fontWeight="bold">HAUNCH</text>
      {/* Flange bolts - 2x4 grid */}
      {[0, 1].map(row =>
        [0, 1, 2, 3].map(col => {
          const bx = 100 + col * 18;
          const by = 110 + row * 20;
          return (
            <g key={`${row}-${col}`}>
              <circle cx={bx} cy={by} r="5" fill="none" stroke="#ef4444" strokeWidth="1.5" />
              <circle cx={bx} cy={by} r="2" fill="#ef4444" />
            </g>
          );
        })
      )}
      {/* Web stiffeners */}
      <line x1="90" y1="120" x2="160" y2="120" stroke="#94a3b8" strokeWidth="2" />
      <line x1="90" y1="145" x2="160" y2="145" stroke="#94a3b8" strokeWidth="2" />
      <line x1="90" y1="165" x2="160" y2="165" stroke="#94a3b8" strokeWidth="2" />
      {/* Labels */}
      <text x="150" y="255" fill="#e2e8f0" fontSize="10" fontFamily="monospace" textAnchor="middle" fontWeight="bold">HAUNCH DETAIL</text>
      <text x="150" y="270" fill="#64748b" fontSize="8" fontFamily="monospace" textAnchor="middle">Rafter-to-Column | 8-M20 Bolts</text>
      {/* Legend */}
      <circle cx="25" cy="290" r="4" fill="none" stroke="#ef4444" strokeWidth="1.5" />
      <text x="33" y="294" fill="#e2e8f0" fontSize="8" fontFamily="monospace">M20 Bolt</text>
      <line x1="100" y1="290" x2="115" y2="290" stroke="#94a3b8" strokeWidth="2" />
      <text x="118" y="294" fill="#e2e8f0" fontSize="8" fontFamily="monospace">Web Stiffener</text>
    </svg>
  );
}

function RidgeDetail() {
  const W = 300;
  const H = 300;
  return (
    <svg width={W} height={H} style={{ background: '#0f172a', borderRadius: 8 }}>
      {/* Left rafter */}
      <polygon points="20,200 140,60 160,70 40,210" fill="#60a5fa" opacity="0.8" />
      {/* Right rafter */}
      <polygon points="280,200 160,60 140,70 260,210" fill="#60a5fa" opacity="0.8" />
      {/* Ridge plate */}
      <rect x="130" y="55" width="40" height="60" fill="#f59e0b" opacity="0.7" />
      {/* Bolts */}
      {[[140, 70], [160, 70], [140, 90], [160, 90], [140, 110], [160, 110]].map(([bx, by], i) => (
        <g key={i}>
          <circle cx={bx} cy={by} r="5" fill="none" stroke="#ef4444" strokeWidth="1.5" />
          <circle cx={bx} cy={by} r="2" fill="#ef4444" />
        </g>
      ))}
      {/* Ridge cap */}
      <path d="M 120 55 L 150 35 L 180 55" fill="none" stroke="#94a3b8" strokeWidth="2" />
      {/* Labels */}
      <text x="150" y="255" fill="#e2e8f0" fontSize="10" fontFamily="monospace" textAnchor="middle" fontWeight="bold">RIDGE CONNECTION</text>
      <text x="150" y="270" fill="#64748b" fontSize="8" fontFamily="monospace" textAnchor="middle">Ridge Plate | 6-M20 Bolts</text>
    </svg>
  );
}

const connectionLabels: Record<ConnectionType, string> = {
  haunch_left: 'Haunch Connection (Left)',
  haunch_right: 'Haunch Connection (Right)',
  ridge: 'Ridge Connection',
  base_plate_left: 'Base Plate (Left Column)',
  base_plate_right: 'Base Plate (Right Column)',
};

export default function ConnectionDetailModal({ open, connectionType, onClose }: ConnectionDetailModalProps) {
  const renderDetail = () => {
    if (!connectionType) return null;
    if (connectionType === 'base_plate_left' || connectionType === 'base_plate_right') {
      return <BasePlateDetail />;
    }
    if (connectionType === 'haunch_left' || connectionType === 'haunch_right') {
      return <HaunchDetail />;
    }
    if (connectionType === 'ridge') {
      return <RidgeDetail />;
    }
    return null;
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="bg-slate-900 border-slate-700 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-amber-400 flex items-center gap-2">
            <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded font-mono">LOD 350</span>
            {connectionType ? connectionLabels[connectionType] : 'Connection Detail'}
          </DialogTitle>
        </DialogHeader>
        <div className="flex justify-center py-2">
          {renderDetail()}
        </div>
        <p className="text-xs text-slate-500 text-center">
          High-fidelity connection detail for engineering reference
        </p>
      </DialogContent>
    </Dialog>
  );
}
