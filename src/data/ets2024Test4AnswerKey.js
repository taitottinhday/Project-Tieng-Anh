// Generated from public answer sources:
// - https://mytour.vn/vi/blog/bai-viet/answers-and-amp-detailed-explanation-ets-2024-from-test-1-to-test-10-ets-lc-and-amp-rc.html
const listening = [
  'C', 'D', 'A', 'B', 'C', 'D', 'A', 'B', 'B', 'A',
  'C', 'A', 'C', 'C', 'A', 'C', 'B', 'A', 'C', 'C',
  'A', 'A', 'C', 'C', 'C', 'B', 'C', 'A', 'C', 'B',
  'B', 'A', 'C', 'B', 'B', 'A', 'D', 'C', 'B', 'C',
  'B', 'D', 'B', 'B', 'C', 'A', 'C', 'D', 'A', 'C',
  'A', 'D', 'C', 'A', 'B', 'A', 'B', 'D', 'B', 'A',
  'B', 'B', 'A', 'C', 'D', 'A', 'A', 'C', 'B', 'B',
  'C', 'A', 'B', 'C', 'A', 'D', 'B', 'D', 'D', 'A',
  'D', 'B', 'C', 'D', 'D', 'C', 'D', 'B', 'B', 'C',
  'B', 'B', 'C', 'D', 'C', 'D', 'D', 'D', 'C', 'C'
];

const readingRelative = [
  'A', 'C', 'A', 'B', 'D', 'D', 'B', 'D', 'C', 'B',
  'A', 'A', 'B', 'D', 'D', 'C', 'A', 'D', 'B', 'C',
  'C', 'C', 'A', 'A', 'D', 'B', 'A', 'D', 'C', 'A',
  'C', 'D', 'B', 'A', 'B', 'D', 'C', 'C', 'A', 'A',
  'C', 'B', 'A', 'B', 'D', 'A', 'B', 'C', 'C', 'D',
  'D', 'C', 'A', 'C', 'B', 'C', 'D', 'A', 'B', 'D',
  'B', 'C', 'D', 'C', 'B', 'D', 'C', 'B', 'C', 'D',
  'A', 'B', 'C', 'D', 'B', 'B', 'D', 'A', 'C', 'B',
  'D', 'A', 'C', 'B', 'A', 'B', 'A', 'D', 'A', 'C',
  'D', 'B', 'C', 'D', 'A', 'C', 'B', 'A', 'B', 'D'
];

const answerKey = {};

listening.forEach((answer, index) => {
  answerKey[index + 1] = answer;
});

readingRelative.forEach((answer, index) => {
  answerKey[index + 101] = answer;
});

module.exports = answerKey;
