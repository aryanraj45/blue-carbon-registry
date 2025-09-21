// src/components/NGODashboard.tsx

import React from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { useToast } from "@/hooks/use-toast";
import DashboardHeader from "./DashboardHeader";
import { Chatbot } from "@/components/Chatbot";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { useSolanaAction } from "@/hooks/useSolanaAction";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Button } from "@/components/ui/button";
import { Send, Coins, Wallet } from "lucide-react";

import data1 from "@/assets/data1.png";
import data2 from "@/assets/data2.png";
import data3 from "@/assets/data3.png";
import s1 from "@/assets/s1.png";
import s2 from "@/assets/s2.png";

// --- Gemini API Configuration ---
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

let genAI;
let model;

if (API_KEY) {
  genAI = new GoogleGenerativeAI(API_KEY);
  model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: `You are VerifiAI, an expert assistant for the Indian National Registry for Blue Carbon. Your goal is to guide a new user through the project submission process. You must be friendly, professional, and strictly follow the guidelines of the Indian Ministry of Environment, Forest and Climate Change (MoEFCC). Guide the user one phase at a time, waiting for their response before proceeding. When a user uploads a file, acknowledge it by name and confirm you have attached it to their project file. Then, prompt them for the next action.`,
  });
} else {
  console.error(
    "VITE_GEMINI_API_KEY is not set. The chatbot will not function. Please create a .env file in the project root and add VITE_GEMINI_API_KEY=YOUR_KEY_HERE, then restart the development server."
  );
}

// --- Type Definitions ---
type Message = { 
    id: number | string; 
    text: string; 
    sender: "user" | "ai",
    documents?: { url: string; title: string }[]; 
};
type GeminiHistoryItem = { role: "user" | "model"; parts: { text: string }[] };

// --- Main Dashboard Component ---
const NGODashboard = () => {
    const [messages, setMessages] = React.useState<Message[]>([]);
    const [isAiTyping, setIsAiTyping] = React.useState(false);
    const [balance, setBalance] = React.useState<number>(0);
    const { toast } = useToast();
    const { sendTransaction, requestAirdrop, getBalance, isSending } = useSolanaAction();
    const [isTtsEnabled, setIsTtsEnabled] = React.useState(false);

    // ## TEXT-TO-SPEECH LOGIC ##
    React.useEffect(() => {
        const speak = (textToSpeak: string) => {
            if (!('speechSynthesis' in window)) {
                console.error("Sorry, your browser does not support text-to-speech.");
                return;
            }
            window.speechSynthesis.cancel();
            
            const utterance = new SpeechSynthesisUtterance(textToSpeak);
            utterance.lang = 'en-US';
            window.speechSynthesis.speak(utterance);
        };

        const lastMessage = messages[messages.length - 1];

        if (isTtsEnabled && lastMessage && lastMessage.sender === 'ai') {
            speak(lastMessage.text);
        }

        return () => {
            window.speechSynthesis.cancel();
        };

    }, [messages, isTtsEnabled]);

    React.useEffect(() => {
        if (!isTtsEnabled) {
            window.speechSynthesis.cancel();
        }
    }, [isTtsEnabled]);


  React.useEffect(() => {
    setMessages([
      {
        id: 1,
        text: "Welcome! I am VerifiAI. To begin, tell me the official name of your blue carbon project, or choose a suggestion below.",
        sender: "ai",
      },
    ]);
  }, []);

    const handleSendMessage = async (userInput: string) => {
    if (!API_KEY) {
      toast({
        title: "API Key Not Configured",
        description:
          "The application is missing the Gemini API key. Please contact the administrator.",
        variant: "destructive",
      });
      return;
    }

    const userMessage: Message = {
      id: Date.now(),
      text: userInput,
      sender: "user",
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsAiTyping(true);
    
    if (userInput.toLowerCase().includes("documents do i need")) {
        setTimeout(() => {
            const docResponse: Message = {
                id: Date.now() + 1,
                sender: 'ai',
                text: 'Certainly! Here are the core documents required for your project submission:',
                documents: [
                    { url: data1, title: 'Legal Registration' },
                    { url: data2, title: 'Identity' },
                    { url: data3, title: 'Expenditure' }
                ],
            };
            setMessages(prev => [...prev, docResponse]);
            setIsAiTyping(false);
        }, 1500); 
        return;
    }

    else if (userInput.toLowerCase().includes("satellite verification")) {
        setTimeout(() => {
            const satelliteResponse: Message = {
                id: Date.now() + 1,
                sender: 'ai',
                text: "Excellent question. Satellite verification is a cornerstone of modern environmental projects, providing unbiased, scientific proof of a project's impact.\n\nThe process begins by acquiring high-resolution satellite imagery of your project area **before** any work starts. This creates a verifiable 'baseline.' Then, over time, new images are captured periodically. Our advanced AI algorithms compare these new images to the baseline to automatically detect and quantify changes, such as growth in mangrove canopy and increases in biomass.\n\nThis data-driven approach ensures that the carbon credits generated are based on real, measurable growth, making the process transparent and trustworthy. Below is a simplified visual guide.",
                documents: [
                    { url: s1, title: 'Step 1: High-Resolution Baseline Imagery' },
                    { url: s2, title: 'Step 2: AI-Powered Change Detection Analysis' }
                ],
            };
            setMessages(prev => [...prev, satelliteResponse]);
            setIsAiTyping(false);
        }, 1500);
        return;
    }

    try {
      const historyForApi: GeminiHistoryItem[] = [...messages, userMessage]
      .filter(msg => !msg.documents) 
      .map(
        (msg) => ({
          role: msg.sender === "ai" ? "model" : "user",
          parts: [{ text: msg.text }],
        })
      );

      if (historyForApi.length > 0 && historyForApi[0].role === "model") {
        historyForApi.shift();
      }
      historyForApi.pop();

      const chat = model.startChat({ history: historyForApi });
      const result = await chat.sendMessage(userInput);
      const response = result.response;
      const aiResponseText = response.text();

      const aiMessage: Message = {
        id: Date.now() + 1,
        text: aiResponseText,
        sender: "ai",
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Gemini API error:", error);
      toast({
        title: "AI Error",
        description:
          "Could not get a response from the AI. This may be due to an invalid API key or network issue.",
        variant: "destructive",
      });
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          text: "Sorry, I encountered an error and couldn't get a response.",
          sender: "ai",
        },
      ]);
    } finally {
      setIsAiTyping(false);
    }
  };

  const handleFileUpload = (file: File) => {
    const userMessage: Message = {
      id: Date.now(),
      text: `File Uploaded: **${file.name}** (${(file.size / 1024).toFixed(
        2
      )} KB)`,
      sender: "user",
    };
    setMessages((prev) => [...prev, userMessage]);

    setIsAiTyping(true);
    setTimeout(() => {
      const aiResponse: Message = {
        id: Date.now() + 1,
        text: `Thank you for uploading **${file.name}**. I have attached it to your project file.

Please upload the next document, or let me know if you have any questions.`,
        sender: "ai",
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsAiTyping(false);
    }, 1500);
  };

  const handleTestTransaction = async () => {
    try {
      const transactionData = JSON.stringify({
        type: "TEST_TRANSACTION",
        timestamp: new Date().toISOString(),
        user: localStorage.getItem("userEmail") || "anonymous",
        app: "earth-credits-hub",
      });

      console.log("Sending test transaction...");
      setIsAiTyping(true);

      const { signature, error } = await sendTransaction(transactionData);

      if (signature) {
        console.log("Test transaction successful with signature:", signature);
        toast({
          title: "Transaction Successful!",
          description: `Data recorded on-chain. Signature: ${signature.substring(
            0,
            12
          )}...`,
        });

        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            text: `💰 Transaction successful! Your test transaction has been recorded on the Solana blockchain with signature: ${signature.substring(
              0,
              10
            )}...`,
            sender: "ai",
          },
        ]);
      }

      if (error) {
        console.error("Transaction error:", error);
        toast({
          title: "Transaction Failed",
          description: error.message || "Unknown error occurred",
          variant: "destructive",
        });

        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            text: `❌ Transaction failed: ${
              error.message || "Unknown error occurred"
            }. Please make sure your wallet is connected and has sufficient funds.`,
            sender: "ai",
          },
        ]);
      }
    } catch (e) {
      console.error("Error in transaction handler:", e);
      const errorMessage =
        e instanceof Error ? e.message : "Unknown error occurred";

      toast({
        title: "Transaction Error",
        description: errorMessage,
        variant: "destructive",
      });

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          text: `❌ Error during transaction: ${errorMessage}. Please try again later.`,
          sender: "ai",
        },
      ]);
    } finally {
      setIsAiTyping(false);
    }
  };

  const handleAirdrop = async () => {
    try {
      console.log("Requesting airdrop...");
      setIsAiTyping(true);

      const { signature, error } = await requestAirdrop();

      if (signature) {
        console.log("Airdrop successful with signature:", signature);
        toast({
          title: "Airdrop Successful!",
          description: `1 SOL added to your wallet. Signature: ${signature.substring(
            0,
            12
          )}...`,
        });

        const newBalance = await getBalance();
        setBalance(newBalance);

        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            text: `🪂 Airdrop successful! You now have ${newBalance.toFixed(
              4
            )} SOL in your wallet. You can now test transactions!`,
            sender: "ai",
          },
        ]);
      }

      if (error) {
        console.error("Airdrop error:", error);
        toast({
          title: "Airdrop Failed",
          description: error.message || "Unknown error occurred",
          variant: "destructive",
        });

        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            text: `❌ Airdrop failed: ${
              error.message || "Unknown error occurred"
            }. Please try again later.`,
            sender: "ai",
          },
        ]);
      }
    } catch (e) {
      console.error("Error in airdrop handler:", e);
      const errorMessage =
        e instanceof Error ? e.message : "Unknown error occurred";

      toast({
        title: "Airdrop Error",
        description: errorMessage,
        variant: "destructive",
      });

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          text: `❌ Error during airdrop: ${errorMessage}. Please try again later.`,
          sender: "ai",
        },
      ]);
    } finally {
      setIsAiTyping(false);
    }
  };

  const updateBalance = async () => {
    const newBalance = await getBalance();
    setBalance(newBalance);
  };

  React.useEffect(() => {
    updateBalance();
  }, [getBalance]);

  return (
    <div className="min-h-screen w-full bg-neutral-950 relative antialiased">
      <div className="relative z-10 w-full">
        <DashboardHeader
          title="NGO Project Portal"
          subtitle="Submit your project details using our AI assistant below."
        >
          <div className="flex items-center gap-2">
            <div className="text-sm text-gray-400 flex items-center gap-1">
              <Wallet className="h-3 w-3" />
              {balance.toFixed(4)} SOL
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAirdrop}
              disabled={isSending}
            >
              <Coins className="h-4 w-4 mr-2" />
              {isSending ? "Requesting..." : "Get Free SOL"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleTestTransaction}
              disabled={isSending}
            >
              <Send className="h-4 w-4 mr-2" />
              {isSending ? "Sending..." : "Test Tx"}
            </Button>
            <WalletMultiButton />
          </div>
        </DashboardHeader>
        <main className="max-w-5xl mx-auto space-y-8 p-4 sm:p-6 lg:p-8">
            <Chatbot
                messages={messages}
                isAiTyping={isAiTyping}
                onSendMessage={handleSendMessage}
                onFileUpload={handleFileUpload}
                isTtsEnabled={isTtsEnabled}
                setIsTtsEnabled={setIsTtsEnabled}
            />
        </main>
      </div>
      <BackgroundBeams />
    </div>
  );
};

export default NGODashboard;