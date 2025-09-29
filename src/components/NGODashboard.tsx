// src/components/NGODashboard.tsx

import React from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { useToast } from "@/hooks/use-toast";
import DashboardHeader from "./DashboardHeader";
import { Chatbot } from "@/components/Chatbot";
import DocumentProcessor from "./DocumentProcessor";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { useSolanaAction } from "@/hooks/useSolanaAction";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Button } from "@/components/ui/button";
import { Send, Coins, Wallet, FileText, MessageSquare } from "lucide-react";
import { OCRResult } from "../lib/ocr-service";

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
    model: "gemini-2.5-pro",
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
    const [activeTab, setActiveTab] = React.useState<'chat' | 'ocr'>('chat');
    const [ocrResults, setOcrResults] = React.useState<OCRResult | null>(null);
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

  const handleOCRProcessingComplete = (result: OCRResult) => {
    setOcrResults(result);
    
    // Add AI message about successful OCR processing
    const ocrMessage: Message = {
      id: Date.now(),
      text: `🎉 Excellent! I've successfully processed your PDF containing ${result.documents.length} documents using AI OCR. Here's what I found:\n\n${result.documents.map((doc, index) => 
        `**${doc.name}:** ${Math.round(doc.confidence * 100)}% confidence`
      ).join('\n')}\n\n**Overall Confidence:** ${Math.round(result.overallConfidence * 100)}%\n**Document Hash:** ${result.mockHash.substring(0, 20)}...\n\nAll your documents are now ready for blockchain submission. The "Store on Chain" button is available in the OCR tab to permanently record this data on the Solana blockchain.`,
      sender: "ai",
    };
    
    setMessages(prev => [...prev, ocrMessage]);
    
    toast({
      title: "OCR Processing Complete!",
      description: `Successfully processed ${result.documents.length} documents with ${Math.round(result.overallConfidence * 100)}% confidence.`,
    });
  };

  const handleStoreOnChain = async (result: OCRResult) => {
    try {
      const transactionData = JSON.stringify({
        type: "BLUE_CARBON_DOCUMENTS",
        timestamp: new Date().toISOString(),
        user: localStorage.getItem("userEmail") || "anonymous",
        documentHash: result.mockHash,
        documents: result.documents.map(doc => ({
          name: doc.name,
          confidence: doc.confidence,
          fieldCount: Object.keys(doc.fields).length
        })),
        overallConfidence: result.overallConfidence,
        app: "blue-carbon-registry"
      });

      console.log("Storing documents on blockchain...");
      setIsAiTyping(true);

      const { signature, error } = await sendTransaction(transactionData);

      if (signature) {
        console.log("Documents stored successfully with signature:", signature);
        toast({
          title: "Documents Stored on Blockchain!",
          description: `Your documents are now permanently recorded. Signature: ${signature.substring(0, 12)}...`,
        });

        const successMessage: Message = {
          id: Date.now(),
          text: `🎉 **Success!** Your Blue Carbon documents have been permanently stored on the Solana blockchain!\n\n**Transaction Details:**\n- Signature: ${signature.substring(0, 16)}...\n- Document Hash: ${result.mockHash.substring(0, 20)}...\n- Documents Stored: ${result.documents.length}\n- Overall Confidence: ${Math.round(result.overallConfidence * 100)}%\n\nYour project data is now immutable and can be verified by anyone. This completes the document submission process for your Blue Carbon project!`,
          sender: "ai",
        };
        
        setMessages(prev => [...prev, successMessage]);
      }

      if (error) {
        console.error("Blockchain storage error:", error);
        toast({
          title: "Storage Failed",
          description: error.message || "Failed to store documents on blockchain",
          variant: "destructive",
        });

        setMessages(prev => [
          ...prev,
          {
            id: Date.now(),
            text: `❌ Failed to store documents on blockchain: ${error.message || "Unknown error occurred"}. Please ensure your wallet is connected and has sufficient funds.`,
            sender: "ai",
          },
        ]);
      }
    } catch (e) {
      console.error("Error in blockchain storage:", e);
      const errorMessage = e instanceof Error ? e.message : "Unknown error occurred";

      toast({
        title: "Storage Error",
        description: errorMessage,
        variant: "destructive",
      });

      setMessages(prev => [
        ...prev,
        {
          id: Date.now(),
          text: `❌ Error during blockchain storage: ${errorMessage}. Please try again later.`,
          sender: "ai",
        },
      ]);
    } finally {
      setIsAiTyping(false);
    }
  };

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
          subtitle="Submit your project details using our AI assistant or process documents with OCR."
        >
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
              <Wallet className="h-4 w-4 text-white drop-shadow-sm" />
              <span className="text-sm font-medium text-white drop-shadow-sm">
                {balance.toFixed(4)} SOL
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAirdrop}
              disabled={isSending}
            >
              <Coins className="h-4 w-4 mr-2" />
              {isSending ? "Requesting..." : "Add Balance"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleTestTransaction}
              disabled={isSending}
            >
              <Send className="h-4 w-4 mr-2" />
              {isSending ? "Sending..." : "Initialize"}
            </Button>
            <WalletMultiButton />
          </div>
        </DashboardHeader>
        
        <main className="max-w-6xl mx-auto space-y-10 p-6 sm:p-8 lg:p-12 relative">
          {/* Enhanced Tab Navigation */}
          <div className="flex gap-6 p-6 border-t border-gradient-to-r from-blue-800/30 via-blue-600/40 to-blue-800/30 bg-gradient-to-r from-blue-950/20 via-blue-900/30 to-blue-950/20 backdrop-blur-xl rounded-xl shadow-2xl shadow-blue-900/20 border border-blue-800/30 relative overflow-hidden">
            {/* Subtle background pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 via-transparent to-cyan-900/10 pointer-events-none" />
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-400/50 to-transparent" />
            
            <Button
              variant={activeTab === 'chat' ? 'default' : 'outline'}
              onClick={() => setActiveTab('chat')}
              className={`
                flex items-center gap-3 px-6 py-3 rounded-lg font-medium text-sm
                transition-all duration-300 ease-out transform relative z-10
                ${activeTab === 'chat' 
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-600/25 scale-105 border-blue-500/50' 
                  : 'bg-white/5 text-blue-100 border-blue-700/50 hover:bg-white/10 hover:border-blue-600/70 hover:text-white hover:scale-105 hover:shadow-lg hover:shadow-blue-600/20'
                }
                backdrop-blur-sm group
              `}
            >
              <MessageSquare className={`h-5 w-5 transition-transform duration-300 ${activeTab === 'chat' ? 'rotate-0' : 'group-hover:rotate-12'}`} />
              <span className="font-semibold tracking-wide">AI Assistant Chat</span>
              {activeTab === 'chat' && (
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-cyan-400/20 rounded-lg blur-sm -z-10" />
              )}
            </Button>
            
            <Button
              variant={activeTab === 'ocr' ? 'default' : 'outline'}
              onClick={() => setActiveTab('ocr')}
              className={`
                flex items-center gap-3 px-6 py-3 rounded-lg font-medium text-sm
                transition-all duration-300 ease-out transform relative z-10
                ${activeTab === 'ocr'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-lg shadow-emerald-600/25 scale-105 border-emerald-500/50'
                  : 'bg-white/5 text-blue-100 border-blue-700/50 hover:bg-white/10 hover:border-emerald-600/70 hover:text-white hover:scale-105 hover:shadow-lg hover:shadow-emerald-600/20'
                }
                backdrop-blur-sm group
              `}
            >
              <FileText className={`h-5 w-5 transition-transform duration-300 ${activeTab === 'ocr' ? 'rotate-0' : 'group-hover:rotate-12'}`} />
              <span className="font-semibold tracking-wide">Document OCR Processor</span>
              {activeTab === 'ocr' && (
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-teal-400/20 rounded-lg blur-sm -z-10" />
              )}
            </Button>

            {/* Decorative elements */}
            <div className="absolute -top-2 -right-2 w-20 h-20 bg-gradient-to-br from-blue-400/10 to-cyan-400/10 rounded-full blur-xl" />
            <div className="absolute -bottom-2 -left-2 w-16 h-16 bg-gradient-to-br from-emerald-400/10 to-teal-400/10 rounded-full blur-xl" />
          </div>

          {/* Content based on active tab */}
          {activeTab === 'chat' ? (
            <Chatbot
              messages={messages}
              isAiTyping={isAiTyping}
              onSendMessage={handleSendMessage}
              onFileUpload={handleFileUpload}
              isTtsEnabled={isTtsEnabled}
              setIsTtsEnabled={setIsTtsEnabled}
            />
          ) : (
            <DocumentProcessor 
              onProcessingComplete={handleOCRProcessingComplete}
              onStoreOnChain={handleStoreOnChain}
            />
          )}
        </main>
      </div>
      <BackgroundBeams />
    </div>
  );
};

export default NGODashboard;