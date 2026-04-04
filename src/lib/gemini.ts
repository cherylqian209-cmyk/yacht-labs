import { GoogleGenAI } from "@google/genai";

const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second

export async function callGeminiWithRetry(fn: () => Promise<any>, retries = MAX_RETRIES, delay = INITIAL_RETRY_DELAY): Promise<any> {
  try {
    return await fn();
  } catch (error: any) {
    const isTransientError = 
      error?.message?.includes('503') || 
      error?.message?.includes('Service Unavailable') ||
      error?.message?.includes('504') ||
      error?.message?.includes('Gateway Timeout') ||
      error?.message?.includes('429') ||
      error?.message?.includes('Too Many Requests') ||
      error?.message?.includes('fetch failed');

    if (retries > 0 && isTransientError) {
      console.warn(`Gemini API error (retrying in ${delay}ms...):`, error.message);
      await new Promise(resolve => setTimeout(resolve, delay));
      return callGeminiWithRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
}

export const chatWithGemini = async (
  messages: { 
    role: string, 
    content: string, 
    fileData?: string, 
    fileType?: string, 
    files?: { url: string, name: string, type: string, data?: string }[] 
  }[], 
  systemInstruction?: string
) => {
  const ai = new GoogleGenAI({ apiKey: (window as any).process?.env?.API_KEY || process.env.GEMINI_API_KEY });
  
  const contents = await Promise.all(messages.map(async m => {
    const parts: any[] = [{ text: m.content }];
    
    if (m.files && m.files.length > 0) {
      for (const file of m.files) {
        if (file.data) {
          // Use provided base64 data directly
          parts.push({
            inlineData: {
              data: file.data.split(',')[1] || file.data,
              mimeType: file.type
            }
          });
        } else if (file.type.startsWith('image/') || file.type === 'application/pdf' || file.type.startsWith('text/')) {
          try {
            const res = await fetch(file.url);
            if (!res.ok) throw new Error(`Failed to fetch ${file.url}`);
            const blob = await res.blob();
            const base64 = await new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
              reader.readAsDataURL(blob);
            });
            parts.push({
              inlineData: {
                data: base64,
                mimeType: file.type
              }
            });
          } catch (e) {
            console.error("Failed to fetch file for Gemini:", e);
            parts.push({ text: `\n[Reference File: ${file.name} - ${file.url}]` });
          }
        } else {
          parts.push({ text: `\n[Reference File: ${file.name} - ${file.url}]` });
        }
      }
    }

    // Handle single file (legacy/compatibility)
    if (m.fileData && m.fileType && (!m.files || m.files.length === 0)) {
      if (m.fileData.startsWith('http')) {
        if (m.fileType.startsWith('image/')) {
          try {
            const res = await fetch(m.fileData);
            const blob = await res.blob();
            const base64 = await new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
              reader.readAsDataURL(blob);
            });
            parts.push({
              inlineData: {
                data: base64,
                mimeType: m.fileType
              }
            });
          } catch (e) {
            console.error("Failed to fetch file for Gemini:", e);
            parts.push({ text: `[Attached File: ${m.fileData}]` });
          }
        } else {
          parts.push({ text: `\n[Reference File: ${m.fileData}]` });
        }
      } else {
        parts.push({
          inlineData: {
            data: m.fileData.split(',')[1] || m.fileData,
            mimeType: m.fileType
          }
        });
      }
    }
    return { 
      role: m.role === "user" ? "user" : "model", 
      parts 
    };
  }));

  const response = await Promise.race([
    callGeminiWithRetry(() => ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents,
      config: {
        systemInstruction: systemInstruction || `SYSTEM: You are the Yacht Labs Synthesis Engine. Your goal is to produce a ROBUST Project Architecture.
1. INTERNAL LOGIC: Before outputting, perform a "Step-by-Step" analysis of the user's request. Wrap your internal reasoning in <thought> tags.
2. STRUCTURE: Always provide a "File Tree" or "Asset List" followed by the content for each asset.
3. MULTI-FILE LOGIC: Use the delimiter [FILE: filename.ext] before each file's content.
4. PRESENTATION LOGIC: Use horizontal rules (---) to separate major sections or "slides" within each file's content.
5. ERROR HANDLING: Identify potential "Friction Points" in the build and provide a "Safety Script" to fix them.
6. FORMATTING: Output strictly in Markdown. Use triple backticks for all code. Ensure all markdown content is properly formatted with newlines, headers, and bullet points. Do NOT collapse everything into a single line. Use double newlines (\n\n) between paragraphs and sections to ensure readability.
7. NO CONVERSATION: Start immediately with [PROJECT ARCHITECTURE INITIALIZED].`,
        temperature: 1,
        topP: 0.95,
        topK: 64,
        maxOutputTokens: 8192,
        responseMimeType: "text/plain",
        tools: [{ urlContext: {} }]
      }
    })),
    new Promise<any>((_, reject) => setTimeout(() => reject(new Error('Chat synthesis timed out')), 90000)) // Increased timeout to account for retries
  ]);
  
  return response.text;
};

export const generateDesignPrompt = async (
  target: 'deck' | 'landing' | 'brand' | 'bait' | 'landing_gen' | 'scaffolder' | 'custom',
  context: string,
  files?: { data: string, type: string }[]
) => {
  const ai = new GoogleGenAI({ apiKey: (window as any).process?.env?.API_KEY || process.env.GEMINI_API_KEY });
  
  const targetLabel = 
    target === 'deck' ? 'investor deck' : 
    target === 'landing' ? 'landing page' : 
    target === 'brand' ? 'brand identity' : 
    target === 'bait' ? 'personalized outreach invite (The Bait)' :
    target === 'landing_gen' ? 'SaaS Landing Page Structure & Copy' :
    target === 'scaffolder' ? 'Project Roadmap & Scaffolding' :
    'Custom Project Brief';

  const specificInstructions = 
    target === 'landing_gen' ? `
      Focus on:
      1. Hero Section (Headline, Subheadline, CTA)
      2. Problem/Solution Framework
      3. Feature Breakdown (Benefit-driven)
      4. Social Proof/Trust Signals
      5. Pricing Tiers & FAQ
      6. Conversion-focused Copywriting
    ` : 
    target === 'scaffolder' ? `
      Focus on:
      1. Project Roadmap (Phases 1-4)
      2. Recommended Tech Stack (Frontend, Backend, DB, Auth)
      3. Initial Task List (Backlog)
      4. Potential Technical Blockers & Solutions
      5. MVP Scope Definition
    ` : target === 'custom' ? `
      Focus on:
      1. Core Value Proposition
      2. User Experience Flow
      3. Technical Architecture
      4. Visual Language & Branding
      5. Implementation Roadmap
    ` : `
      Include specific instructions for:
      1. Visual Style & Aesthetic (e.g., Minimalist, Brutalist, Swiss Modern)
      2. Color Palette (with hex codes if applicable)
      3. Typography (font pairings and hierarchy)
      4. Layout & Composition (grid systems, spacing, focal points)
      5. Key Content Sections & Messaging
      6. Specific Imagery or Asset requirements
    `;

  const parts: any[] = [
    { text: `You are a world-class creative director and design engineer. 
    Your task is to synthesize the provided research and notes into a single, comprehensive "Master Design Prompt" or "Strategic Brief" for a ${targetLabel}.
    
    The output should be so detailed that it could be handed to a senior professional or a high-end AI to produce a production-ready result.
    
    ${specificInstructions}
    
    Context/Notes: ${context}` }
  ];

  if (files && files.length > 0) {
    // Limit to first 3 files to keep payload small and fast
    for (const file of files.slice(0, 3)) {
      const base64Data = file.data.split(',')[1] || file.data;
      if (file.type.startsWith('image/') || file.type === 'application/pdf' || file.type.startsWith('text/')) {
        parts.push({
          inlineData: {
            data: base64Data,
            mimeType: file.type
          }
        });
      }
    }
  }

  const response = await Promise.race([
    callGeminiWithRetry(() => ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ parts }],
      config: {
        systemInstruction: `SYSTEM: You are the Yacht Labs Synthesis Engine. Your goal is to produce a ROBUST Project Architecture.
1. INTERNAL LOGIC: Before outputting, perform a "Step-by-Step" analysis of the user's request. Wrap your internal reasoning in <thought> tags.
2. STRUCTURE: Always provide a "File Tree" or "Asset List" followed by the content for each asset.
3. MULTI-FILE LOGIC: Use the delimiter [FILE: filename.ext] before each file's content.
4. INTERACTIVE PROTOTYPES: If the user's request implies a visual or interactive result, you MUST include a standalone "index.html" file that contains all necessary CSS (via Tailwind CDN) and JS (vanilla or simple script) to create a fully functional, interactive prototype.
5. PRESENTATION LOGIC: Use horizontal rules (---) to separate major sections or "slides" within each file's content.
6. ERROR HANDLING: Identify potential "Friction Points" in the build and provide a "Safety Script" to fix them.
7. FORMATTING: Output strictly in Markdown. Use triple backticks for all code. Ensure all markdown content is properly formatted with newlines, headers, and bullet points. Do NOT collapse everything into a single line. Use double newlines (\n\n) between paragraphs and sections to ensure readability.
8. NO CONVERSATION: Start immediately with [PROJECT ARCHITECTURE INITIALIZED].`,
        temperature: 1,
        topP: 0.95,
        topK: 64,
        maxOutputTokens: 8192,
        responseMimeType: "text/plain",
      }
    })),
    new Promise<any>((_, reject) => setTimeout(() => reject(new Error('Prompt generation timed out. Please try with fewer files or a shorter context.')), 90000))
  ]);

  return response.text;
};

export const validateSynthesis = async (originalGoal: string, generatedBuild: string) => {
  const ai = new GoogleGenAI({ apiKey: (window as any).process?.env?.API_KEY || process.env.GEMINI_API_KEY });
  
  const response = await callGeminiWithRetry(() => ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [{ 
      parts: [{ 
        text: `SANITY CHECK: Does the following build actually solve the user's original goal?
        
        USER GOAL: ${originalGoal}
        
        GENERATED BUILD:
        ${generatedBuild.substring(0, 2000)}... (truncated for check)
        
        Respond with exactly "YES" or "NO". If NO, provide a 1-sentence reason why.` 
      }] 
    }],
    config: {
      temperature: 0.1,
      responseMimeType: "text/plain",
    }
  }));

  const result = response.text.trim().toUpperCase();
  return {
    isValid: result.startsWith('YES'),
    reason: result.startsWith('NO') ? result.replace('NO', '').trim() : null
  };
};
