// Generated from public answer sources:
// - https://chuyendetienganh.com/bai-viet/dap-an-full-test-lcrc-ets-2023-moi-nhat
// - https://api.chuyendetienganh.com/upload/post_upload/images/dap-an-test-10-ets-2023.jpg
const listening = [
  'B', 'C', 'D', 'D', 'D', 'B', 'B', 'C', 'B', 'C',
  'A', 'A', 'C', 'C', 'A', 'C', 'B', 'A', 'A', 'C',
  'C', 'C', 'B', 'C', 'B', 'C', 'C', 'B', 'C', 'B',
  'C', 'B', 'C', 'D', 'A', 'C', 'B', 'A', 'D', 'D',
  'D', 'C', 'B', 'D', 'D', 'A', 'A', 'B', 'C', 'A',
  'D', 'B', 'D', 'B', 'D', 'C', 'C', 'B', 'D', 'A',
  'B', 'C', 'A', 'D', 'D', 'B', 'D', 'D', 'A', 'B',
  'D', 'C', 'A', 'A', 'C', 'A', 'B', 'D', 'C', 'D',
  'C', 'B', 'A', 'C', 'C', 'A', 'C', 'B', 'A', 'A',
  'B', 'A', 'C', 'A', 'D', 'C', 'C', 'B', 'B', 'A'
];

const readingRelative = [
  'B', 'B', 'C', 'A', 'B', 'D', 'C', 'C', 'A', 'D',
  'C', 'C', 'B', 'C', 'B', 'B', 'D', 'B', 'A', 'D',
  'A', 'C', 'A', 'B', 'C', 'D', 'B', 'C', 'A', 'B',
  'A', 'B', 'B', 'C', 'D', 'B', 'B', 'C', 'B', 'C',
  'B', 'C', 'D', 'A', 'C', 'A', 'C', 'A', 'A', 'B',
  'B', 'B', 'A', 'B', 'C', 'A', 'D', 'D', 'C', 'B',
  'C', 'D', 'B', 'C', 'D', 'C', 'D', 'A', 'D', 'C',
  'D', 'B', 'B', 'A', 'C', 'B', 'A', 'D', 'B', 'D',
  'D', 'A', 'B', 'C', 'D', 'C', 'D', 'A', 'C', 'D',
  'D', 'A', 'C', 'C', 'D', 'C', 'D', 'B', 'C', 'A'
];

const answerKey = {};

listening.forEach((answer, index) => {
  answerKey[index + 1] = answer;
});

readingRelative.forEach((answer, index) => {
  answerKey[index + 101] = answer;
});

module.exports = answerKey;
