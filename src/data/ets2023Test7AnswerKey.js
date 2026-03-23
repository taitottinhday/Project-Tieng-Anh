// Generated from public answer sources:
// - https://chuyendetienganh.com/bai-viet/dap-an-full-test-lcrc-ets-2023-moi-nhat
// - https://api.chuyendetienganh.com/upload/post_upload/images/dap-an-test-7-ets-2023.jpg
const listening = [
  'D', 'A', 'C', 'B', 'B', 'D', 'A', 'A', 'A', 'C',
  'B', 'B', 'C', 'C', 'C', 'B', 'A', 'A', 'A', 'C',
  'A', 'C', 'C', 'A', 'C', 'A', 'A', 'C', 'C', 'B',
  'B', 'B', 'D', 'A', 'B', 'C', 'B', 'A', 'C', 'D',
  'D', 'C', 'A', 'B', 'B', 'C', 'D', 'B', 'C', 'C',
  'B', 'C', 'C', 'B', 'A', 'B', 'D', 'B', 'D', 'C',
  'B', 'B', 'C', 'D', 'B', 'B', 'C', 'C', 'A', 'D',
  'C', 'A', 'D', 'B', 'D', 'A', 'C', 'C', 'D', 'D',
  'C', 'A', 'B', 'D', 'D', 'D', 'B', 'A', 'B', 'D',
  'C', 'D', 'B', 'A', 'B', 'B', 'A', 'B', 'B', 'D'
];

const readingRelative = [
  'C', 'B', 'C', 'A', 'D', 'C', 'A', 'A', 'A', 'D',
  'C', 'D', 'C', 'D', 'C', 'B', 'A', 'A', 'B', 'D',
  'D', 'B', 'C', 'D', 'A', 'A', 'C', 'B', 'C', 'D',
  'B', 'A', 'C', 'B', 'A', 'D', 'C', 'B', 'D', 'A',
  'D', 'B', 'B', 'C', 'A', 'D', 'C', 'D', 'A', 'D',
  'A', 'B', 'C', 'B', 'A', 'C', 'D', 'B', 'D', 'B',
  'D', 'C', 'B', 'C', 'A', 'D', 'A', 'B', 'A', 'C',
  'C', 'D', 'B', 'C', 'B', 'C', 'A', 'B', 'D', 'A',
  'A', 'D', 'C', 'A', 'C', 'B', 'D', 'A', 'B', 'B',
  'B', 'C', 'A', 'D', 'B', 'C', 'A', 'A', 'D', 'B'
];

const answerKey = {};

listening.forEach((answer, index) => {
  answerKey[index + 1] = answer;
});

readingRelative.forEach((answer, index) => {
  answerKey[index + 101] = answer;
});

module.exports = answerKey;
