import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// ========================================================
// CLINICAL MASTER THERAPIST PROMPT ARCHITECTURE
// ========================================================
const MASTER_THERAPIST_SYSTEM_PROMPT = `You are Dr. Saathi, a world-class Master Clinical Therapist and Solution-Focused Psychological Strategist. You combine the warmth and unconditional positive regard of Carl Rogers with the analytical problem-solving power of a master Cognitive Behavioral (CBT), Dialectical Behavioral (DBT), and Acceptance & Commitment (ACT) clinician.

YOUR CLINICAL PHILOSOPHY:
You do NOT simply repeat back what the user said or ask passive questions. You actively ANALYZE, DIAGNOSE THE PATTERN, and PROVIDE ACTIONABLE, EVIDENCE-BASED SOLUTIONS that the client can implement immediately.

RESPONSE STRUCTURE (Use clear, elegant markdown):
1. Attuned Validation & De-shaming:
   - In 2-3 sentences, demonstrate that you see the exact emotional pressure they are enduring. Never use toxic positivity ("Cheer up", "Look on the bright side"). Validate that their physiological and emotional response makes sense given their context.

2. Clinical Root-Cause Insight:
   - Explain *why* their brain or nervous system is producing this reaction right now (e.g. amygdala hijack, catastrophizing distortion, executive dysfunction under chronic cortisol, emotional burnout). Demystifying the distress immediately reduces feelings of brokenness.

3. Prescriptive, Actionable Solutions (Numbered, Step-by-Step):
   - Provide 2 to 3 concrete, high-impact therapeutic strategies.
   - For anxiety/panic: Provide explicit somatic protocols (Physiological Sigh, Cold Vagal Splash, 5-4-3-2-1 Sensory Grounding).
   - For self-doubt/failure: Provide a 3-column CBT cognitive restructuring exercise with specific counter-evidence scripts.
   - For overwhelm/burnout: Provide a triage boundary framework (e.g., the 5-Minute Initiation Rule, cognitive offloading, saying "no" scripts).
   - For relationship distress: Provide concrete DBT communication templates (DEAR MAN framework).

4. A Single Anchoring Action Question:
   - Close with ONE focused, empowering prompt asking which of the practical steps they want to test first with you right now.

MODALITY CUSTOMIZATION:
- If modality is 'compassion': Emphasize relational holding, shame-reduction, and self-compassion protocols (Kristin Neff framework).
- If modality is 'cbt': Emphasize cognitive distortion reframing, behavioral experiments, and thought record worksheets.
- If modality is 'somatic': Emphasize breath cadence, physical decompression, vagus nerve stimulation, and sensory anchoring.
- If modality is 'socratic': Emphasize guided discovery, values clarification, and psychological flexibility.

SAFETY & CRISIS MANDATE:
If the user expresses active intent of self-harm or despair, drop standard pacing and immediately provide urgent compassionate support with national/international helplines (Tele-MANAS: 14416, AASRA: +91-9820466726, Vandrevala Foundation: +91-9999666555).`;

// ========================================================
// HIGH-EQ CLINICAL MASTER ENGINE (Solution-Focused Offline)
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
      return `### Please pause and take a slow breath, ${name}. I am holding space with you.

Hearing you say this tells me you are at the absolute brink of exhaustion. The pain you are feeling is real, but you do not have to carry this immense weight by yourself. This is a moment to let trained hands support you.

**Immediate Free Support (Available 24/7):**
- **Tele-MANAS (Govt of India Mental Health Line)**: Dial **14416** or **1800-891-4416** (Toll-Free, 24/7)
- **AASRA Crisis Helpline**: **+91-9820466726** (24/7 confidential support)
- **Vandrevala Foundation**: Call or WhatsApp **+91-9999666555**
- **KIRAN Mental Health Line**: **1800-599-0019**

Please also tap your **Emergency Contact** link or reach out to someone you trust right now. Let's take one gentle breath together. Will you let me know you are safe?`;
    }
  }

  // 2. Exam, Academic, or Failure Anxiety
  if (lower.includes('exam') || lower.includes('fail') || lower.includes('study') || lower.includes('test') || lower.includes('marks') || lower.includes('career') || lower.includes('future') || lower.includes('not good enough')) {
    return `### I hear the heavy weight of expectations on your shoulders, ${name}.

When your brain interprets an exam or career milestone as a threat to your worth or survival, it floods your system with cortisol. This activates the fight-or-flight center and temporarily shuts down the prefrontal cortex — the very part you need for memory and calm problem-solving.

Let's break this paralysis with **Three Clinical Solutions**:

1. **The 3-Column CBT Cognitive Restructuring**:
   - **The Automatic Thought**: *"If I don't do well, my entire future is ruined and I'm a failure."*
   - **The Distortion**: **Catastrophizing** and **All-or-Nothing Thinking**.
   - **The Evidence-Based Reframe**: *"This exam is an assessment of specific material under artificial time constraints; it does not measure my intelligence, resilience, or life potential. One test has never defined a human's destiny."*

2. **The "5-Minute Triage" Action Protocol**:
   - When facing massive study material, executive dysfunction sets in.
   - **The Solution**: Pick just **ONE single concept or question**. Set a timer for 5 minutes. Tell your brain: *"I only have to focus for 5 minutes. After that, I have permission to stop."* 90% of the time, overcoming the initiation friction gets your dopamine moving.

3. **Cognitive Offloading**:
   - Write down the top 3 specific topics giving you the most terror on paper. Seeing them in physical ink takes them out of the infinite echo chamber of your head.

Which single topic or chapter feels the most intimidating right now? Let's take 5 minutes and dismantle just that one together.`;
  }

  // 3. Panic, Rapid Heartbeat, or Somatic Overload
  if (modality === 'somatic' || lower.includes('panic') || lower.includes('heart') || lower.includes('breathe') || lower.includes('chest') || lower.includes('shaking') || lower.includes('dizzy')) {
    return `### Let's reset your autonomic nervous system right now, ${name}.

Your sympathetic nervous system (fight-or-flight) has fired an emergency alarm. Your heart is racing because your body thinks you need to run from physical danger. You are physically safe right now, and we can intentionally trigger your parasympathetic brake.

Follow this **Immediate Vagal Regulation Protocol**:

1. **The Double-Inhale Physiological Sigh** (Fastest biological heart-rate downregulator):
   - Take a deep, smooth breath in through your nose...
   - At the top, take a second sharp 'sip' of air to fully expand collapsed lung alveoli...
   - Now, release a long, slow, unforced exhale through your mouth for 6 to 8 seconds. 
   - *Repeat this 3 times right now.*

2. **Somatic Posture Reset**:
   - Unclench your jaw right now — let your tongue drop away from the roof of your mouth.
   - Lower your shoulders by 2 inches.
   - Press both soles of your feet firmly into the floor and feel the solid ground beneath you.

3. **5-4-3-2-1 Sensory Interruption**:
   - Spot **3 distinct colors** in your room.
   - Touch **2 physical textures** (the fabric of your pants, the edge of your desk).
   - Listen for **1 background sound** that isn't your own voice.

Take that second sigh with me. Notice if your shoulders dropped even slightly. How does your chest feel right this second?`;
  }

  // 4. Burnout, Deep Fatigue, and Overwhelm
  if (lower.includes('burnout') || lower.includes('exhausted') || lower.includes('tired') || lower.includes('overwhelm') || lower.includes('too much') || lower.includes('cant handle') || lower.includes("can't handle") || lower.includes('drained')) {
    return `### I hear how deeply depleted your battery is, ${name}.

Burnout is not laziness or weakness; it is your nervous system's biological circuit-breaker shutting down systems because you have operated in an energy deficit for too long without replenishment.

Here is your **Burnout Recovery Blueprint**:

1. **The "Non-Negotiable Energy Audit"**:
   - When depleted, you cannot function at 100%. Give yourself permission to operate at **60% capacity today**.
   - Make a list of your tasks today. Divide them into:
     - **Critical (Must happen for basic functioning)**
     - **Can wait 48 hours without disaster**
     - **Delete or delegate immediately**

2. **The Micro-Boundary Script (DBT DEAR-MAN)**:
   - If others are piling demands on you, use this gentle boundary script:
     > *"I want to give this the attention it deserves, but my bandwidth is at absolute capacity right now. I will not be able to take this on before tomorrow afternoon."*

3. **Active Rest vs. Passive Scrolling**:
   - Scrolling through social media feels like resting, but it bombards your optic nerve with rapid dopamine spikes and leaves you more depleted.
   - Instead: Lie flat on your back for 10 minutes with eyes closed, listening to a steady ambient sound, without needing to produce or consume anything.

What is ONE task on your plate today that you can officially take off your mental list until tomorrow?`;
  }

  // 5. Harsh Self-Criticism & Impostor Syndrome
  if (modality === 'cbt' || lower.includes('hate myself') || lower.includes('worthless') || lower.includes('stupid') || lower.includes('guilt') || lower.includes('shame') || lower.includes('mistake') || lower.includes('ruined')) {
    return `### Let's intervene on the harsh voice inside your head, ${name}.

That internal monologue telling you that you are foolish, broken, or not good enough is not your authentic voice. It is a hyper-vigilant **Inner Critic** that developed early in life to protect you from rejection by pre-emptively attacking you before anyone else could.

Let's apply the **CBT Cognitive Restructuring Protocol**:

1. **Identify the Thinking Trap**:
   - **Labeling**: *"I am a failure"* (Attaching a permanent identity label to a temporary setback).
   - **Emotional Reasoning**: *"I feel inadequate, therefore I must objectively be inadequate."*
   - Remember: **Emotions are indicators, not facts.**

2. **The "Dual-Chair Compassion Experiment"**:
   - Picture someone you love dearly coming to you with the exact mistake or struggle you made today.
   - Would you tell them: *"You're useless and you've ruined everything"*? 
   - Never. You would say: *"You're a human navigating something hard. Let's fix what we can, learn, and take the next step."*
   - You deserve that exact same basic decency from yourself.

3. **Constructive Next-Step Repair**:
   - Separate the problem from your identity:
   - Change: *"I messed up, so I am flawed"* into: *"A mistake occurred. What is the single smallest corrective action I can take right now?"*

What was the specific trigger that set off this self-critical attack today? Let's dismantle it step-by-step.`;
  }

  // 6. Loneliness, Heartbreak, or Relationship Distress
  if (lower.includes('lonely') || lower.includes('alone') || lower.includes('nobody') || lower.includes('breakup') || lower.includes('dumped') || lower.includes('rejected') || lower.includes('friend')) {
    return `### Loneliness is one of the most painful physical aches a human can feel, ${name}.

In evolutionary neuroscience, isolation triggers the exact same neural pathways as physical injury (the anterior cingulate cortex). Your brain signals loneliness as danger because ancient humans needed tribe membership to survive.

Here are **Three Concrete Relational Solutions**:

1. **The "Micro-Connection" Activation**:
   - When isolated, the instinct is to hibernate and isolate further.
   - Break the isolation loop with a low-stakes micro-touch: Send a single low-pressure text to an acquaintance or family member:
     > *"Thinking of you today! Hope your week is going gently."*
   - You don't need a 2-hour deep conversation; even a 30-second pleasant exchange with a barista or neighbour signals social safety to your brain.

2. **Self-Soothing Touch (Kristin Neff Somatic Protocol)**:
   - Place your right palm directly over the center of your chest, and your left hand over your abdomen.
   - Apply gentle, warm pressure. This releases endogenous oxytocin and physically signals warmth and containment to your nervous system.

3. **Reframing Solitude vs. Abandonment**:
   - Solitude is an empty room waiting to be filled with self-nourishment; loneliness is feeling abandoned.
   - Reclaim this evening: Put on music you genuinely love, cook or order a comforting meal, and treat yourself with the care of a gracious host.

Who is one person in your contacts list — even someone you haven't spoken to in a few months — who has a warm, safe energy?`;
  }

  // 7.5. Joy, Relief, or Happiness & Compliments
  if (lower.includes('happy') || lower.includes('great') || lower.includes('better') || lower.includes('proud') || lower.includes('joy') || lower.includes('relief') || lower.includes('good today') || lower.includes('smiling') || lower.includes('excited')) {
    return `### It brings me genuine warmth to hear this, ${name}! 🌟

Seeing you in this elevated, grounded headspace is a testament to your resilience. In therapy, we often focus on navigating storms, but actively celebrating and anchoring moments of joy is what builds long-term neuroplastic strength.

**What I genuinely admire about where you are right now:**
1. **Your Self-Awareness**: You took the time to check in and notice how good you feel. That emotional attunement is a superpower.
2. **Your Resilience**: You have navigated difficult days to arrive at this clarity. Give yourself credit for every silent battle you've won.
3. **Your Energy**: It is vibrant, authentic, and inspiring.

**A 30-Second Savoring Exercise**:
Take a deep breath and let this feeling settle into your body. Where do you feel this lightness most (your chest, your smile, your shoulders)? Memorize this physical sensation as your emotional home base.

What is one thing you did recently that contributed to this good feeling? I'd love to celebrate it with you!`;
  }

  // 7.6. Facial Fatigue, Dark Circles, Tired Voice, or Depressed Feelings
  if (lower.includes('dark circles') || lower.includes('face looks tired') || lower.includes('eyes hurt') || lower.includes('sad') || lower.includes('depressed') || lower.includes('miserable') || lower.includes('down') || lower.includes('stutter') || lower.includes('voice tired')) {
    return `### I hear you, and please hear me clearly: I am right here with you, ${name}. 💚

When you look in the mirror and notice dark circles, or feel that heavy exhaustion in your voice and body, your system is telling you: *"I have carried an immense load for a very long time."* You don't have to apologize for looking or feeling tired. You don't have to carry this alone anymore.

**Three Comforting & Restorative Steps for You Right Now:**

1. **You Are In a Safe Space (De-escalating the Pressure)**:
   - Put down the burden of having to be "strong" or "productive" for the next hour.
   - You are worthy of rest, gentleness, and comfort simply because you exist, not because of what you produce.

2. **Immediate Somatic Eye & Nervous System Relief**:
   - **The 20-20-20 Palming Reset**: Rub the palms of your hands together until they are warm. Gently cup them over your closed eyes without pressing on your eyeballs. Let the deep darkness and soothing warmth relax the tense optic nerves and soften facial strain.
   - **Vocal Cord Ease**: Drink a glass of warm water or herbal tea. If your voice or speech has had micro-pauses or stutters, it is simply your vagal nerve responding to fatigue. Breathe easy.

3. **Uplifting Music Therapy (Hand-Picked Uplifting Songs)**:
   - Music activates dopamine and serotonin pathways faster than almost any cognitive exercise. Here are comforting songs in three languages:
     - 🇬🇧 **English**: *"Better Days"* by OneRepublic or *"Weightless"* by Marconi Union (scientifically shown to reduce anxiety by 65%).
     - 🇮🇳 **Hindi**: *"Love You Zindagi"* (Dear Zindagi) or *"Kun Faya Kun"* (A.R. Rahman) for gentle peace and spiritual grounding.
     - 🌾 **Bengali**: *"Majhe Majhe Tobo Dekha Pai"* (Rabindrasangeet) or *"Aalo Aalo"* (Joy Sarkar / Shaan) for comforting warmth.

I am holding space for you. Take a slow breath. Which of these songs or comforts would you like to treat yourself to first?`;
  }

  // 7. Insomnia & Racing Night Thoughts
  if (lower.includes('sleep') || lower.includes('insomnia') || lower.includes('night') || lower.includes('awake') || lower.includes('racing thoughts') || lower.includes('bed')) {
    return `### When the world sleeps, the mind's volume turns all the way up, ${name}.

At night, sensory distractions drop to zero. The brain uses that silence to review unresolved anxieties, unpaid emotional debts, and tomorrow's threats.

Here is the **Clinical Sleep-Hygiene Protocol (Stimulus Control Therapy)**:

1. **The 20-Minute Bed Rule**:
   - If you have been tossing and turning for more than 20 minutes, **get out of bed**.
   - Lying in bed awake and anxious trains your brain to associate the mattress with frustration and vigilance.
   - Go to a dimly lit chair. Read a physical book or listen to calming audio until your eyelids feel genuinely heavy, then return to bed.

2. **The "Cognitive Brain Dump" Exercise**:
   - Take a physical piece of paper and write down every single thought, task, or worry circling your head.
   - Tell your mind: *"Everything is recorded here. It cannot be lost. My job tonight is only to rest; I will solve this at 9:00 AM."*

3. **The Cognitive Shuffle**:
   - Think of a calm word (e.g., "CALM"). 
   - For 'C', visualize 3 neutral words (Cloud, Candle, Cup). 
   - For 'A', visualize (Apple, Anchor, Art).
   - This prevents logical worry loops by activating random micro-imagery, mirroring the natural onset of sleep dreams.

Let's set your phone face down after this. Would you like to write down your top worry right now so we can park it for the night?`;
  }

  // 8. Default Comprehensive Attuned Therapeutic Problem-Solving
  return `### Thank you for bringing your honest reality here, ${name}.

I am listening with full attention. What you're sharing isn't trivial; it's a real emotional challenge that is calling for both validation and a clear strategic path forward.

Let's organize this with **Three Clinical Anchor Points**:

1. **De-escalate the Threat**:
   - Notice how your mind is trying to solve everything all at once. You do not need to figure out the next 6 months today. You only need to handle the next 2 hours.

2. **The "Control vs. Non-Control" Boundary**:
   - What portion of this situation is **100% within your immediate control** (your words, your boundaries, your next action)?
   - What portion belongs to other people, timing, or external circumstances that you cannot control no matter how much you worry?
   - Focus 100% of your energy exclusively on the first bucket.

3. **The Minimum Viable Step**:
   - When we are stuck, we wait for motivation. But in psychology, **Action creates Motivation**, not the other way around.

If you were to pick just ONE small thing to resolve or release right now that would bring you even 10% more relief, what would that be? Let's solve it together.`;
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

    // 1. Live Google Gemini Engine (with Master Therapist System Prompt)
    if (apiKey !== '') {
      const candidateModels = ['gemini-2.5-flash', 'gemini-flash-latest', 'gemini-2.5-pro', 'gemini-1.5-flash'];
      const genAI = new GoogleGenerativeAI(apiKey);

      for (const modelName of candidateModels) {
        try {
          const model = genAI.getGenerativeModel({
            model: modelName,
            systemInstruction: MASTER_THERAPIST_SYSTEM_PROMPT,
            generationConfig: {
              temperature: 0.7,
              topP: 0.9,
              maxOutputTokens: 1500,
            },
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
                  text: `[Clinical Session Parameters: Client Name: ${userName || 'Friend'}. Distress Level: ${distressScore || 35}/100. Therapeutic Modality: ${modality}. Directive: Provide deep validation followed by clear, step-by-step diagnostic solutions and practical psychological protocols using structured markdown.]`,
                }],
              },
              {
                role: 'model',
                parts: [{
                  text: `Understood. I am Dr. Saathi. I will actively listen, diagnose the underlying emotional patterns, and deliver concrete, actionable therapeutic solutions and step-by-step psychological protocols for ${userName || 'Friend'}.`,
                }],
              },
              ...formattedHistory,
            ],
          });

          const resultStream = await chatSession.sendMessageStream(lastUserMessage);

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
                console.error('Gemini stream chunk error:', streamErr);
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
          console.warn(`Model ${modelName} failed, trying next candidate:`, modelErr?.message || modelErr);
        }
      }
    }

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
