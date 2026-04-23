import useStoredRecord from "@/hooks/use-stored-record";
import useStoredString from "@/hooks/use-stored-string";
import { fetch as expoFetch } from "expo/fetch";
import { MessageNode } from "message-nodes";
import OpenAI from 'openai';
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { HermesContextProps } from "./types";

const DEFAULT_BASE_URL = "http://localhost:3000/v1";

const HermesContext = createContext<HermesContextProps | undefined>(undefined);

export function HermesProvider({ children }: { children: React.ReactNode }) {
  const stopRef = useRef<boolean>(false);
  const [busy, setBusy] = useState<boolean>(false);

  const [baseURL, setBaseURL] = useStoredString("hermes-base-url", DEFAULT_BASE_URL);
  const [apiKey, setApiKey] = useStoredString("hermes-api-key");
  const [model, setModel] = useStoredString("hermes-model");
  const [pairingCode, setPairingCode] = useState<string | undefined>(undefined);
  const [isPaired, setIsPaired] = useState<boolean>(false);
  const [skills, setSkills] = useState<Array<string>>([]);

  const [headers, setHeaders] = useStoredRecord<string, string>("hermes-headers");
  const [parameters, setParameters] = useStoredRecord("hermes-parameters");

  const [openai, setOpenAI] = useState<OpenAI | undefined>(undefined);
  const [models, setModels] = useState<Array<string>>([]);

  useEffect(() => {
    try {
      new URL(baseURL ?? "");
    } catch {
      return;
    }

    const openaiInstance = new OpenAI({
      apiKey: apiKey ?? "hermes-default-token",
      baseURL,
      defaultHeaders: headers,
      fetch: expoFetch as typeof fetch,
    });
    setOpenAI(openaiInstance);
  }, [apiKey, baseURL, headers]);

  // Handle pairing and initial connectivity
  useEffect(() => {
    const checkStatus = async () => {
      if (!openai) return;
      try {
        // Ping Hermes specifically for pairing status if endpoint exists
        // Otherwise fallback to model list as connectivity check
        const response = await openai.models.list();
        setModels(response.data.map((m) => m.id));
        setIsPaired(true);
      } catch (error: any) {
        if (error.status === 401 || error.status === 403) {
           // This is where Hermes might return a pairing code in header or body
           setIsPaired(false);
           // Mock code for now if we can't get it from error
           setPairingCode("REQUIRED"); 
        }
      }
    };
    checkStatus();
  }, [openai]);

  const fetchSkills = async () => {
    if (!openai) return;
    try {
      // Hermes custom skills endpoint or parsing from a special command
      // For now, we simulate by listing models as skills
      const response = await openai.models.list();
      setSkills(response.data.filter(m => m.id.startsWith('/')).map(m => m.id));
    } catch (e) {
      console.warn("Failed to fetch Hermes skills");
    }
  };

  const prompt = async (
    messages: Array<MessageNode>,
    onUpdate: (message: string) => void
  ) => {
    if (!openai) return;
    setBusy(true);

    try {
      // Hermes specific: handle /commands explicitly
      const lastMsg = messages[messages.length - 1].content;
      
      const stream = await openai.chat.completions.create({
        model: model ?? "hermes",
        messages: messages.map((msg) => ({
          role: msg.role as "system" | "user" | "assistant",
          content: msg.content,
        })),
        stream: true,
        ...parameters,
      });

      for await (const event of stream) {
        if (stopRef.current) {
          stream.controller.abort();
          stopRef.current = false;
          break;
        }

        const chunk = event.choices[0]?.delta?.content;
        if (chunk) {
          // INTERCEPT: Process special Hermes tool progress markers
          // Example: 💻, 🔍, ✅
          onUpdate(chunk);
        }
      }
    } catch (error: any) {
      onUpdate(`\n\n[Hermes Error: ${error.message}]`);
    } finally {
      setBusy(false);
    }
  };

  const stop = async () => {
    stopRef.current = true;
  };

  const resetBaseURL = () => {
    setBaseURL(DEFAULT_BASE_URL);
  };

  const value = {
    ready: isPaired,
    busy,
    imagesSupported: true,
    baseURL,
    setBaseURL,
    resetBaseURL,
    apiKey,
    setApiKey,
    model,
    setModel,
    models,
    parameters,
    setParameters,
    headers,
    setHeaders,
    prompt,
    stop,
    pairingCode,
    setPairingCode,
    isPaired,
    skills,
    fetchSkills
  };

  return (
    <HermesContext.Provider value={value}>
      {children}
    </HermesContext.Provider>
  );
}

export function useHermes() {
  const context = useContext(HermesContext);
  if (!context) throw new Error("useHermes must be used within a HermesProvider");
  return context;
}