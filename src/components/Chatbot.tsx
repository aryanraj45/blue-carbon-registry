import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, User, Send, Paperclip, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { GenerativeShimmerStyle } from "./ui/GenerativeShimmerStyle";
import ReactMarkdown from 'react-markdown';
import { TextGenerateEffect } from './ui/text-generate-effect';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};
const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
};

interface Message {
  id: number | string;
  text: string;
  sender: 'user' | 'ai';
  documents?: { url: string; title: string }[];
}

interface ChatbotProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  isAiTyping: boolean;
  onFileUpload?: (file: File) => void;
  isTtsEnabled: boolean;
  setIsTtsEnabled: (enabled: boolean) => void;
}

export const Chatbot: React.FC<ChatbotProps> = ({
  messages,
  onSendMessage,
  isAiTyping,
  onFileUpload,
  isTtsEnabled,
  setIsTtsEnabled
}) => {
  const [inputValue, setInputValue] = useState('');
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isAiTyping]);

  const suggestedPrompts = useMemo(() => [
    { title: "Start my Project", text: "I want to start a new project." },
    { title: "List required documents", text: "What documents do I need for a mangrove project?" },
    { title: "Explain satellite verification", text: "Tell me about the satellite verification step." },
    { title: "What is a PDD?", text: "What is a Project Design Document?" },
  ], []);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  }, [inputValue, onSendMessage]);

  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileUpload && onFileUpload(e.target.files[0]);
    }
  }, [onFileUpload]);

  return (
    <div className="flex flex-col h-[85vh] bg-slate-900/50 border border-blue-900/50 rounded-lg shadow-xl">
      <GenerativeShimmerStyle />
      <div className="p-4 border-b border-blue-900/50 flex items-center justify-between">
        <div className="flex items-center">
          <Bot className="w-6 h-6 text-cyan-400 mr-3" />
          <h2 className="text-xl font-semibold text-white">VerifiAI Assistant</h2>
        </div>
        <div className="flex items-center gap-2">
          {isTtsEnabled ? (
            <Volume2 className="h-5 w-5 text-slate-400" />
          ) : (
            <VolumeX className="h-5 w-5 text-slate-500" />
          )}
          <Switch
            checked={isTtsEnabled}
            onCheckedChange={setIsTtsEnabled}
            aria-label="Toggle text-to-speech"
          />
        </div>
      </div>

      <div ref={chatContainerRef} className="flex-1 p-4 overflow-y-auto">
        <div className="flex flex-col space-y-4">
          <AnimatePresence>
            {messages.map((msg, index) => {
              const isLastMessage = index === messages.length - 1;
              return (
                <motion.div
                  key={msg.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`flex items-start gap-3 max-w-2xl ${msg.sender === 'user' ? 'ml-auto justify-end' : 'mr-auto'}`}
                >
                  {msg.sender === 'ai' && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-950 flex items-center justify-center">
                      <Bot className="w-5 h-5 text-cyan-400" />
                    </div>
                  )}
                  <div className={`max-w-xl p-3 rounded-xl whitespace-pre-wrap ${msg.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300'}`}>
                    {msg.sender === 'ai' ? (
                      <>
                        {isLastMessage ? (
                          <TextGenerateEffect words={msg.text} />
                        ) : (
                          <div className="prose prose-sm prose-invert prose-p:my-2 prose-li:my-1 text-slate-300">
                            <ReactMarkdown>{msg.text}</ReactMarkdown>
                          </div>
                        )}

                        {msg.documents && msg.documents.length > 0 && (
                          <div className="mt-4 flex flex-col space-y-4 max-h-96 overflow-y-auto">
                            {msg.documents.map((doc, i) => (
                              <div key={i}>
                                <h4 className="text-sm font-semibold text-slate-300 mb-1">{doc.title}</h4>
                                <div className="border border-slate-700 rounded-md overflow-hidden">
                                  <img
                                    src={doc.url}
                                    alt={doc.title}
                                    className="w-full object-contain"
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    ) : (
                      <p>{msg.text}</p>
                    )}
                  </div>
                  {msg.sender === 'user' && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
                      <User className="w-5 h-5 text-slate-300" />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>

          {isAiTyping && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-blue-950 flex items-center justify-center flex-shrink-0">
                <Bot className="w-5 h-5 text-cyan-400" />
              </div>
              <div className="max-w-md p-3 rounded-xl bg-slate-800 text-slate-300 space-y-2">
                <div className="generative-bg h-4 w-48 rounded"></div>
                <div className="generative-bg h-4 w-40 rounded"></div>
                <div className="generative-bg h-4 w-32 rounded"></div>
              </div>
            </motion.div>
          )}

          {messages.length <= 1 && !isAiTyping && (
            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="pt-4 pb-8">
              <motion.h3 variants={itemVariants} className="text-md font-semibold text-slate-400 mb-4 text-center">Or try a suggestion...</motion.h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {suggestedPrompts.map((prompt) => (
                  <motion.button
                    key={prompt.text}
                    variants={itemVariants}
                    onClick={() => onSendMessage(prompt.text)}
                    className="p-3 bg-slate-800/50 rounded-lg text-left text-sm font-medium text-slate-300 border border-slate-700/50 shadow-sm hover:bg-slate-800/80 hover:border-slate-600 transition-all focus:ring-2 focus:ring-cyan-500 outline-none"
                  >
                    <p>{prompt.title}</p>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
      <div className="p-4 border-t border-blue-900/50">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-10 w-10 shrink-0 rounded-lg text-slate-400 hover:bg-slate-700/50 hover:text-cyan-400"
            onClick={handleUploadClick}
          >
            <Paperclip className="h-5 w-5" />
          </Button>
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type a message or upload a file..."
            className="w-full bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
          <Button type="submit" size="icon" className="h-10 w-10 rounded-lg bg-blue-600 hover:bg-blue-700">
            <Send className="h-5 w-5" />
          </Button>
        </form>
      </div>
    </div>
  );
};
