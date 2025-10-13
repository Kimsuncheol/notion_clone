'use client';

interface SessionTab {
  id: string;
  label: string;
}

interface WritingAssistantSessionTabsProps {
  sessions: SessionTab[];
  activeSessionId: string | null;
  onSelect: (sessionId: string) => void;
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
                <li key={session.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(session.id)}
                    className={`group flex w-full flex-col rounded-lg border px-3 py-2 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 ${
                      isActive
                        ? 'border-white/30 bg-white/[0.08] text-white'
                        : 'border-white/10 bg-transparent text-white/70 hover:border-white/20 hover:bg-white/[0.05] hover:text-white'
                    }`}
                    aria-current={isActive ? 'true' : undefined}
                  >
                    <span className="text-sm font-medium leading-5">{session.label}</span>
                    <span className="text-xs text-white/50">{formatSessionId(session.id)}</span>
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
