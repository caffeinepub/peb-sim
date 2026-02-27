import React, { useState } from 'react';
import { X, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface CommentInputPopoverProps {
  screenPosition: { x: number; y: number };
  elementId: string;
  onSubmit: (text: string) => Promise<void>;
  onCancel: () => void;
}

export default function CommentInputPopover({
  screenPosition,
  elementId,
  onSubmit,
  onCancel,
}: CommentInputPopoverProps) {
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!text.trim()) return;
    setIsSubmitting(true);
    try {
      await onSubmit(text.trim());
      setText('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const style: React.CSSProperties = {
    position: 'fixed',
    left: Math.min(screenPosition.x, window.innerWidth - 280),
    top: Math.min(screenPosition.y, window.innerHeight - 180),
    zIndex: 1000,
  };

  return (
    <div
      style={style}
      className="bg-slate-800 border border-amber-500/40 rounded-lg shadow-xl p-3 w-64"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-amber-400">📌 Add Note</span>
        <span className="text-xs text-slate-500 truncate max-w-[120px]">{elementId}</span>
        <button onClick={onCancel} className="text-slate-400 hover:text-white ml-1">
          <X className="h-3 w-3" />
        </button>
      </div>
      <Textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Add your annotation..."
        className="text-xs bg-slate-900 border-slate-600 text-slate-200 resize-none h-20 mb-2"
        autoFocus
        onKeyDown={e => {
          if (e.key === 'Enter' && e.ctrlKey) handleSubmit();
          if (e.key === 'Escape') onCancel();
        }}
      />
      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={handleSubmit}
          disabled={!text.trim() || isSubmitting}
          className="flex-1 h-7 text-xs bg-amber-500 hover:bg-amber-600 text-black"
        >
          {isSubmitting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3 mr-1" />}
          {isSubmitting ? 'Saving...' : 'Save'}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={onCancel}
          className="h-7 text-xs text-slate-400"
        >
          Cancel
        </Button>
      </div>
      <p className="text-xs text-slate-600 mt-1">Ctrl+Enter to save</p>
    </div>
  );
}
