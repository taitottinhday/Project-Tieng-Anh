// Generated from public answer sources:
// - https://chuyendetienganh.com/bai-viet/dap-an-full-test-lcrc-ets-2023-moi-nhat
// - https://api.chuyendetienganh.com/upload/post_upload/images/dap-an-test-4-ets-2023.jpg
const listening = [
  'C', 'B', 'D', 'C', 'C', 'A', 'B', 'C', 'A', 'B',
  'A', 'B', 'A', 'C', 'A', 'B', 'C', 'C', 'C', 'A',
  'C', 'B', 'C', 'A', 'B', 'B', 'A', 'A', 'B', 'A',
  'A', 'B', 'B', 'A', 'C', 'B', 'A', 'A', 'B', 'D',
  'D', 'A', 'B', 'B', 'A', 'C', 'A', 'D', 'A', 'D',
  'C', 'D', 'B', 'A', 'C', 'D', 'A', 'B', 'A', 'D',
  'D', 'B', 'C', 'A', 'B', 'C', 'A', 'A', 'C', 'D',
  'C', 'B', 'D', 'B', 'A', 'D', 'D', 'C', 'A', 'D',
  'B', 'C', 'C', 'B', 'D', 'A', 'D', 'A', 'B', 'A',
  'C', 'C', 'D', 'A', 'B', 'D', 'C', 'D', 'C', 'A'
];

const readingRelative = [
  'B', 'A', 'A', 'D', 'A', 'D', 'C', 'A', 'D', 'D',
  'A', 'C', 'D', 'A', 'A', 'B', 'D', 'C', 'A', 'C',
  'B', 'C', 'A', 'D', 'B', 'A', 'D', 'C', 'B', 'C',
  'A', 'A', 'D', 'D', 'D', 'B', 'A', 'D', 'A', 'A',
  'C', 'D', 'B', 'C', 'A', 'D', 'B', 'D', 'D', 'C',
  'D', 'C', 'B', 'C', 'A', 'D', 'C', 'B', 'C', 'A',
  'C', 'D', 'A', 'B', 'A', 'C', 'B', 'A', 'B', 'B',
  'A', 'C', 'B', 'D', 'B', 'C', 'A', 'B', 'D', 'C',
  'B', 'D', 'C', 'A', 'B', 'B', 'A', 'B', 'C', 'D',
  'D', 'D', 'C', 'C', 'B', 'A', 'D', 'B', 'C', 'D'
];

const answerKey = {};

listening.forEach((answer, index) => {
  answerKey[index + 1] = answer;
});

readingRelative.forEach((answer, index) => {
  answerKey[index + 101] = answer;
});

module.exports = answerKey;
