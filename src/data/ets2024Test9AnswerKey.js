// Transcribed from:
// https://mytour.vn/vi/blog/bai-viet/answers-and-amp-detailed-explanation-ets-2024-from-test-1-to-test-10-ets-lc-and-amp-rc.html
const listening = [
  'C', 'D', 'C', 'B', 'A', 'C', 'C', 'A', 'B', 'A',
  'A', 'C', 'A', 'A', 'B', 'B', 'A', 'C', 'B', 'A',
  'C', 'B', 'A', 'A', 'C', 'B', 'A', 'A', 'A', 'C',
  'C', 'B', 'A', 'D', 'D', 'C', 'B', 'C', 'B', 'A',
  'C', 'C', 'A', 'D', 'A', 'C', 'B', 'A', 'D', 'C',
  'B', 'A', 'C', 'B', 'C', 'A', 'C', 'C', 'C', 'D',
  'A', 'A', 'D', 'D', 'C', 'A', 'B', 'D', 'C', 'D',
  'B', 'A', 'D', 'C', 'B', 'A', 'B', 'C', 'A', 'D',
  'A', 'B', 'A', 'A', 'C', 'A', 'C', 'B', 'C', 'C',
  'A', 'D', 'B', 'D', 'C', 'A', 'D', 'D', 'C', 'D'
];

const readingRelative = [
  'B', 'B', 'D', 'B', 'B', 'D', 'D', 'C', 'D', 'A',
  'C', 'A', 'A', 'A', 'B', 'A', 'C', 'C', 'A', 'C',
  'A', 'A', 'D', 'B', 'A', 'D', 'D', 'D', 'A', 'A',
  'C', 'C', 'B', 'B', 'D', 'D', 'B', 'C', 'C', 'A',
  'B', 'A', 'A', 'B', 'C', 'D', 'A', 'D', 'B', 'D',
  'B', 'A', 'C', 'A', 'A', 'B', 'D', 'B', 'D', 'B',
  'C', 'B', 'D', 'B', 'C', 'B', 'D', 'A', 'B', 'C',
  'A', 'D', 'B', 'D', 'C', 'D', 'B', 'C', 'A', 'C',
  'B', 'C', 'B', 'D', 'D', 'D', 'A', 'B', 'D', 'C',
  'C', 'B', 'C', 'B', 'D', 'C', 'D', 'B', 'A', 'A'
];

const answerKey = {};

listening.forEach((answer, index) => {
  answerKey[index + 1] = answer;
});

readingRelative.forEach((answer, index) => {
  answerKey[index + 101] = answer;
});

module.exports = answerKey;
