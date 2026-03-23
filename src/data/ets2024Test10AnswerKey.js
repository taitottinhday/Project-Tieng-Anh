// Transcribed from:
// https://mytour.vn/vi/blog/bai-viet/answers-and-amp-detailed-explanation-ets-2024-from-test-1-to-test-10-ets-lc-and-amp-rc.html
const listening = [
  'D', 'B', 'C', 'A', 'C', 'A', 'A', 'B', 'C', 'A',
  'C', 'C', 'A', 'C', 'C', 'A', 'A', 'A', 'B', 'B',
  'A', 'C', 'B', 'C', 'C', 'A', 'B', 'C', 'A', 'B',
  'C', 'B', 'C', 'C', 'C', 'D', 'B', 'D', 'B', 'A',
  'C', 'D', 'C', 'C', 'A', 'B', 'C', 'B', 'A', 'C',
  'A', 'B', 'A', 'C', 'C', 'C', 'A', 'B', 'A', 'D',
  'D', 'A', 'B', 'C', 'A', 'B', 'A', 'C', 'D', 'B',
  'B', 'A', 'C', 'A', 'A', 'D', 'C', 'D', 'B', 'A',
  'D', 'B', 'C', 'A', 'A', 'C', 'C', 'A', 'C', 'A',
  'B', 'A', 'C', 'D', 'B', 'A', 'D', 'C', 'A', 'D'
];

const readingRelative = [
  'B', 'A', 'C', 'D', 'C', 'C', 'B', 'C', 'C', 'A',
  'B', 'D', 'A', 'D', 'D', 'B', 'D', 'C', 'B', 'A',
  'D', 'C', 'D', 'B', 'B', 'D', 'C', 'A', 'A', 'A',
  'D', 'B', 'B', 'A', 'D', 'C', 'A', 'C', 'B', 'C',
  'A', 'D', 'D', 'A', 'C', 'B', 'D', 'A', 'C', 'B',
  'D', 'B', 'A', 'B', 'D', 'D', 'B', 'A', 'C', 'B',
  'C', 'C', 'A', 'A', 'B', 'B', 'D', 'D', 'D', 'C',
  'B', 'D', 'B', 'C', 'D', 'B', 'D', 'A', 'D', 'C',
  'C', 'D', 'A', 'D', 'A', 'C', 'A', 'B', 'D', 'C',
  'B', 'B', 'C', 'A', 'D', 'C', 'C', 'B', 'A', 'B'
];

const answerKey = {};

listening.forEach((answer, index) => {
  answerKey[index + 1] = answer;
});

readingRelative.forEach((answer, index) => {
  answerKey[index + 101] = answer;
});

module.exports = answerKey;
