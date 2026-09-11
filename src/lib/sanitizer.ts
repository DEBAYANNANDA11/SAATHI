/**
 * Content Safety Filter & Profanity / Slur Scrubber for SAATHI AI Companion.
 * Ensures the chatbot strictly maintains a warm, respectful, polite, and clean tone.
 * Strips abusive words, vulgar slang, cursing, and derogatory slurs.
 */

interface FilterRule {
  regex: RegExp;
  replacement: string;
}

const PROFANITY_RULES: FilterRule[] = [
  // F-word variants
  { regex: /\b(f+u+c*k+i*n*g*|f+k+i+n+g*)\b/gi, replacement: 'really' },
  { regex: /\b(f+u+c*k+e*d*)\b/gi, replacement: 'broken' },
  { regex: /\b(f+u+c*k+e*r*s*)\b/gi, replacement: 'someone' },
  { regex: /\b(f+u+c*k+s*|f+\*+c*k+)\b/gi, replacement: 'struggle' },

  // Bullshit
  { regex: /\b(b+u+l+l+s+h+i+t+)\b/gi, replacement: 'unfair' },

  // S-word variants
  { regex: /\b(s+h+i+t+t*y*)\b/gi, replacement: 'rough' },
  { regex: /\b(s+h+i+t+s*|s+h+i+t+e*|s+\*+i+t+)\b/gi, replacement: 'things' },

  // B-word variants
  { regex: /\b(b+i+t+c+h+e*s*|b+i+t+c+h+i*n*g*|b+i+t+c+h+|b+\*+t+c+h+)\b/gi, replacement: 'person' },

  // A-word variants
  { regex: /\b(a+s+s+h+o+l+e*s*|j+a+c+k+a+s+s+)\b/gi, replacement: 'unkind person' },
  { regex: /\b(a+s+s+e*s*|a+s+s+)\b/gi, replacement: 'self' },

  // Bastard / Crap / Damn
  { regex: /\b(b+a+s+t+a+r+d+s*|b+a+s+t+a+r+d+)\b/gi, replacement: 'difficult person' },
  { regex: /\b(c+r+a+p+p*y*)\b/gi, replacement: 'hard' },
  { regex: /\b(c+r+a+p+s*|c+r+a+p+)\b/gi, replacement: 'trouble' },
  { regex: /\b(d+a+m+n+e*d*|d+a+m+n*)\b/gi, replacement: 'truly' },

  // Pissed / Pissing
  { regex: /\b(p+i+s+s+e*d*|p+i+s+s+i*n*g*|p+i+s+s+)\b/gi, replacement: 'frustrated' },

  // Vulgar sexual / anatomical / abusive terms
  { regex: /\b(d+i+c+k+s*|d+i+c+k+|c+o+c+k+s*|c+o+c+k+|c+u+n+t+s*|c+u+n+t+|p+u+s+s+y*|w+h+o+r+e*s*|w+h+o+r+e+|s+l+u+t+s*|s+l+u+t+)\b/gi, replacement: '' },

  // Vulgar acronyms
  { regex: /\b(w+t+f+)\b/gi, replacement: 'what' },
  { regex: /\b(s+t+f+u+)\b/gi, replacement: 'pause' },
  { regex: /\b(l+m+f+a+o+)\b/gi, replacement: 'haha' },
  { regex: /\b(b+s+)\b/gi, replacement: 'untrue' },

  // Hateful Slurs (racial, ethnic, religious, homophobic, ablist, derogatory)
  { regex: /\b(n+i+g+g+[ae]r*s*|n+i+g+g+a*s*|f+a+g+g*o*t*s*|f+a+g+s*|r+e+t+a+r+d+s*|r+e+t+a+r+d+|c+h+i+n+k+s*|k+i+k+e*s*|s+p+i+c+s*|t+r+a+n+n+y*|d+y+k+e*s*)\b/gi, replacement: '' },

  // Abusive Hindi/Hinglish cusses/slurs
  { regex: /\b(c+h+u+t+i+y+a*|b+h+o+s+d+i*|m+a+d+a+r+c+h+o+d*|b+e+h+e+n+c+h+o+d*|g+a+a+n+d+|l+a+u+d+a+|l+u+n+d+|h+a+r+a+m+i*|k+u+t+t+e*|s+a+a+l+e*|k+a+m+i+n+e*)\b/gi, replacement: '' }
];

/**
 * Cleans any profanity, vulgarity, abusive language, or slurs from a given text.
 */
export function cleanProfanityAndSlurs(text: string): string {
  if (!text) return '';
  let cleaned = text;

  for (const rule of PROFANITY_RULES) {
    cleaned = cleaned.replace(rule.regex, (match) => {
      if (!rule.replacement) return '';
      if (match === match.toUpperCase() && match.length > 1) {
        return rule.replacement.toUpperCase();
      }
      return rule.replacement;
    });
  }

  // Remove trailing orphan punctuation or double spaces resulting from word stripping
  return cleaned
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/ ([,\.!\?])/g, '$1');
}

/**
 * Checks if a given text contains any profanity, abusive terms, or slurs.
 */
export function containsProfanityOrSlurs(text: string): boolean {
  if (!text) return false;
  return PROFANITY_RULES.some(rule => {
    rule.regex.lastIndex = 0;
    return rule.regex.test(text);
  });
}
