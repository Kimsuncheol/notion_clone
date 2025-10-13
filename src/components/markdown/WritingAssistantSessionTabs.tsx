'use client';

interface SessionTab {
  id: string;
  label: string;
  firstResponseSummary?: string;
}

interface WritingAssistantSessionTabsProps {
  sessions: SessionTab[];
  activeSessionId: string | null;
  onSelect: (sessionId: string) => void;
  onDelete: (sessionId: string) => void;
}

const formatSessionId = (id: string) => {
  if (!id) return '';
  const trimmed = id.trim();
  if (trimmed.length <= 8) {
    return trimmed;
  }
  return `${trimmed.slice(0, 4)}…${trimmed.slice(-4)}`;
};

export default function WritingAssistantSessionTabs({
  sessions,
  activeSessionId,
  onSelect,
  onDelete,
}: WritingAssistantSessionTabsProps) {
  return (
    <div className="flex h-full w-60 flex-col border-r border-white/10 bg-white/[0.02]">
      <div className="flex-1 overflow-y-auto px-2 py-3">
        {sessions.length === 0 ? (
          <div className="rounded-md border border-dashed border-white/10 px-3 py-4 text-xs leading-5 text-white/60">
            Start a conversation and the completed session will appear here.
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {sessions.map((session) => {
              const isActive = session.id === activeSessionId;

              return (
                <li key={session.id} className="relative">
                  <button
                    type="button"
                    onClick={() => onSelect(session.id)}
                    className={`group flex w-full flex-col rounded-lg border px-3 pr-9 py-2 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 ${
                      isActive
                        ? 'border-white/30 bg-white/[0.08] text-white'
                        : 'border-white/10 bg-transparent text-white/70 hover:border-white/20 hover:bg-white/[0.05] hover:text-white'
                    }`}
                    aria-current={isActive ? 'true' : undefined}
                  >
                    <span className="text-sm font-medium leading-5">{session.label}</span>
                    <p
                      className="mt-1 text-xs text-white/60"
                      style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {session.firstResponseSummary?.trim() || 'No summary captured yet.'}
                    </p>
                    <span className="mt-2 text-[10px] uppercase tracking-wide text-white/35">
                      {formatSessionId(session.id)}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onDelete(session.id);
                    }}
                    className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-md text-white/50 transition hover:bg-red-500/10 hover:text-red-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-200/40"
                    aria-label={`Delete ${session.label}`}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M3 6h18" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}
