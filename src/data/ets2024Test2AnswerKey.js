const listening = [
  'A', 'B', 'C', 'D', 'C', 'D', 'B', 'C', 'C', 'A',
  'C', 'C', 'C', 'B', 'A', 'A', 'A', 'C', 'B', 'C',
  'A', 'B', 'C', 'A', 'C', 'A', 'B', 'A', 'C', 'C',
  'B', 'B', 'D', 'C', 'B', 'A', 'C', 'A', 'D', 'C',
  'A', 'D', 'D', 'C', 'B', 'D', 'B', 'C', 'A', 'A',
  'D', 'A', 'C', 'C', 'A', 'C', 'A', 'B', 'B', 'C',
  'A', 'B', 'C', 'B', 'B', 'C', 'A', 'A', 'D', 'A',
  'D', 'C', 'A', 'D', 'B', 'D', 'B', 'A', 'D', 'D',
  'C', 'D', 'B', 'A', 'A', 'B', 'C', 'B', 'D', 'B',
  'A', 'D', 'A', 'C', 'A', 'B', 'B', 'C', 'A', 'B'
];

const readingRelative = [
  'C', 'C', 'A', 'B', 'D', 'A', 'C', 'D', 'C', 'D',
  'A', 'D', 'C', 'A', 'C', 'A', 'A', 'B', 'B', 'D',
  'C', 'A', 'A', 'C', 'B', 'B', 'D', 'D', 'B', 'B',
  'C', 'A', 'D', 'A', 'D', 'C', 'C', 'A', 'B', 'C',
  'A', 'C', 'C', 'D', 'B', 'A', 'A', 'B', 'A', 'D',
  'A', 'C', 'A', 'B', 'D', 'C', 'B', 'D', 'D', 'B',
  'C', 'D', 'B', 'D', 'B', 'A', 'C', 'B', 'D', 'B',
  'D', 'A', 'C', 'A', 'D', 'B', 'B', 'C', 'D', 'B',
  'A', 'D', 'C', 'C', 'B', 'C', 'D', 'A', 'B', 'D',
  'B', 'C', 'A', 'D', 'B', 'D', 'A', 'B', 'C', 'B'
];

const answerKey = {};

listening.forEach((answer, index) => {
  answerKey[index + 1] = answer;
});

readingRelative.forEach((answer, index) => {
  answerKey[index + 101] = answer;
});

module.exports = answerKey;
