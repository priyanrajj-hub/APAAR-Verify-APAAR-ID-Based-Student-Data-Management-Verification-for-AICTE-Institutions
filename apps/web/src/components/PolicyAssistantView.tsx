'use client';

import React, { useState } from 'react';
import { useI18n } from '../context/I18nContext';
import { queryAssistant } from '../lib/rag';
import { RAGAnswer } from '@apaar/shared-types';
import {
  MessageSquare,
  Send,
  Mic,
  MicOff,
  Volume2,
  Sparkles,
  ShieldCheck,
  BookOpen,
  Link2,
} from 'lucide-react';

export function PolicyAssistantView() {
  const { t, locale, localeMeta } = useI18n();

  const [inputQuery, setInputQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState<
    Array<{ sender: 'user' | 'assistant'; text: string; citations?: any[]; grounded?: boolean }>
  >([
    {
      sender: 'assistant',
      text:
        locale === 'hi'
          ? 'नमस्ते! मैं अपार (APAAR) और एआईसीटीई नीति सहायक हूँ। मुझसे अपार आईडी, डीपीडीपी सहमति या एआईसीटीई नियमों के बारे में पूछें।'
          : locale === 'ta'
          ? 'வணக்கம்! நான் அபார் (APAAR) மற்றும் AICTE கொள்கை உதவியாளர். என்னிடம் அபார் ஐடி, ஒப்புதல் விதிகள் பற்றி கேட்கலாம்.'
          : 'Welcome! I am your AICTE & NEP 2020 Policy Assistant. Ask me anything about APAAR ID issuance, DPDP student consent, fraud detection, or accreditation norms.',
    },
  ]);

  const handleAsk = (queryText: string) => {
    if (!queryText.trim()) return;

    const userMsg = queryText.trim();
    setInputQuery('');

    // Append user message
    const updatedMessages = [...messages, { sender: 'user' as const, text: userMsg }];
    setMessages(updatedMessages);

    // Query RAG engine
    const answer: RAGAnswer = queryAssistant(userMsg, locale);

    setTimeout(() => {
      setMessages([
        ...updatedMessages,
        {
          sender: 'assistant',
          text: answer.answer,
          citations: answer.citations,
          grounded: answer.grounded,
        },
      ]);
    }, 150);
  };

  // Web Speech Recognition Voice Input
  const handleVoiceInput = () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Web Speech API is not supported in this browser. Please use keyboard input.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = locale === 'hi' ? 'hi-IN' : locale === 'ta' ? 'ta-IN' : 'en-IN';
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputQuery(transcript);
      handleAsk(transcript);
    };

    recognition.start();
  };

  // Text-To-Speech Read Aloud
  const handleReadAloud = (text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = locale === 'hi' ? 'hi-IN' : locale === 'ta' ? 'ta-IN' : 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  const sampleQuestions = [
    t('assistant.sampleQuestion1'),
    t('assistant.sampleQuestion2'),
    t('assistant.sampleQuestion3'),
    'What did surprise inspections find regarding fake AICTE data?',
  ];

  return (
    <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            {t('assistant.title')}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Grounded strictly in verified MoE charters, NEP 2020 extracts, AICTE approval handbooks, and DPDP Act provisions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
            Active: {localeMeta.nativeName} ({locale.toUpperCase()})
          </span>
        </div>
      </div>

      {/* Suggested Questions */}
      <div>
        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
          Suggested Policy Inquiries:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {sampleQuestions.map((sq, i) => (
            <button
              key={i}
              onClick={() => handleAsk(sq)}
              className="text-xs px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-500 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 transition text-left"
            >
              {sq}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Log */}
      <div className="space-y-4 max-h-[460px] overflow-y-auto p-4 rounded-2xl bg-gray-50/60 dark:bg-gray-950/50 border border-gray-200 dark:border-gray-800">
        {messages.map((m, idx) => {
          const isUser = m.sender === 'user';
          return (
            <div
              key={idx}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1.5`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed ${
                  isUser
                    ? 'bg-blue-600 text-white font-medium rounded-br-none shadow-sm'
                    : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-none border border-gray-200 dark:border-gray-700 shadow-sm'
                }`}
              >
                <p className="whitespace-pre-wrap">{m.text}</p>

                {/* Read Aloud Button for Assistant Answers */}
                {!isUser && m.text && (
                  <button
                    onClick={() => handleReadAloud(m.text)}
                    className="mt-2.5 flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    {t('assistant.readAloud')}
                  </button>
                )}
              </div>

              {/* Citations Box */}
              {!isUser && m.citations && m.citations.length > 0 && (
                <div className="max-w-[85%] space-y-1.5 mt-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                    {t('assistant.citationsTitle')}:
                  </span>
                  <div className="grid grid-cols-1 gap-2">
                    {m.citations.map((c, ci) => (
                      <div
                        key={ci}
                        className="p-2.5 rounded-xl border border-indigo-100 dark:border-indigo-950 bg-indigo-50/30 dark:bg-indigo-950/20 text-[11px]"
                      >
                        <div className="font-semibold text-indigo-900 dark:text-indigo-300">
                          {c.title}
                        </div>
                        <div className="text-[10px] text-gray-500">{c.source}</div>
                        <div className="text-[10px] text-gray-400 italic mt-0.5">
                          &ldquo;{c.excerpt}&rdquo;
                        </div>
                      </div>
                    ))}
                  </div>
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
          handleAsk(inputQuery);
        }}
        className="flex items-center gap-2 pt-2"
      >
        <button
          type="button"
          onClick={handleVoiceInput}
          className={`p-3 rounded-2xl border transition ${
            isListening
              ? 'bg-rose-600 text-white border-rose-600 animate-pulse'
              : 'border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
          }`}
          title="Voice input (Web Speech API)"
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>

        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          placeholder={t('assistant.placeholder')}
          className="flex-1 px-4 py-3 rounded-2xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          type="submit"
          className="flex items-center gap-1.5 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md transition"
        >
          <Send className="w-4 h-4" />
          <span>{t('assistant.askButton')}</span>
        </button>
      </form>
    </div>
  );
}
