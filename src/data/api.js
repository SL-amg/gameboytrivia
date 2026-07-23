// Open Trivia Database client — https://opentdb.com/api_config.php
//
// Fetches N random multiple-choice questions and normalizes them into the
// shape the game uses: { question, answers[4], correct, category, difficulty }.
//
// We request `encode=url3986` (percent-encoding) so decoding is a simple,
// reliable decodeURIComponent — the default response is HTML-entity encoded
// (&quot; &#039; …) which React Native does not render.

import { QUESTIONS as FALLBACK_QUESTIONS } from './questions';

const BASE_URL = 'https://opentdb.com/api.php';
const TIMEOUT_MS = 10000;

// Optional category codes (see README / OpenTDB docs).
export const CATEGORIES = {
  general: 9,
  scienceNature: 17,
  computers: 18,
  mathematics: 19,
  sports: 21,
  geography: 22,
  history: 23,
  art: 25,
};

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function normalize(results) {
  return results.map((r, i) => {
    const correctText = decodeURIComponent(r.correct_answer);
    const answers = shuffle([
      correctText,
      ...r.incorrect_answers.map((x) => decodeURIComponent(x)),
    ]);
    return {
      id: i + 1,
      question: decodeURIComponent(r.question),
      answers,
      correct: answers.indexOf(correctText),
      category: decodeURIComponent(r.category),
      difficulty: r.difficulty, // 'easy' | 'medium' | 'hard'
    };
  });
}

/**
 * Fetch questions from OpenTDB.
 * @param {object} opts
 * @param {number} [opts.amount=5]      number of questions (max 50)
 * @param {number} [opts.category]      OpenTDB category code (e.g. 18 = Computers)
 * @param {string} [opts.difficulty]    'easy' | 'medium' | 'hard'
 * @returns {Promise<Array>} normalized questions
 * @throws on network failure, timeout, or empty/error API response
 */
export async function fetchQuestions({ amount = 5, category, difficulty } = {}) {
  const params = new URLSearchParams({
    amount: String(amount),
    type: 'multiple',
    encode: 'url3986',
  });
  if (category) params.append('category', String(category));
  if (difficulty) params.append('difficulty', difficulty);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(`${BASE_URL}?${params.toString()}`, {
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    // response_code 0 = success; anything else = no results / rate limit / bad params
    if (json.response_code !== 0 || !Array.isArray(json.results) || json.results.length === 0) {
      throw new Error(`OpenTDB response_code ${json.response_code}`);
    }
    return normalize(json.results);
  } finally {
    clearTimeout(timer);
  }
}

// Offline / API-failure fallback: the original hardcoded questions.
export function getFallbackQuestions() {
  return FALLBACK_QUESTIONS.map((q) => ({
    ...q,
    category: 'Classic Mix',
    difficulty: 'easy',
  }));
}
