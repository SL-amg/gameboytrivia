// Hardcoded fallback questions, used when the OpenTDB API is unreachable.
// `correct` is the index (0-3) into `answers`.

export const QUESTIONS = [
  {
    id: 1,
    question: 'Which planet is known as the Red Planet?',
    answers: ['Venus', 'Mars', 'Jupiter', 'Saturn'],
    correct: 1,
  },
  {
    id: 2,
    question: 'How many bits was the original Game Boy CPU?',
    answers: ['8-bit', '16-bit', '32-bit', '64-bit'],
    correct: 0,
  },
  {
    id: 3,
    question: 'What is the largest ocean on Earth?',
    answers: ['Atlantic', 'Indian', 'Arctic', 'Pacific'],
    correct: 3,
  },
  {
    id: 4,
    question: 'In which language is React Native written?',
    answers: ['Python', 'JavaScript', 'Ruby', 'Swift'],
    correct: 1,
  },
  {
    id: 5,
    question: 'How many continents are there on Earth?',
    answers: ['5', '6', '7', '8'],
    correct: 2,
  },
  // Extra entries beyond 5 serve as "Help Me" swap spares.
  {
    id: 6,
    question: 'What color is an emerald?',
    answers: ['Red', 'Blue', 'Green', 'Yellow'],
    correct: 2,
  },
  {
    id: 7,
    question: 'How many minutes are in one hour?',
    answers: ['30', '60', '90', '100'],
    correct: 1,
  },
];

export const POINTS_PER_CORRECT = 100;
