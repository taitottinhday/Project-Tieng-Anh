// Generated from public answer sources:
// - https://mytour.vn/vi/blog/bai-viet/answers-and-amp-detailed-explanation-ets-2024-from-test-1-to-test-10-ets-lc-and-amp-rc.html
const listening = [
  'D', 'B', 'D', 'C', 'B', 'A', 'B', 'A', 'B', 'B',
  'C', 'B', 'B', 'B', 'A', 'C', 'A', 'B', 'C', 'A',
  'B', 'C', 'B', 'B', 'A', 'A', 'C', 'A', 'C', 'C',
  'B', 'A', 'C', 'B', 'B', 'A', 'D', 'D', 'C', 'A',
  'B', 'C', 'B', 'D', 'A', 'A', 'B', 'C', 'D', 'D',
  'A', 'D', 'B', 'A', 'D', 'C', 'A', 'D', 'D', 'B',
  'A', 'B', 'A', 'D', 'B', 'C', 'B', 'A', 'D', 'D',
  'B', 'A', 'C', 'A', 'B', 'C', 'C', 'A', 'D', 'D',
  'B', 'A', 'B', 'C', 'D', 'C', 'D', 'C', 'A', 'A',
  'B', 'B', 'D', 'A', 'A', 'C', 'B', 'B', 'D', 'C'
];

const readingRelative = [
  'A', 'D', 'A', 'C', 'B', 'C', 'C', 'C', 'A', 'B',
  'B', 'C', 'D', 'A', 'B', 'A', 'C', 'A', 'B', 'A',
  'C', 'B', 'B', 'D', 'D', 'D', 'A', 'C', 'B', 'D',
  'B', 'A', 'A', 'D', 'D', 'C', 'D', 'B', 'C', 'D',
  'B', 'D', 'D', 'B', 'A', 'D', 'C', 'B', 'C', 'D',
  'B', 'C', 'A', 'C', 'D', 'A', 'B', 'B', 'C', 'B',
  'D', 'A', 'D', 'B', 'D', 'A', 'C', 'B', 'A', 'C',
  'B', 'D', 'C', 'A', 'B', 'B', 'B', 'A', 'C', 'D',
  'C', 'D', 'A', 'B', 'B', 'C', 'A', 'B', 'D', 'C',
  'D', 'D', 'C', 'A', 'A', 'C', 'A', 'B', 'B', 'D'
];

const answerKey = {};

listening.forEach((answer, index) => {
  answerKey[index + 1] = answer;
});

readingRelative.forEach((answer, index) => {
  answerKey[index + 101] = answer;
});

module.exports = answerKey;
