// Generated from public answer sources:
// - https://chuyendetienganh.com/bai-viet/dap-an-full-test-lcrc-ets-2023-moi-nhat
// - https://api.chuyendetienganh.com/upload/post_upload/images/dap-an-test-8-ets-2023.jpg
const listening = [
  'A', 'D', 'D', 'C', 'B', 'B', 'C', 'C', 'B', 'A',
  'B', 'C', 'C', 'A', 'A', 'A', 'C', 'B', 'B', 'B',
  'A', 'A', 'C', 'C', 'B', 'A', 'C', 'B', 'C', 'D',
  'C', 'D', 'B', 'C', 'D', 'A', 'B', 'D', 'B', 'C',
  'B', 'C', 'A', 'A', 'D', 'C', 'B', 'A', 'C', 'B',
  'A', 'C', 'A', 'D', 'C', 'D', 'C', 'C', 'B', 'A',
  'D', 'C', 'A', 'B', 'B', 'D', 'A', 'C', 'A', 'D',
  'B', 'A', 'B', 'D', 'A', 'C', 'A', 'D', 'B', 'A',
  'D', 'D', 'B', 'C', 'B', 'A', 'A', 'B', 'D', 'C',
  'A', 'D', 'C', 'C', 'C', 'B', 'B', 'D', 'C', 'A'
];

const readingRelative = [
  'D', 'B', 'C', 'B', 'A', 'D', 'C', 'B', 'A', 'C',
  'B', 'C', 'B', 'A', 'C', 'C', 'D', 'B', 'B', 'D',
  'A', 'C', 'A', 'A', 'C', 'C', 'A', 'B', 'C', 'A',
  'D', 'B', 'C', 'B', 'B', 'A', 'D', 'C', 'D', 'A',
  'B', 'A', 'A', 'B', 'D', 'D', 'D', 'C', 'B', 'A',
  'B', 'A', 'A', 'D', 'D', 'B', 'D', 'C', 'D', 'C',
  'D', 'C', 'A', 'A', 'C', 'A', 'B', 'B', 'C', 'D',
  'A', 'A', 'C', 'D', 'B', 'B', 'A', 'B', 'A', 'D',
  'D', 'C', 'D', 'C', 'A', 'B', 'A', 'D', 'C', 'C',
  'D', 'A', 'C', 'B', 'B', 'C', 'B', 'B', 'A', 'D'
];

const answerKey = {};

listening.forEach((answer, index) => {
  answerKey[index + 1] = answer;
});

readingRelative.forEach((answer, index) => {
  answerKey[index + 101] = answer;
});

module.exports = answerKey;
