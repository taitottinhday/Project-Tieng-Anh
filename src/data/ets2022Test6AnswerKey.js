// Generated from public answer sources:
// - https://chuyendetienganh.com/bai-viet/dap-an-full-test-lcrc-ets-2022-moi-nhat
// - https://api.chuyendetienganh.com/upload/post_upload/images/7f23c93841e4be2f0a1909515a626a9b_dap-an-test-6-ets-2022.png
const listening = [
  'B', 'A', 'C', 'D', 'C', 'A', 'A', 'C', 'C', 'C',
  'A', 'B', 'A', 'C', 'B', 'B', 'A', 'C', 'B', 'B',
  'C', 'B', 'B', 'C', 'B', 'B', 'C', 'A', 'C', 'A',
  'B', 'B', 'C', 'A', 'C', 'D', 'A', 'D', 'B', 'D',
  'B', 'C', 'D', 'A', 'C', 'D', 'D', 'A', 'C', 'C',
  'B', 'D', 'C', 'A', 'B', 'B', 'D', 'B', 'A', 'A',
  'B', 'D', 'C', 'C', 'D', 'C', 'B', 'C', 'A', 'D',
  'C', 'B', 'D', 'A', 'C', 'B', 'C', 'D', 'A', 'C',
  'C', 'A', 'A', 'D', 'C', 'B', 'C', 'C', 'B', 'D',
  'C', 'B', 'A', 'D', 'A', 'C', 'D', 'B', 'A', 'C'
];

const readingRelative = [
  'A', 'D', 'D', 'B', 'A', 'C', 'D', 'A', 'A', 'B',
  'B', 'A', 'D', 'C', 'C', 'D', 'A', 'B', 'B', 'C',
  'C', 'B', 'A', 'C', 'D', 'C', 'A', 'C', 'D', 'B',
  'C', 'A', 'D', 'B', 'D', 'B', 'A', 'C', 'C', 'B',
  'C', 'A', 'B', 'A', 'C', 'D', 'C', 'A', 'C', 'B',
  'B', 'D', 'B', 'A', 'C', 'A', 'C', 'B', 'D', 'A',
  'C', 'D', 'A', 'C', 'D', 'C', 'B', 'D', 'C', 'A',
  'B', 'D', 'A', 'B', 'D', 'C', 'D', 'B', 'D', 'A',
  'B', 'A', 'A', 'D', 'C', 'A', 'B', 'D', 'D', 'B',
  'A', 'D', 'B', 'B', 'C', 'D', 'B', 'C', 'A', 'C'
];

const answerKey = {};

listening.forEach((answer, index) => {
  answerKey[index + 1] = answer;
});

readingRelative.forEach((answer, index) => {
  answerKey[index + 101] = answer;
});

module.exports = answerKey;
