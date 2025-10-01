'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import remarkMath from 'remark-math';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import rehypeKatex from 'rehype-katex';
import rehypeHighlight from 'rehype-highlight';
import { components, sanitizeSchema } from './constants';
import { rehypeRemoveNbspInCode } from '@/customPlugins/rehype-remove-nbsp-in-code';
import { db } from '@/constants/firebase';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt?: Date;
}

interface ScreenCaptureChatRoomProps {
  noteId: string;
  summary: string;
  summaryError: string | null;
  isSummarizing: boolean;
  onRetry: () => void;
  backgroundColor?: string;
}

const containerClasses = 'flex h-full flex-col';
const threadClasses = 'flex-1 space-y-4 overflow-y-auto px-2 pr-1';
const assistantBubbleClasses = 'rounded-3xl border border-white/5  px-5 py-4 text-[13px] text-slate-100 shadow-[0_18px_40px_-25px_rgba(129,140,248,0.45)] backdrop-blur';
const userBubbleClasses = 'ml-auto max-w-[75%] rounded-3xl bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-500 px-5 py-4 text-[13px] text-white shadow-[0_15px_35px_-20px_rgba(56,189,248,0.5)]';
const inputWrapperClasses = 'relative flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 shadow-[0_18px_40px_-25px_rgba(56,189,248,0.35)]';
const inputClasses = 'w-full border-none bg-transparent text-sm text-slate-100 placeholder-slate-400 focus:outline-none';
const sendButtonClasses = 'inline-flex items-center gap-2 rounded-full border border-sky-400/40 bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-500 px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white transition-transform duration-200 hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-40';

const ScreenCaptureChatRoom: React.FC<ScreenCaptureChatRoomProps> = ({
  noteId,
  summary,
  summaryError,
  isSummarizing,
  onRetry,
  backgroundColor = 'transparent',
}) => {
  const auth = getAuth();
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!noteId) return;

    const chatQuery = query(
      collection(db, 'chat', noteId, 'messages'),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(chatQuery, (snapshot) => {
      const messages = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          role: data.role as 'user' | 'assistant',
          content: data.content as string,
          createdAt: data.createdAt?.toDate?.() ?? new Date(),
        } satisfies ChatMessage;
      });
      setChatMessages(messages);
    });

    return () => unsubscribe();
  }, [noteId]);

  useEffect(() => {
    const bootstrapAssistant = async () => {
      if (!summary || !noteId) return;
      const hasAssistant = chatMessages.some((msg) => msg.role === 'assistant');
      if (!hasAssistant) {
        await addDoc(collection(db, 'chat', noteId, 'messages'), {
          role: 'assistant',
          content: summary,
          createdAt: serverTimestamp(),
        });
      }
    };
    bootstrapAssistant().catch((error) => {
      console.error('Failed to bootstrap chat summary:', error);
    });
  }, [summary, noteId, chatMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const preparedPrompts = summary
    ? [
        'Give me three actionable next steps from this summary.',
        'Highlight any risks or open questions I should address.',
        'Suggest a tweet-length insight based on these findings.',
      ]
    : [
        'Waiting for text extraction to finish…',
        'Once the summary is ready, instant prompts will appear here.',
        'Try capturing a section with key ideas to explore next.',
      ];

  const handleSendMessage = useCallback(async (message?: string) => {
    const candidate = message ?? inputValue;
    const trimmed = candidate.trim();
    if (!trimmed || !noteId || isSending) {
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      console.error('User not authenticated');
      return;
    }

    try {
      setIsSending(true);

      await addDoc(collection(db, 'chat', noteId, 'messages'), {
        role: 'user',
        content: trimmed,
        createdAt: serverTimestamp(),
        authorEmail: user.email || '',
      });

      if (!message) {
        setInputValue('');
      }

      const chatbotResponse = await fetch(`http://127.0.0.1:8000/summarize/chat/${noteId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          summary,
          note_id: noteId,
          chatHistory: [...chatMessages, { role: 'user', content: trimmed }].map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
        }),
      });

      if (!chatbotResponse.ok) {
        throw new Error(`Chat request failed with status ${chatbotResponse.status}`);
      }

      const chatbotData = await chatbotResponse.json();
      const chatbotMessage = typeof chatbotData === 'string' ? chatbotData : chatbotData?.response;

      if (chatbotMessage && typeof chatbotMessage === 'string') {
        await addDoc(collection(db, 'chat', noteId, 'messages'), {
          role: 'assistant',
          content: chatbotMessage,
          createdAt: serverTimestamp(),
        });
      }
    } catch (error) {
      console.error('Failed to send chat message:', error);
    } finally {
      setIsSending(false);
    }
  }, [inputValue, noteId, auth, chatMessages, summary, isSending]);

  if (summaryError) {
    return (
      <div className="space-y-3">
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100 shadow-[0_18px_38px_-28px_rgba(244,63,94,0.5)]">
          {summaryError}
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-full border border-rose-400/40 bg-rose-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-rose-100 transition-transform duration-200 hover:scale-[1.02]"
          onClick={onRetry}
        >
          Retry processing
        </button>
      </div>
    );
  }

  return (
    <div className={containerClasses} style={{ backgroundColor }}>
      <div className={threadClasses}>
        {isSummarizing && chatMessages.length === 0 && (
          <div className="rounded-3xl border border-white/5 px-4 py-3 text-center text-xs text-slate-300">
            Generating your personalised summary…
          </div>
        )}

        {chatMessages.map((msg) => (
          <div key={msg.id} className={msg.role === 'assistant' ? assistantBubbleClasses : userBubbleClasses}>
            {msg.role === 'assistant' ? (
              <ReactMarkdown
                remarkPlugins={[remarkMath, remarkGfm, [remarkBreaks, { breaks: true }]]}
                rehypePlugins={[
                  rehypeRaw,
                  rehypeRemoveNbspInCode,
                  rehypeKatex,
                  [rehypeSanitize, sanitizeSchema],
                  rehypeHighlight,
                ]}
                components={components}
              >
                {msg.content}
              </ReactMarkdown>
            ) : (
              <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {preparedPrompts.map((prompt, index) => (
          <button
            key={`${prompt}-${index}`}
            type="button"
            className={`rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.25em] transition-all duration-200 ${
              summary
                ? 'border-slate-400/40 bg-white/5 text-slate-200 hover:border-sky-400/50 hover:bg-sky-500/10'
                : 'cursor-default border-white/10 bg-white/5 text-slate-500'
            }`}
            onClick={() => summary && handleSendMessage(prompt)}
            disabled={!summary || isSending}
          >
            {prompt}
          </button>
        ))}
      </div>

      <div className={inputWrapperClasses}>
        <input
          type="text"
          className={inputClasses}
          placeholder={summary ? 'Ask the assistant about this summary…' : 'Waiting for summary to generate…'}
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              handleSendMessage();
            }
          }}
          disabled={isSending || !summary}
        />
        <button
          type="button"
          className={sendButtonClasses}
          onClick={() => handleSendMessage()}
          disabled={isSending || !summary || !inputValue.trim()}
        >
          {isSending ? 'Sending…' : 'Send'}
        </button>
      </div>
    </div>
  );
};

export default ScreenCaptureChatRoom;
