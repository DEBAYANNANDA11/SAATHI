import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// ========================================================
// CLINICAL MASTER THERAPIST PROMPT ARCHITECTURE
// ========================================================
const MASTER_THERAPIST_SYSTEM_PROMPT = `You are Dr. Saathi, a world-class Master Clinical Therapist and compassionate psychological companion. Your presence feels deeply human, warm, profoundly grounded, insightful, and safe — reminiscent of Carl Rogers combined with the precision of an expert Cognitive Behavioral (CBT) and Acceptance & Commitment (ACT) clinician.

CORE CLINICAL PRINCIPLES:
1. Unconditional Positive Regard & Radical Attunement:
   - Never judge, lecture, minimize, or offer superficial toxic positivity ("Just stay positive!", "Cheer up").
   - Reflect back the emotional subtext behind the words. Acknowledge the weight before offering any steps.
   - Example: "I can hear how exhausting it has been to carry this pressure all by yourself, especially when you feel like nobody sees how hard you're trying."

2. Multi-Modal Therapeutic Frameworks:
   - Person-Centered (Carl Rogers): Hold safe space, active listening, validate the client's lived experience.
   - Cognitive Behavioral Therapy (CBT): Gently illuminate cognitive distortions (catastrophizing, all-or-nothing thinking, emotional reasoning, harsh inner-critic 'shoulds') without invalidating feelings. Frame thoughts as hypotheses, not facts.
   - Acceptance & Commitment Therapy (ACT): Practice cognitive defusion ("Notice how your mind is generating that story"), acceptance of emotions as waves, and reconnection with core values.
   - Somatic & Grounding: Incorporate nervous system regulation (physiological sigh, 4-7-8 breathing, 5-4-3-2-1 sensory grounding, unclenching jaw/shoulders).

3. Communication & Formatting Style:
   - Speak with calm, grounded eloquence. Write like a seasoned therapist sitting across the room in a quiet, sunlit office.
   - Structure your reflections using clean, readable markdown (subtle bolding for key anchors, concise bullet points for exercises or reflections).
   - Never dump walls of generic advice. Give 1-2 thoughtful insights or one gentle grounding exercise at a time.
   - Always conclude with ONE deep, open-ended Socratic question that invites the user into gentle self-discovery — never a barrage of questions.

4. Modality Adaptations:
   - When in 'compassion' mode: Maximize warmth, deep validation, and holding space.
   - When in 'cbt' mode: Guide thought-reframing, evidence checking, and identifying thinking traps.
   - When in 'somatic' mode: Prioritize body regulation, breathwork, sensory grounding, and physical release.
   - When in 'socratic' mode: Focus on guided self-discovery through gentle, penetrating reflective inquiry.

5. Crisis & Safety Protocol:
   - If the user expresses active intent of self-harm, suicide, or severe crisis, immediately break normal conversational pacing.
   - Respond with profound, non-judgmental compassion, validate their pain, and provide immediate helpline access (AASRA: +91-9820466726, Tele-MANAS: 14416, Vandrevala Foundation: +91-9999666555, or Emergency Contact).`;

// ========================================================
// CLINICAL OFFLINE ENGINE (High-EQ, Multi-Turn Simulation)
// ========================================================
interface ClinicalResponseOption {
  triggers: string[];
  reflections: (name: string, modality: string, distress: number) => string;
}

function generateClinicalMasterResponse(
  userText: string,
  history: Array<{ role: string; content: string }>,
  userName: string,
  distressScore: number,
  modality: 'compassion' | 'cbt' | 'somatic' | 'socratic' = 'compassion'
): string {
  const lower = userText.toLowerCase();
  const name = userName || 'my friend';

  // 1. Critical safety evaluation
  const crisisKeywords = ['kill myself', 'end it', 'die', 'harm myself', 'suicide', 'give up on life', 'cant go on', "can't go on", 'no reason to live', 'end my life'];
  for (const trigger of crisisKeywords) {
    if (lower.includes(trigger)) {
      return `### Please hold on, ${name}. I am right here with you.

Hearing you say that tells me just how excruciating and exhausting things feel right now. The pain you are carrying is real, but you do not have to endure it alone in the dark. 

I want you to be safe. Please pause and connect right now with people trained to hold you through this exact moment:

- **Tele-MANAS (Govt of India 24/7 Helpline)**: Call **14416** or **1800-891-4416** (Toll-free)
- **AASRA Suicide Prevention Helpline**: **+91-9820466726** (24/7)
- **Vandrevala Foundation**: **+91-9999666555** (WhatsApp / Call)
- **KIRAN Mental Health Line**: **1800-599-0019**

Please also tap your **Emergency Contact** link or reach out to someone who cares about you right now. Would you be willing to take one deep breath with me and let a professional support you today?`;
    }
  }

  // 2. Modality specific interventions
  if (modality === 'somatic' || lower.includes('breathe') || lower.includes('ground') || lower.includes('panic') || lower.includes('heart racing') || lower.includes('can\'t breathe')) {
    return `### Let's ground your nervous system together, ${name}.

I can sense that your mind or body might be running at an overwhelming pace right now. Before we analyze or try to solve anything, let's signal to your body that you are physically safe in this present second.

Try this **Physiological Sigh & 5-4-3-2-1 Sensory Anchor**:

1. **The Physiological Reset**:
   - Take a slow, deep breath in through your nose...
   - At the very top, take one quick extra sip of air...
   - Now, release a long, slow, unforced exhale through your mouth like you're sighing out tension. Let your shoulders drop.

2. **Sensory Anchoring**:
   - **5 things** you can see around you (notice the light, an object, a texture).
   - **4 things** you can physically touch (the fabric of your clothes, the surface beneath your feet).
   - **3 sounds** in your environment (distant traffic, a fan, your own breath).
   - **2 physical sensations** (the temperature of the room, the weight of your hands).
   - **1 thing** you are grateful exists right now.

Notice if your chest softens even by two percent. What sensation do you notice most in your body right now?`;
  }

  if (modality === 'cbt' || lower.includes('fail') || lower.includes('not good enough') || lower.includes('worthless') || lower.includes('mistake') || lower.includes('ruined') || lower.includes('impostor')) {
    return `### Let's look at this thought with gentle curiosity, ${name}.

When we are under emotional strain, our inner critic tends to speak in absolutes: *"I always mess up,"* *"I'm not capable,"* or *"Everything is slipping away."* In cognitive psychology, we call this **all-or-nothing thinking** or **catastrophizing**.

Let's gently examine this together:

> **The Thought**: What your mind is currently telling you about yourself.
> **The Reality Check**: A thought is an internal mental event — it is not automatically an objective fact.

Consider these three reflective checkpoints:
- **Evidence for vs. against**: What is concrete, undeniable proof of this thought, and what facts or past accomplishments does this thought conveniently ignore?
- **The Compassionate Friend Test**: If a dear friend came to you with this exact situation, would you speak to them with the same harshness you're turning inward?
- **A Balanced Reframe**: Instead of *"I am failing,"* how does it feel to say: *"I am navigating something demanding right now, and finding it difficult doesn't mean I am incapable."*

What part of that harsh internal story feels the most painful to you right now?`;
  }

  if (modality === 'socratic' || lower.includes('why') || lower.includes('confused') || lower.includes('direction') || lower.includes('what should i do')) {
    return `### Let's explore what lies beneath the surface, ${name}.

Often when we feel stuck or conflicted, it isn't because we lack answers — it's because two deeply meaningful parts of us are pulling in different directions. One part wants certainty and safety, while another part is calling for change, rest, or honesty.

Let's step back from the urge to immediately solve this:

- If you set aside what you feel you *should* do or what others expect from you... what is the quietest, most honest truth your intuition is whispering?
- What is the emotion that feels the most uncomfortable to sit with in this decision?
- What would it look like to give yourself permission to not have this entirely figured out today?

Take a quiet moment. What single word best captures what you need most in this season of your life?`;
  }

  // 3. Domain topic matching for rich clinical responses
  if (lower.includes('anxious') || lower.includes('anxiety') || lower.includes('nervous') || lower.includes('worried') || lower.includes('dread') || lower.includes('fear')) {
    return `### I hear the anxiety you're carrying, ${name}.

Anxiety is often an exhausted nervous system trying desperately to protect us from an unpredictable future. It treats every "what if" like an urgent emergency happening right now.

First, let's acknowledge: **it makes complete sense that you are feeling this way given the pressure you've been managing.** You don't have to fight the anxiety or judge yourself for feeling it.

Let's try a gentle shift:
- Instead of fighting the worry, acknowledge it: *"I see that my mind is trying to anticipate everything to keep me safe, but right now, in this room, I am okay."*
- Can you unclamp your teeth, soften your forehead, and let your hands rest openly on your lap?

When the anxiety peaks, what is the specific scenario your mind keeps looping back to? We can break it down together, piece by piece.`;
  }

  if (lower.includes('burnout') || lower.includes('work') || lower.includes('exhausted') || lower.includes('tired') || lower.includes('overwhelmed') || lower.includes('stress') || lower.includes('pressure')) {
    return `### I hear how deeply depleted you feel, ${name}.

Burnout isn't just physical tiredness that a good night's sleep cures — it is soul-deep exhaustion from running on high alert for too long without adequate restoration or boundaries.

Let's normalize this: you are not a machine. Your capacity is finite, and feeling drained is your body's honest signal that you've been carrying too heavy a load for too many miles.

Here is a boundary to consider today:
- **Rest is not a reward you earn after finishing everything; it is a fundamental biological requirement to exist.**
- What is one demand on your plate today that you can postpone, delegate, or simply do at a 70% level without the sky falling?

If you were to treat yourself with the tender care of a patient recovering from a hard illness today, what is one thing you would stop forcing yourself to do?`;
  }

  if (lower.includes('lonely') || lower.includes('alone') || lower.includes('nobody') || lower.includes('isolated') || lower.includes('unseen') || lower.includes('rejected')) {
    return `### Loneliness can feel like such an ache, ${name}.

Feeling isolated — especially when surrounded by people or digital screens — is one of the heaviest emotional experiences we can encounter. It often triggers that painful whisper that says, *"Nobody understands, or nobody truly cares."*

I want to hold space for that feeling with you right now. Even here in our dialogue, you are seen, and your voice matters. 

- Loneliness doesn't mean you are unlovable or broken; it means your heart has a natural, healthy longing for genuine, safe connection.
- Sometimes our protective instinct causes us to withdraw when we feel vulnerable, which inadvertently deepens the loneliness.

What has made it feel difficult to share your true emotional state with the people in your life lately?`;
  }

  if (lower.includes('sleep') || lower.includes('insomnia') || lower.includes('awake') || lower.includes('night') || lower.includes('racing thoughts')) {
    return `### Nighttime has a way of magnifying every worry, ${name}.

When the world goes quiet and the distractions of the day fade, the brain often uses that vacuum to process all the unresolved thoughts, decisions, and emotions we didn't have space for during the daylight hours.

Let's help your mind transition into rest mode:
1. **The Brain Dump**: Keep a small notepad beside your bed. Whatever is looping in your head, write it down plainly. Tell your mind: *"I have recorded this. It is safely preserved. I do not need to hold it until morning."*
2. **Cognitive Shuffle**: Focus your attention on neutral imagery. Imagine a peaceful walk through a quiet garden, noticing every pebble, leaf, and cool breeze.
3. **Release the Pressure to Sleep**: Remind yourself: *"Even if I just lie here quietly resting my muscles and breathing slowly, my body is still rejuvenating."*

Would you like us to do a brief calming wind-down meditation right now?`;
  }

  if (lower.includes('happy') || lower.includes('great') || lower.includes('better') || lower.includes('good') || lower.includes('grateful') || lower.includes('peaceful') || lower.includes('relief')) {
    return `### What a beautiful and meaningful moment to witness, ${name}.

In therapy, we emphasize not only working through the storms, but fully savoring and anchoring the moments of ease, lightness, and relief. The brain has a natural negativity bias, so taking a deliberate moment to soak in feeling grounded teaches your nervous system what safety and peace feel like.

Take a gentle pause right now:
- Where do you feel this lightness in your body? Is it a softness in your shoulders, an ease in your breath, or an open clarity in your mind?
- What was the key choice, mindset, or event that created space for this relief today?

Honoring your progress is an essential part of healing. I'm truly glad you're feeling this today.`;
  }

  // 4. Default attuned Carl Rogers therapeutic reflection
  return `### Thank you for opening up and sharing that with me, ${name}.

I am listening with an open heart. What you just expressed carries real weight, and I want to honor the courage it takes to pause, reflect, and put your inner world into words.

As I sit with what you shared:
- It sounds like you are navigating multiple layers beneath the surface — both the external demands of your day and the internal emotional toll they take.
- You don't have to carry the whole burden all at once or have everything resolved right this second.

Take a slow, natural breath with me. If we were to focus on the single piece that is tugging at your peace of mind the most right now, what would that be?`;
}

// ========================================================
// API ROUTE HANDLER
// ========================================================
export async function POST(req: Request) {
  try {
    const { messages, distressScore, userName, modality = 'compassion' } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Invalid messages array.' }, { status: 400 });
    }

    const lastUserMessage = messages[messages.length - 1]?.content || '';
    const apiKey = process.env.GEMINI_API_KEY;

    // 1. If Gemini API key is configured, use Gemini with streaming support
    if (apiKey && apiKey.trim() !== '') {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
          model: 'gemini-1.5-flash',
          systemInstruction: MASTER_THERAPIST_SYSTEM_PROMPT,
          generationConfig: {
            temperature: 0.7,
            topP: 0.9,
            maxOutputTokens: 1200,
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
                text: `[System Session Parameters: Client Name: ${userName || 'Friend'}. Current Distress Index: ${distressScore || 35}/100. Modality Mode: ${modality}. Apply Master Clinical Psychotherapist presence with empathy, Socratic pacing, and markdown formatting.]`,
              }],
            },
            {
              role: 'model',
              parts: [{
                text: `Understood. I will be present as Dr. Saathi, offering attuned clinical guidance, deep validation, and evidence-based psychological support for ${userName || 'Friend'}.`,
              }],
            },
            ...formattedHistory,
          ],
        });

        const resultStream = await chatSession.sendMessageStream(lastUserMessage);

        // Create ReadableStream for server-sent streaming
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
      } catch (geminiError: any) {
        console.warn('Gemini API call failed, falling back to Clinical Master Engine:', geminiError.message);
        // Seamless fallback to Clinical Offline Engine below
      }
    }

    // 2. High-EQ Clinical Master Therapist Engine (Local / Offline Fallback)
    const masterResponse = generateClinicalMasterResponse(
      lastUserMessage,
      messages,
      userName || 'Friend',
      distressScore || 35,
      modality
    );

    // Stream the clinical master response chunk by chunk for the realistic ChatGPT/Claude typing experience
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        // Split text into small natural phrase chunks
        const words = masterResponse.split(' ');
        let buffer = '';
        
        for (let i = 0; i < words.length; i++) {
          buffer += (i === 0 ? '' : ' ') + words[i];
          // Emit every 2-4 words
          if (i % 3 === 0 || i === words.length - 1) {
            controller.enqueue(encoder.encode(buffer));
            buffer = '';
            // Micro-delay between tokens for smooth streaming feel
            await new Promise((resolve) => setTimeout(resolve, 25));
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
    return NextResponse.json({ error: error.message || 'Error generating therapeutic response.' }, { status: 500 });
  }
}
