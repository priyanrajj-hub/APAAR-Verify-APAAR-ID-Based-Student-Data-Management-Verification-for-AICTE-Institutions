'use client';

import React, { useState, useEffect } from 'react';
import { useI18n } from '../context/I18nContext';
import { queryAssistant } from '../lib/rag';
import { RAGAnswer, StudentRecord } from '@apaar/shared-types';
import {
  Sparkles,
  X,
  Send,
  Bot,
  Volume2,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

interface AiCopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  contextRecord?: StudentRecord | null;
}

export function AiCopilotDrawer({ isOpen, onClose, contextRecord }: AiCopilotDrawerProps) {
  const { t, locale, localeMeta } = useI18n();
  const [inputQuery, setInputQuery] = useState('');
  const [messages, setMessages] = useState<
    Array<{ sender: 'user' | 'assistant'; text: string; citations?: any[] }>
  >([]);

  // When contextRecord is provided, trigger an automatic contextual AI explanation
  useEffect(() => {
    if (!isOpen) return;

    if (contextRecord) {
      const issues = contextRecord.reasons.length > 0 ? contextRecord.reasons.join('; ') : 'Routine verification review';
      const prompt = `Explain verification finding for student ${contextRecord.name} (APAAR: ${contextRecord.apaarId || 'None'}). Issues detected: ${issues}. What does AICTE and NEP 2020 prescribe for this record?`;

      setMessages([
        {
          sender: 'user',
          text: `🔍 Analyzing record: ${contextRecord.name} (${contextRecord.apaarId || 'Pending'}) — ${issues}`,
        },
      ]);

      const answer: RAGAnswer = queryAssistant(prompt, locale);
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            sender: 'assistant',
            text: answer.answer,
            citations: answer.citations,
          },
        ]);
      }, 150);
    } else {
      setMessages((prev) => {
        if (prev.length > 0) return prev;
        return [
          {
            sender: 'assistant',
            text:
              locale === 'hi'
                ? 'नमस्ते! मैं आपका एआई नीति सह-पायलट (Copilot) हूँ। मुझसे अपार दिशानिर्देशों, डीपीडीपी सहमति, या एआईसीटीई अनुमोदन नियमों के बारे में पूछें।'
                : locale === 'ta'
                ? 'வணக்கம்! நான் உங்கள் AI கொள்கை உதவியாளர். என்னிடம் அபார் விதிமுறைகள், AICTE வழிகாட்டுதல்கள் பற்றி கேளுங்கள்.'
                : 'Hello! I am your AICTE & APAAR Copilot. Ask me any regulatory question or click "AI Explain" on any flagged student record to see instantaneous regulatory analysis.',
          },
        ];
      });
    }
  }, [isOpen, contextRecord, locale]);

  if (!isOpen) return null;

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    const userText = text.trim();
    setInputQuery('');

    const newMsgs = [...messages, { sender: 'user' as const, text: userText }];
    setMessages(newMsgs);

    const answer = queryAssistant(userText, locale);
    setTimeout(() => {
      setMessages([...newMsgs, { sender: 'assistant', text: answer.answer, citations: answer.citations }]);
    }, 150);
  };

  const handleReadAloud = (txt: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(txt);
    utt.lang = locale === 'hi' ? 'hi-IN' : locale === 'ta' ? 'ta-IN' : 'en-US';
    window.speechSynthesis.speak(utt);
  };

  const quickPrompts = [
    'Explain the project',
    'How does the 5-stage pipeline work?',
    'How does the 12-digit APAAR Luhn check work?',
    'How does Indic transliteration work?',
    'Why is student consent mandatory under DPDP Act 2023?',
    'How is dual-enrollment scholarship fraud prevented?',
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 h-full flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-blue-700 via-indigo-800 to-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-white/10 backdrop-blur-md">
              <Sparkles className="w-5 h-5 text-emerald-300" />
            </span>
            <div>
              <h3 className="text-sm font-bold flex items-center gap-1.5">
                <span>AI Policy Copilot</span>
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-200 border border-emerald-400/30">
                  RAG Active
                </span>
              </h3>
              <p className="text-[10px] text-slate-300">
                Grounded in MoE, AICTE Approval Handbook &amp; DPDP 2023
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition"
            aria-label="Close Copilot"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Prompts Bar */}
        <div className="p-3 bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
          <div className="flex items-center gap-1.5 whitespace-nowrap text-xs">
            {quickPrompts.map((qp, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(qp)}
                className="px-2.5 py-1 rounded-full text-[11px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-500 text-slate-700 dark:text-slate-300 transition shrink-0"
              >
                {qp}
              </button>
            ))}
          </div>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
          {messages.map((m, idx) => {
            const isUser = m.sender === 'user';
            return (
              <div
                key={idx}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1.5`}
              >
                <div
                  className={`p-3.5 rounded-2xl max-w-[90%] leading-relaxed ${
                    isUser
                      ? 'bg-blue-600 text-white rounded-br-xs shadow-xs font-medium'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-xs border border-slate-200 dark:border-slate-700 shadow-xs'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.text}</p>

                  {!isUser && m.text && (
                    <button
                      onClick={() => handleReadAloud(m.text)}
                      className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      <Volume2 className="w-3 h-3" />
                      <span>{t('assistant.readAloud')}</span>
                    </button>
                  )}
                </div>

                {!isUser && m.citations && m.citations.length > 0 && (
                  <div className="max-w-[90%] space-y-1">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                      Grounded Citation:
                    </span>
                    {m.citations.map((c, ci) => (
                      <div
                        key={ci}
                        className="p-2 rounded-lg bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-200/50 dark:border-indigo-900/40 text-[10px]"
                      >
                        <div className="font-semibold text-indigo-900 dark:text-indigo-300">{c.title}</div>
                        <div className="text-slate-500 italic mt-0.5">&ldquo;{c.excerpt}&rdquo;</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(inputQuery);
          }}
          className="p-3 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 bg-white dark:bg-slate-900"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Ask AI Copilot about regulations, fixes, or laws..."
            className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition shadow-xs"
            aria-label="Send query"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
