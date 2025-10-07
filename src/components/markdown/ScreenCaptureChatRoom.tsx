'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import type { DocumentReference } from 'firebase/firestore';
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import remarkMath from 'remark-math';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import rehypeKatex from 'rehype-katex';
import rehypeHighlight from 'rehype-highlight';
import { componentsForAIChat, sanitizeSchema } from './constants';
import { rehypeRemoveNbspInCode } from '@/customPlugins/rehype-remove-nbsp-in-code';
import { db } from '@/constants/firebase';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt?: Date;
  isStreaming?: boolean;
}

interface ScreenCaptureChatRoomProps {
  noteId: string;
  summary: string;
  summaryError: string | null;
  isSummarizing: boolean;
  expectedQuestions?: string[];
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

const STREAM_UPDATE_THROTTLE_MS = 400;

const SKIP_STRINGS = new Set(['assistant', 'user', 'system']);

const stripCodeFormatting = (input: string): string => {
  if (!input) {
    return '';
  }

  let output = input;

  output = output.replace(/```[\t ]*([\w+-]+)?\n?([\s\S]*?)```/g, (_, __, code) => {
    const cleaned = typeof code === 'string' ? code.trimEnd() : '';
    return cleaned;
  });

  output = output.replace(/`([^`]+)`/g, (_, code) => code);

  return output;
};

const sanitizePrimitiveText = (value: unknown): string => {
  if (typeof value !== 'string') {
    return '';
  }

  const trimmed = value.trim();
  if (!trimmed || SKIP_STRINGS.has(trimmed.toLowerCase())) {
    return '';
  }

  return trimmed;
};

const extractTextFromPayload = (payload: unknown): string => {
  if (payload == null) {
    return '';
  }

  if (typeof payload === 'string') {
    return sanitizePrimitiveText(payload);
  }

  if (Array.isArray(payload)) {
    return payload.map(extractTextFromPayload).join('');
  }

  if (typeof payload === 'object') {
    const record = payload as Record<string, unknown>;

    if (record.content !== undefined) {
      const extracted = extractTextFromPayload(record.content);
      if (extracted) return extracted;
    }

    if (record.text !== undefined) {
      const extracted = extractTextFromPayload(record.text);
      if (extracted) return extracted;
    }

    if (record.delta !== undefined) {
      const extracted = extractTextFromPayload(record.delta);
      if (extracted) return extracted;
    }

    if (record.response !== undefined) {
      const extracted = extractTextFromPayload(record.response);
      if (extracted) return extracted;
    }

    if (record.message !== undefined) {
      const extracted = extractTextFromPayload(record.message);
      if (extracted) return extracted;
    }

    if (record.result !== undefined) {
      const extracted = extractTextFromPayload(record.result);
      if (extracted) return extracted;
    }

    if (record.choices !== undefined) {
      const extracted = extractTextFromPayload(record.choices);
      if (extracted) return extracted;
    }

    if (record.data !== undefined) {
      const extracted = extractTextFromPayload(record.data);
      if (extracted) return extracted;
    }

    // Fallback: scan remaining values for text
    for (const value of Object.values(record)) {
      const extracted = extractTextFromPayload(value);
      if (extracted) return extracted;
    }
  }

  return '';
};

const consumeStreamBuffer = (buffer: string): { delta: string; remainder: string } => {
  const lastNewlineIndex = buffer.lastIndexOf('\n');

  if (lastNewlineIndex === -1) {
    return { delta: '', remainder: buffer };
  }

  const consumable = buffer.slice(0, lastNewlineIndex + 1);
  const remainder = buffer.slice(lastNewlineIndex + 1);

  const lines = consumable.split('\n');
  let collected = '';

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      continue;
    }

    if (line === '[DONE]') {
      continue;
    }

    const payload = line.startsWith('data:') ? line.slice(5).trim() : line;
    if (!payload || payload === '[DONE]') {
      continue;
    }

    let extracted = '';
    try {
      const parsed = JSON.parse(payload);
      extracted = extractTextFromPayload(parsed);
    } catch {
      extracted = sanitizePrimitiveText(payload);
    }

    if (extracted) {
      collected += extracted;
    }
  }

  return { delta: collected, remainder };
};

const ScreenCaptureChatRoom: React.FC<ScreenCaptureChatRoomProps> = ({
  noteId,
  summary,
  summaryError,
  isSummarizing,
  expectedQuestions = [],
  onRetry,
  backgroundColor = 'transparent',
}) => {
  const auth = getAuth();
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const streamingAbortRef = useRef<AbortController | null>(null);

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
          isStreaming: data.isStreaming === true,
        } satisfies ChatMessage;
      });
      setChatMessages(messages);
    });

    return () => unsubscribe()
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
          isStreaming: false,
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

  useEffect(() => {
    return () => {
      streamingAbortRef.current?.abort();
      streamingAbortRef.current = null;
    };
  }, []);

  const preparedPrompts = summary
    ? (expectedQuestions.length > 0
      ? expectedQuestions
      : [
        'Give me three actionable next steps from this summary.',
        'Highlight any risks or open questions I should address.',
        'Suggest a tweet-length insight based on these findings.',
      ])
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

    let assistantDocRef: DocumentReference | null = null;
    const controller = new AbortController();
    streamingAbortRef.current?.abort();
    streamingAbortRef.current = controller;

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

      assistantDocRef = await addDoc(collection(db, 'chat', noteId, 'messages'), {
        role: 'assistant',
        content: '',
        createdAt: serverTimestamp(),
        isStreaming: true,
      });

      const chatHistory = [...chatMessages, { role: 'user', content: trimmed }].map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      const requestBody = {
        summary,
        chat_history: chatHistory,
        chatHistory: chatHistory,
      };
      
      console.log('Chat Request Body:', requestBody);

      const chatbotResponse = await fetch(`http://127.0.0.1:8000/summarize/chat/${noteId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });
      
      console.log('Chat Response Status:', chatbotResponse.status);
      console.log('Chat Response Headers:', Object.fromEntries(chatbotResponse.headers.entries()));

      if (!chatbotResponse.ok) {
        throw new Error(`Chat request failed with status ${chatbotResponse.status}`);
      }

      const responseClone = chatbotResponse.clone();
      const reader = chatbotResponse.body?.getReader();

      let aggregatedResponse = '';

      if (reader) {
        const decoder = new TextDecoder();
        let buffer = '';
        let lastUpdate = 0;
        let done = false;

        while (!done) {
          const { value, done: doneReading } = await reader.read();
          done = doneReading;

          if (value) {
            buffer += decoder.decode(value, { stream: !done });
            const { delta, remainder } = consumeStreamBuffer(buffer);
            buffer = remainder;

            if (delta) {
              console.log('Stream delta received:', delta.substring(0, 100) + (delta.length > 100 ? '...' : ''));
              aggregatedResponse += delta;
              aggregatedResponse = stripCodeFormatting(aggregatedResponse);
              const now = Date.now();
              if (now - lastUpdate >= STREAM_UPDATE_THROTTLE_MS) {
                try {
                  await updateDoc(assistantDocRef!, { content: aggregatedResponse });
                  lastUpdate = now;
                } catch (error) {
                  console.error('Failed to update streaming assistant message:', error);
                }
              }
            }
          }
        }

        if (buffer) {
          const { delta } = consumeStreamBuffer(`${buffer}\n`);
          if (delta) {
            aggregatedResponse += delta;
            aggregatedResponse = stripCodeFormatting(aggregatedResponse);
          }
        }
      }

      if (!aggregatedResponse) {
        try {
          const fallbackText = await responseClone.text();
          console.log('Fallback response text:', fallbackText);
          try {
            const parsed = JSON.parse(fallbackText);
            console.log('Parsed fallback JSON:', parsed);
            aggregatedResponse = extractTextFromPayload(parsed);
          } catch {
            console.log('Could not parse as JSON, using raw text');
            aggregatedResponse = sanitizePrimitiveText(fallbackText);
          }
        } catch (error) {
          console.error('Failed to parse chatbot response fallback:', error);
        }
      }
      
      console.log('Final aggregated response:', aggregatedResponse);

      aggregatedResponse = stripCodeFormatting(aggregatedResponse).trim();

      if (aggregatedResponse) {
        await updateDoc(assistantDocRef!, {
          content: aggregatedResponse,
          isStreaming: false,
          completedAt: serverTimestamp(),
        });
      } else {
        await updateDoc(assistantDocRef!, {
          content: 'The assistant did not provide a response.',
          isStreaming: false,
          completedAt: serverTimestamp(),
        });
        console.warn('Chat response did not include displayable text');
      }
    } catch (error) {
      if ((error as DOMException)?.name === 'AbortError') {
        try {
          if (assistantDocRef) {
            await updateDoc(assistantDocRef, {
              content: '',
              isStreaming: false,
              completedAt: serverTimestamp(),
            });
          }
        } catch (abortUpdateError) {
          console.error('Failed to finalise aborted assistant response:', abortUpdateError);
        }
        return;
      }

      console.error('Failed to send chat message:', error);
      try {
        if (assistantDocRef) {
          await updateDoc(assistantDocRef, {
            content: 'Sorry, something went wrong while generating a response.',
            isStreaming: false,
            completedAt: serverTimestamp(),
          });
        } else {
          await addDoc(collection(db, 'chat', noteId, 'messages'), {
            role: 'assistant',
            content: 'Sorry, something went wrong while generating a response.',
            createdAt: serverTimestamp(),
            isStreaming: false,
          });
        }
      } catch (writeError) {
        console.error('Failed to record assistant error message:', writeError);
      }
    } finally {
      if (streamingAbortRef.current === controller) {
        streamingAbortRef.current = null;
      }
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
              msg.content.trim() ? (
                <ReactMarkdown
                  remarkPlugins={[remarkMath, remarkGfm, [remarkBreaks, { breaks: true }]]}
                  rehypePlugins={[
                    rehypeRaw,
                    rehypeRemoveNbspInCode,
                    rehypeKatex,
                    [rehypeSanitize, sanitizeSchema],
                    rehypeHighlight,
                  ]}
                  components={componentsForAIChat}
                >
                  {msg.content}
                </ReactMarkdown>
              ) : (
                <p className="text-xs italic text-slate-300">
                  {msg.isStreaming ? 'Generating response…' : 'No response available.'}
                </p>
              )
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
            className={`rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.25em] transition-all duration-200 ${summary
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
