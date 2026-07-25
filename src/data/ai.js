// OpenRouter AI question generator — https://openrouter.ai/docs
//
// Challenge Mode: the player types any topic ("Kuwaiti Football") and the AI
// generates 5 multiple-choice questions, each with 1 correct + 3 wrong
// answers, normalized into the same shape the game already uses.

// ── CONFIG ──────────────────────────────────────────────────────────
// Put your key here, or set EXPO_PUBLIC_OPENROUTER_API_KEY in a .env file
// (the EXPO_PUBLIC_ prefix makes Expo inline it at build time).
const OPENROUTER_API_KEY =
  process.env.EXPO_PUBLIC_OPENROUTER_API_KEY || '';

// Any OpenRouter model id works — override via EXPO_PUBLIC_OPENROUTER_MODEL.
const MODEL = process.env.EXPO_PUBLIC_OPENROUTER_MODEL || 'openai/gpt-oss-20b:free';
// ────────────────────────────────────────────────────────────────────

const API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const TIMEOUT_MS = 30000; // generation is slower than a normal API call

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// 5 are played + 2 spares for the "Help Me" question swap.
const QUESTIONS_TO_GENERATE = 7;

function buildPrompt(topic) {
  return (
    `Generate exactly ${QUESTIONS_TO_GENERATE} multiple-choice trivia questions about: "${topic}".\n` +
    `Rules:\n` +
    `- Questions must be factual and specific to the topic.\n` +
    `- Each question has exactly one correct answer and exactly three plausible wrong answers.\n` +
    `- Keep every answer under 40 characters. Keep questions under 120 characters.\n` +
    `- Mix difficulties.\n` +
    `Respond with ONLY a valid JSON array — no markdown, no code fences, no commentary:\n` +
    `[{"question":"...","correct":"...","wrong":["...","...","..."]}]`
  );
}

// Extract the JSON array even if the model wraps it in prose/code fences.
function extractJsonArray(text) {
  const start = text.indexOf('[');
  const end = text.lastIndexOf(']');
  if (start === -1 || end === -1 || end <= start) {
    throw new Error('AI response had no JSON array');
  }
  return JSON.parse(text.slice(start, end + 1));
}

function normalize(items, topic) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('AI returned no questions');
  }
  // Keep every well-formed question (up to 7); drop malformed ones.
  const valid = [];
  for (const item of items.slice(0, QUESTIONS_TO_GENERATE)) {
    const question = String(item?.question ?? '').trim();
    const correct = String(item?.correct ?? '').trim();
    const wrong = Array.isArray(item?.wrong)
      ? item.wrong.map((w) => String(w).trim()).filter(Boolean)
      : [];
    if (!question || !correct || wrong.length < 3) continue;
    const answers = shuffle([correct, ...wrong.slice(0, 3)]);
    valid.push({
      id: valid.length + 1,
      question,
      answers,
      correct: answers.indexOf(correct),
      category: topic.toUpperCase(),
      difficulty: 'ai',
    });
  }
  // Need at least a full 5-question game; spares beyond that are a bonus.
  if (valid.length < 5) {
    throw new Error(`AI only produced ${valid.length} usable questions`);
  }
  return valid;
}

/**
 * Generate questions about a free-text topic via OpenRouter.
 * Retries once automatically — free-tier models fail transiently.
 * @throws when no API key is configured, on network/HTTP errors,
 *         or when the AI response can't be parsed into 5 valid questions.
 */
export async function fetchAiQuestions(topic) {
  if (!OPENROUTER_API_KEY) {
    throw new Error('NO API KEY SET — add it in src/data/ai.js');
  }
  try {
    return await requestQuestions(topic);
  } catch (firstError) {
    // One quiet retry; if it also fails, surface the newest error.
    return await requestQuestions(topic);
  }
}

async function requestQuestions(topic) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        // Optional OpenRouter attribution headers:
        'X-Title': 'Trivia Boy',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: 'user', content: buildPrompt(topic) }],
        temperature: 0.8,
        // Plenty of room so reasoning models don't truncate mid-answer.
        max_tokens: 4000,
        // Keep reasoning models fast — we need JSON, not deep thought.
        reasoning: { effort: 'low' },
      }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(`OpenRouter HTTP ${res.status}${body ? `: ${body.slice(0, 120)}` : ''}`);
    }

    const json = await res.json();
    const text = json?.choices?.[0]?.message?.content;
    if (!text) throw new Error('OpenRouter returned an empty completion');

    return normalize(extractJsonArray(text), topic);
  } finally {
    clearTimeout(timer);
  }
}
