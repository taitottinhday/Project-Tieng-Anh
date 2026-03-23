// Transcribed from images linked in:
// https://chuyendetienganh.com/bai-viet/dap-an-full-test-lcrc-ets-2020-moi-nhat
const listening = [
  'B', 'C', 'D', 'A', 'D', 'C', 'A', 'C', 'B', 'C',
  'C', 'C', 'B', 'A', 'A', 'C', 'B', 'C', 'A', 'A',
  'B', 'B', 'B', 'A', 'C', 'B', 'A', 'C', 'C', 'C',
  'B', 'C', 'B', 'D', 'D', 'B', 'A', 'B', 'B', 'C',
  'C', 'B', 'A', 'D', 'C', 'B', 'D', 'C', 'A', 'A',
  'B', 'C', 'D', 'C', 'A', 'B', 'C', 'D', 'D', 'C',
  'A', 'B', 'D', 'D', 'B', 'C', 'A', 'C', 'B', 'B',
  'B', 'C', 'B', 'D', 'C', 'A', 'B', 'A', 'C', 'D',
  'C', 'A', 'B', 'A', 'A', 'A', 'B', 'D', 'A', 'C',
  'B', 'B', 'D', 'A', 'C', 'B', 'D', 'B', 'C', 'D'
];

const readingRelative = [
  'A', 'A', 'D', 'D', 'A', 'A', 'B', 'C', 'D', 'B',
  'C', 'B', 'B', 'A', 'D', 'D', 'C', 'D', 'C', 'C',
  'A', 'B', 'B', 'C', 'D', 'A', 'A', 'D', 'A', 'B',
  'B', 'C', 'A', 'D', 'D', 'C', 'A', 'B', 'A', 'C',
  'A', 'B', 'B', 'A', 'D', 'D', 'C', 'A', 'C', 'C',
  'B', 'D', 'B', 'B', 'D', 'C', 'B', 'A', 'B', 'B',
  'C', 'B', 'D', 'D', 'B', 'C', 'A', 'D', 'C', 'A',
  'B', 'D', 'B', 'A', 'B', 'C', 'A', 'D', 'B', 'D',
  'A', 'A', 'C', 'C', 'B', 'C', 'C', 'B', 'C', 'A',
  'A', 'B', 'D', 'D', 'C', 'B', 'A', 'D', 'C', 'B'
];

const answerKey = {};

listening.forEach((answer, index) => {
  answerKey[index + 1] = answer;
});

readingRelative.forEach((answer, index) => {
  answerKey[index + 101] = answer;
});

module.exports = answerKey;
