// Generated from public answer sources:
// - https://chuyendetienganh.com/bai-viet/dap-an-full-test-lcrc-ets-2023-moi-nhat
// - https://api.chuyendetienganh.com/upload/post_upload/images/dap-an-test-9-ets-2023.jpg
const listening = [
  'D', 'B', 'C', 'C', 'C', 'D', 'A', 'C', 'B', 'C',
  'C', 'C', 'B', 'A', 'B', 'A', 'A', 'A', 'B', 'A',
  'B', 'C', 'A', 'A', 'B', 'C', 'A', 'A', 'C', 'A',
  'B', 'B', 'D', 'B', 'A', 'C', 'B', 'A', 'C', 'D',
  'D', 'C', 'D', 'B', 'A', 'D', 'B', 'A', 'D', 'D',
  'C', 'C', 'B', 'C', 'C', 'D', 'C', 'A', 'A', 'A',
  'D', 'B', 'C', 'A', 'B', 'C', 'A', 'B', 'C', 'C',
  'D', 'B', 'A', 'A', 'B', 'D', 'B', 'C', 'C', 'D',
  'B', 'A', 'C', 'B', 'D', 'D', 'C', 'A', 'A', 'C',
  'D', 'A', 'B', 'A', 'B', 'B', 'A', 'C', 'A', 'C'
];

const readingRelative = [
  'A', 'D', 'C', 'C', 'B', 'A', 'D', 'C', 'D', 'A',
  'D', 'B', 'D', 'D', 'C', 'A', 'C', 'B', 'A', 'C',
  'A', 'C', 'B', 'B', 'D', 'D', 'C', 'A', 'B', 'B',
  'D', 'C', 'D', 'A', 'C', 'B', 'B', 'A', 'C', 'D',
  'A', 'B', 'B', 'B', 'C', 'A', 'C', 'D', 'D', 'C',
  'B', 'C', 'A', 'D', 'B', 'C', 'D', 'C', 'A', 'D',
  'B', 'A', 'B', 'C', 'A', 'D', 'B', 'A', 'B', 'D',
  'B', 'A', 'A', 'D', 'D', 'C', 'C', 'A', 'D', 'B',
  'B', 'A', 'B', 'C', 'D', 'D', 'C', 'B', 'D', 'C',
  'C', 'B', 'C', 'A', 'B', 'A', 'C', 'D', 'B', 'B'
];

const answerKey = {};

listening.forEach((answer, index) => {
  answerKey[index + 1] = answer;
});

readingRelative.forEach((answer, index) => {
  answerKey[index + 101] = answer;
});

module.exports = answerKey;
