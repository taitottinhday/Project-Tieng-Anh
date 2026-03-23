// Generated from public answer sources:
// - https://chuyendetienganh.com/bai-viet/dap-an-full-test-lcrc-ets-2023-moi-nhat
// - https://api.chuyendetienganh.com/upload/post_upload/images/dap-an-test-5-ets-2023.jpg
const listening = [
  'A', 'C', 'A', 'D', 'B', 'B', 'B', 'C', 'A', 'C',
  'A', 'C', 'A', 'B', 'B', 'C', 'C', 'B', 'C', 'B',
  'B', 'A', 'C', 'B', 'B', 'A', 'B', 'C', 'A', 'C',
  'C', 'A', 'D', 'A', 'A', 'B', 'B', 'B', 'C', 'A',
  'B', 'A', 'A', 'B', 'A', 'C', 'A', 'A', 'C', 'A',
  'B', 'C', 'B', 'B', 'D', 'D', 'B', 'B', 'C', 'D',
  'D', 'A', 'C', 'B', 'C', 'B', 'D', 'A', 'C', 'D',
  'C', 'A', 'D', 'C', 'D', 'B', 'B', 'B', 'C', 'D',
  'C', 'D', 'D', 'B', 'A', 'D', 'B', 'B', 'A', 'C',
  'D', 'C', 'C', 'A', 'A', 'C', 'C', 'A', 'C', 'B'
];

const readingRelative = [
  'A', 'A', 'C', 'C', 'A', 'A', 'B', 'A', 'A', 'A',
  'C', 'D', 'C', 'D', 'A', 'C', 'C', 'D', 'B', 'D',
  'C', 'B', 'A', 'D', 'B', 'C', 'D', 'B', 'B', 'D',
  'B', 'A', 'D', 'D', 'A', 'D', 'C', 'B', 'C', 'B',
  'A', 'D', 'D', 'A', 'B', 'D', 'D', 'C', 'C', 'B',
  'B', 'B', 'D', 'B', 'C', 'C', 'B', 'D', 'A', 'C',
  'D', 'D', 'B', 'C', 'B', 'B', 'D', 'B', 'B', 'C',
  'B', 'B', 'A', 'C', 'D', 'C', 'D', 'A', 'C', 'B',
  'D', 'B', 'A', 'D', 'C', 'C', 'B', 'C', 'A', 'C',
  'C', 'A', 'D', 'B', 'D', 'B', 'D', 'D', 'A', 'C'
];

const answerKey = {};

listening.forEach((answer, index) => {
  answerKey[index + 1] = answer;
});

readingRelative.forEach((answer, index) => {
  answerKey[index + 101] = answer;
});

module.exports = answerKey;
