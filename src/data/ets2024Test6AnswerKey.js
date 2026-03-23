// Generated from public answer sources:
// - https://mytour.vn/vi/blog/bai-viet/answers-and-amp-detailed-explanation-ets-2024-from-test-1-to-test-10-ets-lc-and-amp-rc.html
const listening = [
  'B', 'A', 'D', 'B', 'C', 'A', 'A', 'A', 'A', 'C',
  'B', 'C', 'A', 'C', 'A', 'B', 'B', 'B', 'B', 'C',
  'A', 'A', 'C', 'A', 'C', 'B', 'B', 'A', 'A', 'A',
  'A', 'A', 'B', 'B', 'B', 'D', 'C', 'B', 'A', 'D',
  'B', 'A', 'C', 'C', 'C', 'A', 'C', 'B', 'D', 'B',
  'A', 'C', 'C', 'A', 'C', 'C', 'D', 'B', 'C', 'A',
  'D', 'A', 'D', 'B', 'A', 'D', 'C', 'C', 'B', 'B',
  'A', 'D', 'C', 'C', 'D', 'A', 'B', 'A', 'D', 'C',
  'D', 'A', 'B', 'D', 'B', 'B', 'D', 'A', 'A', 'B',
  'C', 'B', 'A', 'C', 'D', 'C', 'A', 'C', 'B', 'D'
];

const readingRelative = [
  'B', 'B', 'C', 'C', 'B', 'C', 'C', 'D', 'A', 'A',
  'A', 'A', 'C', 'C', 'A', 'B', 'D', 'C', 'C', 'A',
  'A', 'D', 'D', 'D', 'B', 'A', 'D', 'A', 'C', 'A',
  'B', 'A', 'C', 'B', 'C', 'A', 'C', 'D', 'B', 'D',
  'C', 'B', 'A', 'D', 'B', 'B', 'C', 'B', 'D', 'C',
  'C', 'D', 'A', 'D', 'B', 'A', 'C', 'C', 'B', 'B',
  'A', 'D', 'C', 'D', 'A', 'B', 'A', 'B', 'D', 'C',
  'C', 'B', 'A', 'A', 'D', 'B', 'D', 'A', 'A', 'B',
  'B', 'C', 'B', 'D', 'D', 'C', 'D', 'A', 'A', 'B',
  'B', 'A', 'D', 'D', 'A', 'A', 'B', 'D', 'A', 'B'
];

const answerKey = {};

listening.forEach((answer, index) => {
  answerKey[index + 1] = answer;
});

readingRelative.forEach((answer, index) => {
  answerKey[index + 101] = answer;
});

module.exports = answerKey;
