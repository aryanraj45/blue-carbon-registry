import React, { useState, useEffect, useCallback, useReducer } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { useToast } from "@/hooks/use-toast";
import { useSolanaAction } from "@/hooks/useSolanaAction";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Button } from "@/components/ui/button";
import { Send, Coins, Wallet } from "lucide-react";
import { Chatbot } from "@/components/Chatbot";
import { BackgroundBeams } from "@/components/ui/background-beams";
import DashboardHeader from "./DashboardHeader";

// Assume assets are imported as before
import data1 from "@/assets/data1.png";
// ... other asset imports

//=========== TYPE DEFINITIONS ===========//
type Message = { id: number | string; text: string; sender: "user" | "ai"; documents?: { url: string; title: string }[] };
type GeminiHistoryItem = { role: "user" | "model"; parts: { text: string }[] };

//=========== API CONFIGURATION ===========//
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
let genAI: GoogleGenerativeAI | null = null;
if (API_KEY) {
  genAI = new GoogleGenerativeAI(API_KEY);
} else {
  console.error("VITE_GEMINI_API_KEY is not set. The chatbot will not function.");
}


//=========== CUSTOM HOOKS (IN-FILE) ===========//

// --- Hook for Text-to-Speech ---
const useTextToSpeech = (messages: Message[], isTtsEnabled: boolean) => {
    useEffect(() => {
        const speak = (textToSpeak: string) => {
            if (!('speechSynthesis' in window)) return;
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(textToSpeak);
            utterance.lang = 'en-US';
            window.speechSynthesis.speak(utterance);
        };

        const lastMessage = messages[messages.length - 1];
        if (isTtsEnabled && lastMessage?.sender === 'ai') {
            speak(lastMessage.text);
        }
        
        return () => window.speechSynthesis.cancel();
    }, [messages, isTtsEnabled]);
};

// --- Hook for Gemini Chat Logic ---
const useGeminiChat = () => {
    const [messages, setMessages] = useState<Message[]>([
        { id: 1, text: "Welcome! I am VerifiAI. To begin, tell me the official name of your blue carbon project, or choose a suggestion below.", sender: "ai" },
    ]);
    const [isAiTyping, setIsAiTyping] = useState(false);
    const { toast } = useToast();

    const addMessage = (message: Message) => {
        setMessages(prev => [...prev, message]);
    };

    const handleSendMessage = useCallback(async (userInput: string) => {
        if (!genAI) {
            toast({ title: "API Key Not Configured", variant: "destructive" });
            return;
        }

        addMessage({ id: Date.now(), text: userInput, sender: "user" });
        setIsAiTyping(true);

        // Handle hardcoded responses
        // This could be moved to a separate utility function for even more cleanliness
        if (userInput.toLowerCase().includes("documents do i need")) {
            setTimeout(() => {
                addMessage({ id: Date.now() + 1, sender: 'ai', text: 'Certainly! Here are the core documents required...', documents: [{ url: data1, title: 'Legal Registration' } /* ... */] });
                setIsAiTyping(false);
            }, 1500);
            return;
        }
        // ... other hardcoded responses like "satellite verification"

        try {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", systemInstruction: `You are VerifiAI...` });
            // ... API call logic from original file ...
            const chat = model.startChat({ history: [] /* Simplified for example */ });
            const result = await chat.sendMessage(userInput);
            addMessage({ id: Date.now() + 1, text: result.response.text(), sender: "ai" });
        } catch (error) {
            console.error("Gemini API error:", error);
            addMessage({ id: Date.now(), text: "Sorry, I encountered an error.", sender: "ai" });
            toast({ title: "AI Error", variant: "destructive" });
        } finally {
            setIsAiTyping(false);
        }
    }, [toast]);

    const handleFileUpload = useCallback((file: File) => {
        addMessage({ id: Date.now(), text: `File Uploaded: **${file.name}**`, sender: "user" });
        setIsAiTyping(true);
        setTimeout(() => {
            addMessage({ id: Date.now() + 1, text: `Thank you for uploading **${file.name}**. I have attached it.`, sender: "ai" });
            setIsAiTyping(false);
        }, 1500);
    }, []);

    return { messages, isAiTyping, handleSendMessage, handleFileUpload };
};

// --- Hook for Solana Wallet Actions ---
const useSolanaWallet = (addMessage: (msg: Message) => void) => {
    const { sendTransaction, requestAirdrop, getBalance, isSending } = useSolanaAction();
    const [balance, setBalance] = useState(0);
    const { toast } = useToast();

    const updateBalance = useCallback(async () => {
        setBalance(await getBalance());
    }, [getBalance]);

    useEffect(() => {
        updateBalance();
    }, [updateBalance]);

    const handleTx = async (action: 'airdrop' | 'test_transaction') => {
        const actionPromise = action === 'airdrop' ? requestAirdrop() : sendTransaction(JSON.stringify({ type: "TEST" }));
        
        try {
            const { signature, error } = await actionPromise;
            if (error) throw error;

            toast({ title: `${action} Successful!`, description: `Signature: ${signature.substring(0,12)}...` });
            const newBalance = await getBalance();
            setBalance(newBalance);
            addMessage({ id: Date.now(), text: `✅ ${action} was successful! New balance: ${newBalance.toFixed(4)} SOL`, sender: "ai" });
        } catch (err: any) {
            toast({ title: `${action} Failed`, description: err.message, variant: "destructive" });
            addMessage({ id: Date.now(), text: `❌ ${action} failed: ${err.message}`, sender: "ai" });
        }
    };

    return { balance, isSending, handleAirdrop: () => handleTx('airdrop'), handleTestTransaction: () => handleTx('test_transaction') };
};


//=========== UI SUB-COMPONENTS (IN-FILE) ===========//

const WalletActions = React.memo(({ balance, isSending, onAirdrop, onTestTx }: any) => (
    <div className="flex items-center gap-2">
        <div className="text-sm text-gray-400 flex items-center gap-1"><Wallet className="h-3 w-3" />{balance.toFixed(4)} SOL</div>
        <Button variant="outline" size="sm" onClick={onAirdrop} disabled={isSending}><Coins className="h-4 w-4 mr-2" />{isSending ? "Requesting..." : "Get Free SOL"}</Button>
        <Button variant="outline" size="sm" onClick={onTestTx} disabled={isSending}><Send className="h-4 w-4 mr-2" />{isSending ? "Sending..." : "Test Tx"}</Button>
        <WalletMultiButton />
    </div>
));


//=========== MAIN DASHBOARD COMPONENT ===========//

const NGODashboard = () => {
    const { messages, isAiTyping, handleSendMessage, handleFileUpload } = useGeminiChat();
    const { balance, isSending, handleAirdrop, handleTestTransaction } = useSolanaWallet((msg) => setMessages(prev => [...prev, msg]));
    const [isTtsEnabled, setIsTtsEnabled] = useState(false);
    
    // This state now needs to be managed here to be passed to the wallet hook
    const [allMessages, setMessages] = useState(messages);
    useEffect(() => { setMessages(messages) }, [messages]);

    useTextToSpeech(allMessages, isTtsEnabled);

    return (
        <div className="min-h-screen w-full bg-neutral-950 relative antialiased">
            <div className="relative z-10 w-full">
                <DashboardHeader
                    title="NGO Project Portal"
                    subtitle="Submit your project details using our AI assistant below."
                >
                    <WalletActions 
                        balance={balance}
                        isSending={isSending}
                        onAirdrop={handleAirdrop}
                        onTestTx={handleTestTransaction}
                    />
                </DashboardHeader>
                <main className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
                    <Chatbot
                        messages={allMessages}
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