// Generated from public answer sources:
// - https://mytour.vn/vi/blog/bai-viet/answers-and-amp-detailed-explanation-ets-2024-from-test-1-to-test-10-ets-lc-and-amp-rc.html
const listening = [
  'D', 'D', 'A', 'B', 'C', 'C', 'A', 'C', 'B', 'C',
  'A', 'A', 'C', 'B', 'C', 'C', 'A', 'A', 'A', 'B',
  'A', 'A', 'B', 'B', 'C', 'A', 'A', 'B', 'B', 'A',
  'A', 'C', 'D', 'C', 'B', 'A', 'C', 'B', 'C', 'D',
  'B', 'C', 'D', 'A', 'B', 'B', 'C', 'D', 'A', 'A',
  'D', 'C', 'B', 'C', 'C', 'D', 'C', 'A', 'A', 'B',
  'C', 'C', 'C', 'B', 'D', 'C', 'C', 'C', 'D', 'C',
  'D', 'C', 'D', 'C', 'D', 'D', 'D', 'B', 'B', 'C',
  'A', 'D', 'C', 'D', 'B', 'D', 'B', 'C', 'A', 'A',
  'D', 'C', 'A', 'D', 'D', 'B', 'C', 'A', 'D', 'B'
];

const readingRelative = [
  'A', 'A', 'B', 'A', 'C', 'D', 'B', 'D', 'B', 'C',
  'A', 'D', 'B', 'A', 'C', 'A', 'C', 'A', 'A', 'A',
  'C', 'C', 'D', 'A', 'D', 'B', 'C', 'C', 'B', 'A',
  'B', 'D', 'A', 'C', 'C', 'A', 'B', 'D', 'B', 'C',
  'D', 'D', 'B', 'A', 'D', 'A', 'D', 'C', 'C', 'B',
  'D', 'A', 'B', 'C', 'C', 'A', 'B', 'C', 'C', 'A',
  'D', 'D', 'C', 'B', 'D', 'A', 'C', 'A', 'B', 'D',
  'C', 'A', 'C', 'C', 'B', 'C', 'B', 'D', 'A', 'A',
  'C', 'D', 'C', 'B', 'D', 'A', 'B', 'D', 'B', 'C',
  'B', 'D', 'A', 'A', 'D', 'B', 'D', 'D', 'A', 'C'
];

const answerKey = {};

listening.forEach((answer, index) => {
  answerKey[index + 1] = answer;
});

readingRelative.forEach((answer, index) => {
  answerKey[index + 101] = answer;
});

module.exports = answerKey;
