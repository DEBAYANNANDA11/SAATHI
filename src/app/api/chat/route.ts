import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// ========================================================
// SAATHI NATURAL COMPANION PROMPT ARCHITECTURE
// ========================================================
const MASTER_THERAPIST_SYSTEM_PROMPT = `You are Saathi (meaning "true companion / soul friend"), a deeply empathetic, authentic, and perceptive best friend who talks just like a caring human companion (similar to ChatGPT at its most natural, supportive, and engaging).

YOUR GOLDEN CONVERSATIONAL RULES:
1. TALK LIKE A REAL BEST FRIEND — NATURAL, VARIED & SPONTANEOUS:
   - Talk naturally, warmly, and casually. Sound like someone texting or sitting right beside the user on a cozy couch.
   - NEVER use repetitive, robotic template openers like "Oh, I'm so sorry to hear that", "Take a deep breath with me", or "Let's reset together". Vary your opening, cadence, and expressions every single time!
   - Use warm, relatable language. No stiff clinical jargon, no formulaic bulleted checklists unless asked.

2. CRUCIAL: DO NOT GIVE UNSOLICITED SOLUTIONS, SONGS, OR EXERCISES:
   - When a friend vents to you, they usually just want to be HEARD, understood, and validated — NOT bombarded with a 3-step action plan, breathing drills, or song recommendations!
   - If the user is just venting, sharing feelings, or talking about their day:
     * Listen actively and validate their emotion with genuine, heartfelt companionship.
     * Mirror their reality with empathy: show that you truly "get" why they feel that way.
     * Ask a natural, caring question to let them vent or explore their thoughts further.
   - ONLY PROVIDE SPECIFIC SOLUTIONS OR SONG RECOMMENDATIONS IF:
     * The user explicitly asks for advice, music, or solutions (e.g., "what should I do?", "suggest some songs", "how do I fix this?", "give me tips", "can you help me solve this?").
     * When they DO ask for solutions or songs, tailor them specifically to their taste and situation (English, Hindi, Bengali songs, or practical steps), and make them fresh, diverse, and creative every time!

3. ADAPT TO THEIR VIBE & CELEBRATE WITH THEM:
   - If they are happy or excited, match their joy! Laugh with them, hype them up, ask for details, and celebrate their wins with genuine enthusiasm.
   - If they are tired, hurt, or feeling down, be their safe anchor. Comfort them without preaching or rushing to "fix" them. Remind them that they are loved and never alone.

4. KEEP RESPONSES CONCISE & READABLE:
   - Keep answers punchy and conversational (around 2-3 short, natural paragraphs, 80-150 words). Don't write essays.

CRISIS SAFETY:
If the user expresses active intent of self-harm or suicide, drop casualness and warmly provide urgent crisis helplines (Tele-MANAS: 14416, AASRA: +91-9820466726, Vandrevala Foundation: +91-9999666555) with deep personal care.`;

// ========================================================
// HIGH-EQ NATURAL COMPANION ENGINE (Offline Fallback)
// ========================================================
function generateClinicalMasterResponse(
  userText: string,
  history: Array<{ role: string; content: string }>,
  userName: string,
  distressScore: number,
  modality: 'compassion' | 'cbt' | 'somatic' | 'socratic' = 'compassion'
): string {
  const lower = userText.toLowerCase();
  const name = userName || 'friend';

  // Check if user explicitly asked for advice, songs, or solutions
  const asksForSolutions = lower.includes('what should i do') || lower.includes('suggest') || lower.includes('song') || lower.includes('music') || lower.includes('solution') || lower.includes('help me with') || lower.includes('how to') || lower.includes('advice') || lower.includes('tips') || lower.includes('playlist') || lower.includes('recommend');

  // 1. Critical Safety & Crisis De-escalation
  const crisisKeywords = ['kill myself', 'end it', 'die', 'harm myself', 'suicide', 'give up on life', 'cant go on', "can't go on", 'no reason to live', 'end my life'];
  for (const trigger of crisisKeywords) {
    if (lower.includes(trigger)) {
      return `Please hold on, ${name}. I am right here with you, and your life matters deeply to me. 💚

I hear how much pain you're in, but please don't carry this alone tonight. Let's get someone with trained hands to support you right this second:

- **Tele-MANAS**: Dial **14416** or **1800-891-4416** (Toll-Free, 24/7)
- **AASRA**: **+91-9820466726** (24/7)
- **Vandrevala Foundation**: Call or WhatsApp **+91-9999666555**

Please tap your Emergency Contact or message someone you trust right now. Will you text me back to let me know you're safe?`;
    }
  }

  // If user explicitly asks for songs or solutions
  if (asksForSolutions) {
    if (lower.includes('song') || lower.includes('music') || lower.includes('playlist')) {
      return `I've got you covered with some great vibes, ${name}! Here are a few songs that always lift spirits:

- 🇬🇧 **English**: *"Better Days"* by OneRepublic or *"Here Comes The Sun"* by The Beatles (pure warmth and instant mood lifter).
- 🇮🇳 **Hindi**: *"Love You Zindagi"* (Dear Zindagi) or *"Ilahi"* (Yeh Jawaani Hai Deewani) to get your energy and smile back.
- 🌾 **Bengali**: *"Aalo Aalo"* (Joy Sarkar / Shaan) or *"Majhe Majhe Tobo Dekha Pai"* for deep comfort.

Which one matches the vibe you're looking for right now? 🎶`;
    }

    if (lower.includes('exam') || lower.includes('study')) {
      return `Here's my favorite trick when exams feel overwhelming, ${name}:

Don't look at the entire syllabus right now—that's what causes the panic. Just pick **one tiny question or single page**, set a timer for 5 minutes, and tell yourself you only have to do those 5 minutes. 

Once you get that first spark of momentum, the heavy anxiety almost always drops. Want to pick that one small topic right now? I'm rooting for you!`;
    }

    return `If you want my honest advice on this, ${name}, let's keep it super simple:

Focus strictly on what is in your hands for the next couple of hours, and give yourself permission to put everything else on pause. You don't have to figure out your whole life today.

What's the one small thing that would give you even 10% more relief if we dealt with it right now?`;
  }

  // NATURAL CONVERSATION (Friend listening & comforting without dumping unsolicited advice)
  if (lower.includes('exam') || lower.includes('fail') || lower.includes('study') || lower.includes('test') || lower.includes('marks') || lower.includes('career') || lower.includes('future')) {
    const openings = [
      `Man, academic pressure is honestly brutal, ${name}. I completely understand why you're feeling so stressed about this.`,
      `I hear you, ${name}. That heavy feeling in your chest when exams are coming up is so exhausting to deal with.`,
      `Totally get where you're coming from, ${name}. It feels like everyone expects the world from you, and it gets so overwhelming.`
    ];
    const opener = openings[Math.floor(Math.random() * openings.length)];
    return `${opener}

Just remember that this test or situation doesn't define who you are or what you're capable of. You're so much more than a grade or a score. 

Is there a specific exam or subject that's giving you the most stress right now, or is it just the general pile-up? Tell me what's on your mind.`;
  }

  if (lower.includes('tired') || lower.includes('exhausted') || lower.includes('burnout') || lower.includes('drained') || lower.includes('cant handle') || lower.includes("can't handle")) {
    return `Honestly, ${name}, it sounds like your battery is completely on 1%. You've been pushing through for so long without a real break, haven't you?

You don't need to be productive or strong 24/7. It's completely valid to just hit pause, wrap up in a blanket, and not worry about fixing anything for a while. 

Did something specific drain you today, or has this exhaustion been building up all week?`;
  }

  if (lower.includes('happy') || lower.includes('great') || lower.includes('better') || lower.includes('proud') || lower.includes('joy') || lower.includes('excited') || lower.includes('smiling')) {
    return `YES! Hearing you in this good headspace genuinely made my day, ${name}! ✨

You've worked through some tough moments to get here, and you 100% deserve to soak in this good energy. 

What's the highlight that put you in such a great mood? Tell me all about it! 🎉`;
  }

  if (lower.includes('sad') || lower.includes('crying') || lower.includes('hurt') || lower.includes('lonely') || lower.includes('alone') || lower.includes('depressed') || lower.includes('dark circles')) {
    return `I'm sitting right here with you, ${name}. You don't have to put on a brave face or pretend everything is okay when it's not. 💚

Whatever is making you feel this way, your feelings are completely valid and you are definitely not alone. I'm right here to listen as long as you need.

Do you want to vent about what happened, or would you rather we just talk about something comforting?`;
  }

  // Default Natural Companion
  return `I'm right here listening, ${name}. You can always talk to me about anything—good days, bad days, or whatever random thoughts are floating around in your head.

What's been the biggest thing on your mind today?`;
}

// In-memory cache for models that hit 429 quota limits (skip for 5 minutes to prevent wasted latency)
const quotaBlockedModels = new Map<string, number>();

// Helper to run a promise with a fast timeout (prevents hanging)
function withTimeout<T>(promise: Promise<T>, ms: number, desc: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Timeout of ${ms}ms exceeded for ${desc}`)), ms)
    ),
  ]);
}

// ========================================================
// API ROUTE HANDLER (Streaming Output)
// ========================================================
export async function POST(req: Request) {
  try {
    const { messages, distressScore, userName, modality = 'compassion' } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Invalid messages array.' }, { status: 400 });
    }

    const lastUserMessage = messages[messages.length - 1]?.content || '';
    const apiKey = (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '').trim();

    console.log('[API /api/chat] Incoming request for client:', userName || 'Friend', '| Distress:', distressScore || 35);
    console.log('[API /api/chat] Key status:', apiKey ? `Present (length: ${apiKey.length}, prefix: "${apiKey.slice(0, 4)}...")` : 'EMPTY/UNDEFINED (Using offline clinical master engine)');

    // 1. Live Google Gemini Engine (Prioritizing ultra-fast flash-lite)
    if (apiKey !== '') {
      const candidateModels = ['gemini-flash-lite-latest', 'gemini-2.5-flash', 'gemini-flash-latest'];
      const now = Date.now();
      const genAI = new GoogleGenerativeAI(apiKey);

      for (const modelName of candidateModels) {
        // Skip models currently blocked by 429 quota (for 5 minutes)
        const blockedUntil = quotaBlockedModels.get(modelName);
        if (blockedUntil && blockedUntil > now) {
          console.log(`[API /api/chat] Skipping "${modelName}" (quota blocked for another ${Math.round((blockedUntil - now) / 1000)}s)`);
          continue;
        }

        try {
          console.log(`[API /api/chat] Attempting ultra-fast stream with Gemini model "${modelName}"...`);
          const model = genAI.getGenerativeModel({
            model: modelName,
            systemInstruction: MASTER_THERAPIST_SYSTEM_PROMPT,
            generationConfig: {
              temperature: 0.7,
              topP: 0.9,
              maxOutputTokens: 220,
            } as any,
          });

          // Format history (last 8 turns for high speed)
          const recentMessages = messages.slice(-8);
          const formattedHistory = recentMessages.slice(0, -1).map((msg: any) => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }],
          }));

          const chatSession = model.startChat({
            history: [
              {
                role: 'user',
                parts: [{
                  text: `[Companion Parameters: Friend Name: ${userName || 'Friend'}. Current distress: ${distressScore || 35}/100. Directive: Talk naturally like a real, supportive best friend. Be casual, fast, empathetic, and comforting. Do NOT give unsolicited song lists, exercises, or food unless the user specifically asks. Keep replies punchy (40-80 words).]`,
                }],
              },
              {
                role: 'model',
                parts: [{
                  text: `Hey ${userName || 'friend'}! I'm Saathi, your true friend. I'm right here with you!`,
                }],
              },
              ...formattedHistory,
            ],
          });

          // 3500ms safety timeout: prevents hanging if a model is slow or stalls
          const resultStream = await withTimeout(
            chatSession.sendMessageStream(lastUserMessage),
            3500,
            `Gemini stream init (${modelName})`
          );
          console.log(`[API /api/chat] Successfully opened stream with model "${modelName}". Streaming tokens...`);

          const encoder = new TextEncoder();
          const stream = new ReadableStream({
            async start(controller) {
              try {
                for await (const chunk of resultStream.stream) {
                  const chunkText = chunk.text();
                  if (chunkText) {
                    controller.enqueue(encoder.encode(chunkText));
                  }
                }
                controller.close();
              } catch (streamErr) {
                console.error('[API /api/chat] Gemini stream chunk error:', streamErr);
                controller.error(streamErr);
              }
            },
          });

          return new Response(stream, {
            headers: {
              'Content-Type': 'text/plain; charset=utf-8',
              'Transfer-Encoding': 'chunked',
              'Cache-Control': 'no-cache, no-transform',
            },
          });
        } catch (modelErr: any) {
          const errMsg = modelErr?.message || String(modelErr);
          console.warn(`[API /api/chat] Model "${modelName}" failed:`, errMsg.slice(0, 140));

          // If quota exceeded (429), block this model for 5 minutes so subsequent chats don't lag
          if (errMsg.includes('429') || errMsg.includes('Quota exceeded')) {
            quotaBlockedModels.set(modelName, Date.now() + 5 * 60 * 1000);
            console.warn(`[API /api/chat] Cached "${modelName}" as quota-blocked for 5 minutes.`);
          }
        }
      }
    }

    console.log('[API /api/chat] Serving High-EQ Clinical Master Engine instant fallback...');

    // 2. High-EQ Solution-Focused Clinical Master Engine (Local Fallback)
    const masterResponse = generateClinicalMasterResponse(
      lastUserMessage,
      messages,
      userName || 'Friend',
      distressScore || 35,
      modality
    );

    // Stream the solution-oriented response chunk by chunk with high responsiveness (5 words per tick, 4ms delay)
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const words = masterResponse.split(' ');
        let buffer = '';

        for (let i = 0; i < words.length; i++) {
          buffer += (i === 0 ? '' : ' ') + words[i];
          if (i % 5 === 0 || i === words.length - 1) {
            controller.enqueue(encoder.encode(buffer));
            buffer = '';
            await new Promise((resolve) => setTimeout(resolve, 4));
          }
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache, no-transform',
      },
    });

  } catch (error: any) {
    console.error('Error in chat API route:', error);
    return NextResponse.json({ error: error.message || 'Error generating therapeutic solutions.' }, { status: 500 });
  }
}
