import React, { useState } from 'react';
import { MessageSquare, Trash2, ChevronRight, ChevronLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Comment } from '@/backend';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';

interface CommentSidebarProps {
  comments: Comment[];
  onDelete: (commentId: bigint) => Promise<void>;
  readOnly?: boolean;
  highlightedCommentId?: bigint | null;
  onCommentClick?: (comment: Comment) => void;
}

export default function CommentSidebar({
  comments,
  onDelete,
  readOnly = false,
  highlightedCommentId,
  onCommentClick,
}: CommentSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<bigint | null>(null);
  const { identity } = useInternetIdentity();

  const handleDelete = async (commentId: bigint) => {
    setDeletingId(commentId);
    try {
      await onDelete(commentId);
    } finally {
      setDeletingId(null);
    }
  };

  const isOwn = (comment: Comment): boolean => {
    if (!identity) return false;
    return comment.author.toString() === identity.getPrincipal().toString();
  };

  const formatTime = (time: bigint): string => {
    const ms = Number(time) / 1_000_000;
    return new Date(ms).toLocaleDateString();
  };

  return (
    <div
      className={`fixed right-0 top-1/2 -translate-y-1/2 z-40 flex items-center transition-all duration-300 ${
        isOpen ? 'translate-x-0' : 'translate-x-[calc(100%-32px)]'
      }`}
    >
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-slate-800 border border-slate-600 rounded-l-lg p-2 flex flex-col items-center gap-1 hover:bg-slate-700 transition-colors"
      >
        {isOpen ? (
          <ChevronRight className="h-4 w-4 text-amber-400" />
        ) : (
          <ChevronLeft className="h-4 w-4 text-amber-400" />
        )}
        <MessageSquare className="h-4 w-4 text-amber-400" />
        {comments.length > 0 && (
          <span className="text-xs bg-amber-500 text-black rounded-full w-4 h-4 flex items-center justify-center font-bold">
            {comments.length}
          </span>
        )}
      </button>

      {/* Sidebar panel */}
      <div className="bg-slate-900 border border-slate-700 border-l-0 rounded-r-none w-72 shadow-xl">
        <div className="p-3 border-b border-slate-700 flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-amber-400" />
          <span className="text-sm font-semibold text-amber-400">Annotations</span>
          <span className="ml-auto text-xs text-slate-500">{comments.length} notes</span>
        </div>
        <ScrollArea className="h-80">
          {comments.length === 0 ? (
            <div className="p-4 text-center text-slate-500 text-xs">
              {readOnly ? 'No annotations yet.' : 'Double-click any element to add a note.'}
            </div>
          ) : (
            <div className="p-2 space-y-2">
              {comments.map(comment => (
                <div
                  key={Number(comment.id)}
                  onClick={() => onCommentClick?.(comment)}
                  className={`p-2 rounded-lg border cursor-pointer transition-colors ${
                    highlightedCommentId === comment.id
                      ? 'border-amber-500/60 bg-amber-500/10'
                      : 'border-slate-700 bg-slate-800 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-start justify-between gap-1">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1 mb-1">
                        <span className="text-xs font-mono text-blue-400 truncate max-w-[120px]">
                          {comment.elementId}
                        </span>
                        <span className="text-xs text-slate-600">·</span>
                        <span className="text-xs text-slate-500">{formatTime(comment.createdAt)}</span>
                      </div>
                      <p className="text-xs text-slate-300 break-words">{comment.text}</p>
                    </div>
                    {!readOnly && isOwn(comment) && (
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          handleDelete(comment.id);
                        }}
                        disabled={deletingId === comment.id}
                        className="text-slate-600 hover:text-red-400 transition-colors flex-shrink-0 mt-0.5"
                      >
                        {deletingId === comment.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Trash2 className="h-3 w-3" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}
