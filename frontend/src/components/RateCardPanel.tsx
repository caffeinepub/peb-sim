import React from 'react';
import { DollarSign } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { RateCard } from '@/utils/calculateProjectCost';

interface RateCardPanelProps {
  rates: RateCard;
  onChange: (rates: RateCard) => void;
}

const rateFields: { key: keyof RateCard; label: string; unit: string; placeholder: string }[] = [
  { key: 'primarySteel', label: 'Primary Steel', unit: '$/MT', placeholder: '1200' },
  { key: 'secondarySteel', label: 'Secondary Steel', unit: '$/MT', placeholder: '1000' },
  { key: 'sheeting', label: 'Sheeting', unit: '$/sqm', placeholder: '25' },
  { key: 'erectionLabor', label: 'Erection Labor', unit: '$/sqm', placeholder: '15' },
];

export default function RateCardPanel({ rates, onChange }: RateCardPanelProps) {
  const handleChange = (key: keyof RateCard, value: string) => {
    const num = parseFloat(value);
    if (!isNaN(num) && num >= 0) {
      onChange({ ...rates, [key]: num });
    } else if (value === '' || value === '0') {
      onChange({ ...rates, [key]: 0 });
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <DollarSign className="h-4 w-4 text-amber-400" />
        <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Rate Card</span>
      </div>
      {rateFields.map(field => (
        <div key={field.key} className="space-y-1">
          <Label className="text-xs text-slate-400">
            {field.label} <span className="text-slate-500">({field.unit})</span>
          </Label>
          <Input
            type="number"
            min="0"
            step="1"
            value={rates[field.key] || ''}
            onChange={e => handleChange(field.key, e.target.value)}
            placeholder={field.placeholder}
            className="h-7 text-xs bg-slate-800 border-slate-600 text-slate-200"
          />
        </div>
      ))}
    </div>
  );
}
