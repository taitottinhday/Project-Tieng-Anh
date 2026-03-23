// Generated from public answer sources:
// - https://mytour.vn/vi/blog/bai-viet/answers-and-amp-detailed-explanation-ets-2024-from-test-1-to-test-10-ets-lc-and-amp-rc.html
const listening = [
  'D', 'C', 'D', 'B', 'B', 'D', 'A', 'A', 'C', 'B',
  'B', 'A', 'C', 'B', 'A', 'A', 'B', 'B', 'A', 'C',
  'C', 'A', 'C', 'A', 'B', 'C', 'B', 'C', 'C', 'B',
  'C', 'C', 'B', 'D', 'B', 'A', 'D', 'D', 'B', 'D',
  'C', 'B', 'B', 'D', 'C', 'D', 'C', 'A', 'D', 'D',
  'C', 'A', 'B', 'D', 'D', 'D', 'B', 'A', 'C', 'D',
  'A', 'B', 'C', 'C', 'B', 'C', 'A', 'C', 'B', 'A',
  'C', 'C', 'A', 'A', 'C', 'B', 'C', 'C', 'A', 'D',
  'B', 'C', 'C', 'B', 'D', 'C', 'A', 'A', 'D', 'C',
  'B', 'D', 'C', 'A', 'A', 'A', 'C', 'B', 'C', 'D'
];

const readingRelative = [
  'C', 'B', 'A', 'B', 'D', 'C', 'C', 'B', 'A', 'D',
  'D', 'C', 'C', 'D', 'A', 'A', 'B', 'A', 'C', 'D',
  'D', 'D', 'C', 'B', 'D', 'A', 'D', 'A', 'B', 'D',
  'C', 'D', 'A', 'B', 'C', 'B', 'B', 'A', 'C', 'B',
  'C', 'A', 'C', 'D', 'A', 'A', 'A', 'D', 'D', 'B',
  'C', 'A', 'B', 'C', 'D', 'B', 'C', 'C', 'C', 'A',
  'C', 'B', 'D', 'B', 'B', 'D', 'C', 'A', 'A', 'C',
  'C', 'B', 'B', 'A', 'D', 'B', 'D', 'A', 'A', 'B',
  'D', 'B', 'D', 'B', 'D', 'C', 'B', 'D', 'A', 'D',
  'D', 'B', 'C', 'C', 'D', 'D', 'A', 'B', 'C', 'D'
];

const answerKey = {};

listening.forEach((answer, index) => {
  answerKey[index + 1] = answer;
});

readingRelative.forEach((answer, index) => {
  answerKey[index + 101] = answer;
});

module.exports = answerKey;
