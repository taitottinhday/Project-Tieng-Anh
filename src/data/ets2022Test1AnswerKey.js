// Transcribed from images linked in:
// https://chuyendetienganh.com/bai-viet/dap-an-full-test-lcrc-ets-2022
const listening = [
  'B', 'C', 'B', 'A', 'D', 'C', 'B', 'A', 'C', 'C',
  'A', 'B', 'C', 'A', 'B', 'A', 'C', 'B', 'C', 'A',
  'C', 'B', 'A', 'B', 'C', 'C', 'A', 'A', 'A', 'B',
  'C', 'D', 'B', 'B', 'A', 'D', 'C', 'A', 'D', 'B',
  'C', 'A', 'B', 'D', 'C', 'C', 'D', 'C', 'B', 'B',
  'B', 'C', 'D', 'B', 'A', 'A', 'D', 'C', 'C', 'A',
  'D', 'C', 'C', 'A', 'C', 'C', 'D', 'B', 'C', 'D',
  'D', 'B', 'C', 'A', 'D', 'D', 'D', 'C', 'D', 'A',
  'B', 'C', 'C', 'A', 'A', 'B', 'A', 'C', 'C', 'B',
  'D', 'B', 'C', 'D', 'A', 'D', 'C', 'A', 'D', 'C'
];

const readingRelative = [
  'A', 'D', 'D', 'D', 'A', 'B', 'C', 'D', 'D', 'A',
  'B', 'B', 'C', 'B', 'D', 'B', 'C', 'C', 'C', 'A',
  'A', 'C', 'D', 'A', 'C', 'D', 'B', 'B', 'C', 'B',
  'D', 'B', 'A', 'D', 'A', 'B', 'B', 'C', 'B', 'D',
  'A', 'B', 'D', 'A', 'B', 'C', 'B', 'C', 'B', 'D',
  'B', 'C', 'A', 'D', 'D', 'A', 'B', 'A', 'C', 'A',
  'D', 'A', 'D', 'A', 'C', 'B', 'C', 'A', 'B', 'C',
  'A', 'B', 'C', 'B', 'D', 'C', 'B', 'C', 'D', 'A',
  'C', 'B', 'A', 'B', 'C', 'B', 'C', 'A', 'B', 'A',
  'B', 'C', 'A', 'D', 'D', 'A', 'C', 'B', 'C', 'D'
];

const answerKey = {};

listening.forEach((answer, index) => {
  answerKey[index + 1] = answer;
});

readingRelative.forEach((answer, index) => {
  answerKey[index + 101] = answer;
});

module.exports = answerKey;
