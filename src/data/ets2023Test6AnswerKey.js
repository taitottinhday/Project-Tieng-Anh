// Generated from public answer sources:
// - https://chuyendetienganh.com/bai-viet/dap-an-full-test-lcrc-ets-2023-moi-nhat
// - https://api.chuyendetienganh.com/upload/post_upload/images/dap-an-test-6-ets-2023.jpg
const listening = [
  'A', 'C', 'A', 'D', 'B', 'A', 'B', 'B', 'B', 'C',
  'C', 'A', 'B', 'C', 'B', 'A', 'A', 'B', 'C', 'A',
  'C', 'C', 'A', 'A', 'B', 'A', 'B', 'B', 'A', 'B',
  'C', 'A', 'B', 'A', 'A', 'B', 'D', 'A', 'D', 'C',
  'C', 'D', 'B', 'A', 'D', 'B', 'C', 'A', 'A', 'A',
  'B', 'C', 'D', 'C', 'A', 'B', 'A', 'C', 'D', 'C',
  'B', 'B', 'D', 'C', 'C', 'B', 'A', 'C', 'C', 'B',
  'D', 'B', 'C', 'A', 'C', 'D', 'C', 'B', 'A', 'C',
  'D', 'D', 'D', 'B', 'A', 'B', 'A', 'D', 'C', 'A',
  'C', 'D', 'B', 'A', 'A', 'D', 'D', 'B', 'A', 'B'
];

const readingRelative = [
  'A', 'C', 'B', 'B', 'C', 'D', 'A', 'B', 'B', 'B',
  'A', 'D', 'C', 'C', 'A', 'C', 'C', 'B', 'A', 'D',
  'D', 'C', 'A', 'D', 'C', 'A', 'D', 'A', 'C', 'D',
  'D', 'D', 'C', 'B', 'C', 'B', 'A', 'D', 'A', 'A',
  'C', 'A', 'B', 'D', 'A', 'D', 'D', 'B', 'B', 'C',
  'B', 'D', 'D', 'B', 'B', 'A', 'C', 'A', 'D', 'B',
  'B', 'A', 'B', 'D', 'D', 'C', 'A', 'A', 'B', 'A',
  'D', 'A', 'D', 'B', 'D', 'D', 'C', 'B', 'D', 'A',
  'C', 'C', 'B', 'D', 'A', 'B', 'D', 'C', 'A', 'D',
  'C', 'D', 'A', 'C', 'D', 'B', 'C', 'A', 'D', 'B'
];

const answerKey = {};

listening.forEach((answer, index) => {
  answerKey[index + 1] = answer;
});

readingRelative.forEach((answer, index) => {
  answerKey[index + 101] = answer;
});

module.exports = answerKey;
