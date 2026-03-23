// Generated from public answer sources:
// - https://mytour.vn/vi/blog/bai-viet/answers-and-amp-detailed-explanation-ets-2024-from-test-1-to-test-10-ets-lc-and-amp-rc.html
const listening = [
  'D', 'A', 'C', 'D', 'A', 'B', 'A', 'C', 'C', 'B',
  'B', 'A', 'B', 'C', 'B', 'A', 'B', 'A', 'B', 'C',
  'B', 'A', 'B', 'C', 'C', 'B', 'C', 'C', 'A', 'A',
  'A', 'C', 'A', 'C', 'C', 'B', 'A', 'B', 'D', 'A',
  'A', 'C', 'B', 'B', 'D', 'B', 'D', 'A', 'B', 'A',
  'D', 'C', 'D', 'B', 'C', 'B', 'C', 'D', 'C', 'A',
  'B', 'B', 'A', 'C', 'B', 'C', 'B', 'D', 'B', 'B',
  'A', 'C', 'D', 'B', 'D', 'B', 'B', 'D', 'A', 'B',
  'C', 'D', 'D', 'B', 'C', 'D', 'B', 'A', 'D', 'B',
  'C', 'C', 'B', 'B', 'C', 'D', 'D', 'A', 'C', 'D'
];

const readingRelative = [
  'D', 'A', 'C', 'B', 'C', 'B', 'B', 'C', 'C', 'A',
  'B', 'C', 'D', 'B', 'A', 'A', 'D', 'A', 'D', 'D',
  'D', 'A', 'A', 'B', 'C', 'C', 'B', 'D', 'C', 'D',
  'B', 'C', 'A', 'D', 'B', 'C', 'C', 'A', 'A', 'D',
  'C', 'B', 'B', 'D', 'A', 'C', 'B', 'B', 'C', 'D',
  'D', 'A', 'A', 'D', 'C', 'B', 'D', 'A', 'C', 'C',
  'B', 'D', 'A', 'B', 'C', 'A', 'D', 'C', 'B', 'D',
  'C', 'D', 'B', 'C', 'D', 'D', 'C', 'A', 'D', 'B',
  'C', 'C', 'A', 'C', 'D', 'A', 'A', 'D', 'B', 'B',
  'C', 'A', 'A', 'D', 'C', 'A', 'C', 'B', 'D', 'A'
];

const answerKey = {};

listening.forEach((answer, index) => {
  answerKey[index + 1] = answer;
});

readingRelative.forEach((answer, index) => {
  answerKey[index + 101] = answer;
});

module.exports = answerKey;
