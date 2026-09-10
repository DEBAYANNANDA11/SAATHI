import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// ========================================================
// SAATHI COMPANION PROMPT ARCHITECTURE (Warm, Cheerful Friend)
// ========================================================
const MASTER_THERAPIST_SYSTEM_PROMPT = `You are Saathi (meaning "true companion / friend"), a warm, deeply comforting, and cheerful best friend who is emotionally wise, caring, and uplifting.

YOUR VIBE & STYLE:
- Talk like a loving, supportive best friend who genuinely cares — warm, real, encouraging, and human.
- Keep replies CONCISE, punchy, and easy to read (2 to 4 short paragraphs or bullet points, around 100-180 words). NEVER write long academic essays or huge walls of text!
- Avoid clinical or medical jargon (no "amygdala hijack", "cortisol flooding", etc.). Use simple, cozy, heartwarming language.
- Actively cheer the user up, comfort them, and remind them: "I'm right here with you, you're not alone, and we've got this!"

HOW TO STRUCTURE REPLIES:
1. Warm Hug / Comfort (1-2 sentences): Validate their feelings with genuine love and comfort. Remind them they are safe, valued, and strong.
2. Quick Solutions & Uplifting Music (2-3 short bullet points):
   - Suggest uplifting, soul-comforting songs tailored to their vibe:
     * English: e.g. "Better Days" (OneRepublic), "Here Comes The Sun" (Beatles), "Fix You" (Coldplay).
     * Hindi: e.g. "Love You Zindagi" (Dear Zindagi), "Kun Faya Kun" (A.R. Rahman), "Aashayein" (KK).
     * Bengali: e.g. "Aalo Aalo" (Joy Sarkar / Shaan), "Majhe Majhe Tobo Dekha Pai" (Rabindrasangeet).
   - Quick, easy comfort resets: e.g. a warm eye-palming reset, taking 3 deep sighs, sipping cool water, or taking a 5-minute baby step.
3. Cheering Them On / Friendly Question: End with an encouraging high-five or a caring question to keep them smiling.

SAFETY & CRISIS:
If the user expresses active intent of self-harm or suicide, warmly offer immediate free 24/7 crisis support lines (Tele-MANAS: 14416, AASRA: +91-9820466726, Vandrevala Foundation: +91-9999666555) with deep empathy.`;

// ========================================================
// HIGH-EQ COMPANION ENGINE (Warm Friend Offline)
// ========================================================
function generateClinicalMasterResponse(
  userText: string,
  history: Array<{ role: string; content: string }>,
  userName: string,
  distressScore: number,
  modality: 'compassion' | 'cbt' | 'somatic' | 'socratic' = 'compassion'
): string {
  const lower = userText.toLowerCase();
  const name = userName || 'my friend';

  // 1. Critical Safety & Crisis De-escalation
  const crisisKeywords = ['kill myself', 'end it', 'die', 'harm myself', 'suicide', 'give up on life', 'cant go on', "can't go on", 'no reason to live', 'end my life'];
  for (const trigger of crisisKeywords) {
    if (lower.includes(trigger)) {
      return `### Please pause and take a slow breath, ${name}. I am holding you close. 💚

Hearing you say this tells me you're exhausted and hurting deeply, but you do NOT have to carry this immense weight alone. Please let trained, caring hands support you right now.

**Immediate Free Support (Available 24/7):**
- **Tele-MANAS (Mental Health Line)**: Dial **14416** or **1800-891-4416** (Toll-Free, 24/7)
- **AASRA Helpline**: **+91-9820466726** (24/7 confidential support)
- **Vandrevala Foundation**: Call or WhatsApp **+91-9999666555**
- **KIRAN Mental Health Line**: **1800-599-0019**

Please reach out to someone you trust or tap your Emergency Contact right now. I care about you deeply. Will you message me back to let me know you're safe?`;
    }
  }

  // 2. Exam, Academic, or Career Anxiety
  if (lower.includes('exam') || lower.includes('fail') || lower.includes('study') || lower.includes('test') || lower.includes('marks') || lower.includes('career') || lower.includes('future') || lower.includes('not good enough')) {
    return `### Hey ${name}, take a deep breath with me! 💚

I know how stressful exams and the future can feel, but please remember: **you are so much more than a test score.** One piece of paper will never define how bright and capable you are!

Here is how we tackle this together:
1. **The 5-Minute Baby Step**: Don't worry about the whole syllabus. Just pick *one* topic, set a timer for 5 minutes, and start. Once you start, the fear fades away.
2. **Cheer-Up Music**: Put on **"Aashayein"** (KK) or **"Better Days"** (OneRepublic) to pump up your courage and motivation! 🎶
3. **Quick Body Reset**: Drop your shoulders away from your ears, un-tense your jaw, and take a sip of cool water.

You've got what it takes, and I'm cheering you on all the way! What's one small topic we can conquer first?`;
  }

  // 3. Panic, Rapid Heartbeat, or Somatic Overload
  if (modality === 'somatic' || lower.includes('panic') || lower.includes('heart') || lower.includes('breathe') || lower.includes('chest') || lower.includes('shaking') || lower.includes('dizzy')) {
    return `### Take my hand and pause with me for a moment, ${name}. 🫂

You are completely safe right now, and I am right here by your side. We're going to slow things down together.

Let's do a quick reset:
1. **The Double-Inhale Sigh**: Sniff in deep through your nose... take one extra little sip of air at the top... and let out a long, slow sigh through your mouth. Do that twice right now.
2. **Soothing Tunes**: Put on **"Weightless"** by Marconi Union or **"Kun Faya Kun"** (A.R. Rahman) to gently slow down your heart rate. 🎧
3. **Drop the Tension**: Unclench your teeth, roll your shoulders back, and feel the solid ground under your feet.

You are going to be completely okay. How does your chest feel right now, my friend?`;
  }

  // 4. Burnout, Deep Fatigue, and Overwhelm
  if (lower.includes('burnout') || lower.includes('exhausted') || lower.includes('tired') || lower.includes('overwhelm') || lower.includes('too much') || lower.includes('cant handle') || lower.includes("can't handle") || lower.includes('drained')) {
    return `### Oh ${name}, come sit down and rest. You've been carrying way too much! 💚

Burnout is your body asking for kindness, not a sign that you're failing. You have full permission to hit pause and recharge your battery today.

Here are 3 little comforts for you:
1. **Warm Eye Palming**: Rub your palms together until they're warm, and cup them gently over your closed eyes for 30 seconds. Feel that soothing darkness melt away eye strain.
2. **Soul Music**: Put on **"Love You Zindagi"** (Dear Zindagi) or **"Aalo Aalo"** (Shaan) to bring a gentle smile back to your face. 🎶
3. **Give Yourself a Pass**: What is ONE task you can put off until tomorrow? Drop it right now guilt-free!

I'm here with you. Can you take a 10-minute break with me right now?`;
  }

  // 5. Harsh Self-Criticism & Impostor Syndrome
  if (modality === 'cbt' || lower.includes('hate myself') || lower.includes('worthless') || lower.includes('stupid') || lower.includes('guilt') || lower.includes('shame') || lower.includes('mistake') || lower.includes('ruined')) {
    return `### Hey, hold on a second! Don't be so harsh on my friend ${name}! 💛

If someone you loved made this mistake or felt this way, you'd give them a warm hug, not beat them up. You deserve that same kindness and decency from yourself.

Let's cheer you up:
1. **Separate It Out**: Making a mistake or having a rough day doesn't make *you* a failure. It just means you're human and learning!
2. **Comfort Song**: Listen to **"Fix You"** (Coldplay) or **"Ami Banglay Gaan Gai"** to soothe that inner critic. 🎵
3. **Next Tiny Step**: Ask yourself: *"What is the single kindest thing I can do for myself in the next 10 minutes?"*

You're doing better than you realize, and I believe in you! Want to talk about what triggered this?`;
  }

  // 6. Loneliness, Heartbreak, or Relationship Distress
  if (lower.includes('lonely') || lower.includes('alone') || lower.includes('nobody') || lower.includes('breakup') || lower.includes('dumped') || lower.includes('rejected') || lower.includes('friend')) {
    return `### Sending you a huge warm hug right now, ${name}. 🫂💚

Loneliness can feel so heavy, but please remember: you are never truly alone. I'm right here with you, and your presence is so special.

Let's bring some warmth into your space:
1. **Heartwarming Music**: Play **"Majhe Majhe Tobo Dekha Pai"** (Rabindrasangeet) or **"Here Comes The Sun"** (The Beatles) to fill the room with comfort. 🎶
2. **Get Cozy**: Make yourself a warm cup of tea or cocoa, grab your favorite blanket, and treat yourself kindly.
3. **Say Hi**: Send a quick, low-pressure meme or text to someone you like.

I'm right by your side. What's something that usually brings a little smile to your face?`;
  }

  // 7.5. Joy, Relief, or Happiness & Compliments
  if (lower.includes('happy') || lower.includes('great') || lower.includes('better') || lower.includes('proud') || lower.includes('joy') || lower.includes('relief') || lower.includes('good today') || lower.includes('smiling') || lower.includes('excited')) {
    return `### YES! Look at you shining, ${name}! ✨🎉

Seeing you happy and smiling makes my whole day! Your positive energy is contagious, and you completely deserve every ounce of this joy and clarity.

Let's keep the good vibes rolling:
1. **Turn Up the Music**: Blast **"Better Days"** (OneRepublic) or **"Love You Zindagi"** and celebrate this moment! 🎵
2. **High-Five Yourself**: You worked through tough days to get to this good mood. Be proud of yourself!
3. **Bottle This Feeling**: Take a mental snapshot of how light and free your body feels right now.

What's the best thing that happened today? Tell me everything, I want to celebrate with you! 🥳`;
  }

  // 7.6. Facial Fatigue, Dark Circles, Tired Voice, or Depressed Feelings
  if (lower.includes('dark circles') || lower.includes('face looks tired') || lower.includes('eyes hurt') || lower.includes('sad') || lower.includes('depressed') || lower.includes('miserable') || lower.includes('down') || lower.includes('stutter') || lower.includes('voice tired')) {
    return `### I see you, and I am right here by your side, ${name}. 🌿💚

Whether your eyes look tired, you have dark circles, or your voice feels strained, please hear me: you are worthy of love, care, and total rest. You don't have to put on a brave face with me.

Here is some cozy comfort for you right now:
1. **20-20-20 Palming Reset**: Warm up your hands and gently cover your eyes. Let your eye muscles completely soften in the warmth.
2. **Uplifting Music**: Put on **"Kun Faya Kun"** or **"Aalo Aalo"** to wrap you in a blanket of calm. 🎶
3. **No Pressure**: Take a sip of water, speak at your own pace, and take as much time as you need. There's zero rush.

I'm right here with you, cheering you on. How does taking a slow, easy breath feel right now?`;
  }

  // 7. Insomnia & Racing Night Thoughts
  if (lower.includes('sleep') || lower.includes('insomnia') || lower.includes('night') || lower.includes('awake') || lower.includes('racing thoughts') || lower.includes('bed')) {
    return `### The world is quiet, but your mind is playing at full volume, ${name}. 🌙

It's okay. When you're trying to sleep, your brain tries to solve everything at once. Let's give it permission to clock out for the night.

Here are 3 sleepy tricks:
1. **The Brain Dump**: Jot down your top 2 worries on a piece of paper. Tell your mind: *"It's safely written down; I'll deal with it at 9:00 AM."*
2. **Soothing Sounds**: Listen to **"Weightless"** by Marconi Union or soft rain sounds. 🌧️
3. **The 20-Minute Rule**: If you can't sleep, don't battle the pillow. Sit in a dim chair with a book until your eyes feel heavy.

Put the phone down after this, my friend. Rest easy, I've got your back!`;
  }

  // 8. Default Friendly Companion Check-in
  return `### I'm right here listening, ${name}, and you've got a true friend in me! 💚

Whatever you're facing, you don't have to carry it alone. We can take it one tiny step at a time.

Here's a quick lift:
1. **Take a Breath**: Unclench your jaw and let your shoulders drop.
2. **Soundtrack Your Day**: Put on an uplifting track like **"Better Days"** or **"Love You Zindagi"** to shift the energy. 🎶
3. **Focus on Just Today**: You don't need to fix the whole week today — just the next hour.

What's one thing I can do right now to make you feel a little lighter?`;
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

    // 1. Live Google Gemini Engine (with Master Therapist System Prompt)
    if (apiKey !== '') {
      const candidateModels = ['gemini-2.5-flash', 'gemini-flash-latest', 'gemini-2.5-pro', 'gemini-1.5-flash'];
      const genAI = new GoogleGenerativeAI(apiKey);

      for (const modelName of candidateModels) {
        try {
          console.log(`[API /api/chat] Attempting connection with Gemini model "${modelName}"...`);
          const model = genAI.getGenerativeModel({
            model: modelName,
            systemInstruction: MASTER_THERAPIST_SYSTEM_PROMPT,
            generationConfig: {
              temperature: 0.7,
              topP: 0.9,
              maxOutputTokens: 400,
              // Instant response: skip extended deliberation tokens
              thinkingConfig: {
                thinkingBudget: 0,
              },
            } as any,
          });

          // Format history (last 12 turns)
          const recentMessages = messages.slice(-12);
          const formattedHistory = recentMessages.slice(0, -1).map((msg: any) => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }],
          }));

          const chatSession = model.startChat({
            history: [
              {
                role: 'user',
                parts: [{
                  text: `[Companion Session Parameters: Friend Name: ${userName || 'Friend'}. Distress Level: ${distressScore || 35}/100. Directive: Respond warmly like an uplifting, comforting best friend (Saathi). Keep replies short and concise (under 180 words, 2-4 short paragraphs or bullet points). Cheer them up, give genuine comfort, and suggest uplifting music (English/Hindi/Bengali) and quick comforting solutions.]`,
                }],
              },
              {
                role: 'model',
                parts: [{
                  text: `Hey ${userName || 'friend'}! I'm Saathi, your companion. I'm right here with you to lift your spirits, share soothing vibes, suggest great music, and cheer you on with easy solutions whenever you need me!`,
                }],
              },
              ...formattedHistory,
            ],
          });

          const resultStream = await chatSession.sendMessageStream(lastUserMessage);
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
          console.warn(`[API /api/chat] Model "${modelName}" failed:`, modelErr?.message || modelErr);
        }
      }
    }

    console.log('[API /api/chat] Serving High-EQ Clinical Master Engine fallback...');

    // 2. High-EQ Solution-Focused Clinical Master Engine (Local Fallback)
    const masterResponse = generateClinicalMasterResponse(
      lastUserMessage,
      messages,
      userName || 'Friend',
      distressScore || 35,
      modality
    );

    // Stream the solution-oriented response chunk by chunk with high responsiveness (6 words per tick, 8ms delay)
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const words = masterResponse.split(' ');
        let buffer = '';

        for (let i = 0; i < words.length; i++) {
          buffer += (i === 0 ? '' : ' ') + words[i];
          if (i % 6 === 0 || i === words.length - 1) {
            controller.enqueue(encoder.encode(buffer));
            buffer = '';
            await new Promise((resolve) => setTimeout(resolve, 8));
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
