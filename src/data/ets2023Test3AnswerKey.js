// Generated from public answer sources:
// - https://chuyendetienganh.com/bai-viet/dap-an-full-test-lcrc-ets-2023-moi-nhat
// - https://api.chuyendetienganh.com/upload/post_upload/images/dap-an-test-3-ets-2023.jpg
const listening = [
  'C', 'D', 'B', 'C', 'B', 'A', 'B', 'A', 'A', 'A',
  'C', 'C', 'A', 'B', 'B', 'C', 'C', 'C', 'B', 'C',
  'A', 'B', 'C', 'C', 'A', 'B', 'B', 'C', 'A', 'B',
  'C', 'B', 'C', 'D', 'A', 'B', 'C', 'B', 'C', 'A',
  'B', 'A', 'D', 'A', 'C', 'C', 'B', 'D', 'A', 'C',
  'A', 'D', 'A', 'B', 'D', 'B', 'C', 'B', 'B', 'C',
  'A', 'C', 'B', 'D', 'C', 'B', 'A', 'A', 'C', 'B',
  'C', 'B', 'B', 'A', 'C', 'D', 'C', 'A', 'D', 'C',
  'A', 'D', 'D', 'A', 'D', 'C', 'A', 'D', 'B', 'D',
  'B', 'B', 'A', 'C', 'C', 'A', 'D', 'A', 'C', 'D'
];

const readingRelative = [
  'A', 'A', 'D', 'B', 'A', 'D', 'C', 'C', 'A', 'D',
  'A', 'C', 'A', 'B', 'C', 'D', 'A', 'A', 'B', 'C',
  'D', 'D', 'A', 'C', 'B', 'B', 'D', 'C', 'D', 'D',
  'A', 'C', 'A', 'D', 'B', 'D', 'B', 'C', 'B', 'A',
  'C', 'A', 'A', 'A', 'D', 'C', 'B', 'D', 'B', 'A',
  'B', 'A', 'C', 'C', 'D', 'A', 'C', 'C', 'C', 'B',
  'D', 'D', 'C', 'D', 'C', 'A', 'C', 'B', 'D', 'A',
  'A', 'A', 'A', 'D', 'C', 'A', 'C', 'B', 'D', 'B',
  'B', 'C', 'D', 'C', 'A', 'C', 'D', 'D', 'B', 'A',
  'B', 'D', 'D', 'C', 'A', 'D', 'B', 'C', 'A', 'C'
];

const answerKey = {};

listening.forEach((answer, index) => {
  answerKey[index + 1] = answer;
});

readingRelative.forEach((answer, index) => {
  answerKey[index + 101] = answer;
});

module.exports = answerKey;
