// Generated from public answer sources:
// - https://chuyendetienganh.com/bai-viet/dap-an-full-test-lcrc-ets-2022-moi-nhat
// - https://api.chuyendetienganh.com/upload/post_upload/images/1e71c5ad8d50dbaacac2a835b6e06fe5_dap-an-test-8-ets-2022.png
const listening = [
  'D', 'A', 'B', 'C', 'B', 'D', 'C', 'C', 'B', 'D',
  'B', 'C', 'C', 'A', 'A', 'C', 'A', 'B', 'A', 'A',
  'B', 'B', 'C', 'C', 'A', 'A', 'C', 'A', 'B', 'C',
  'B', 'A', 'B', 'D', 'D', 'A', 'C', 'C', 'B', 'D',
  'A', 'B', 'A', 'A', 'C', 'B', 'A', 'A', 'D', 'D',
  'C', 'D', 'B', 'A', 'C', 'A', 'C', 'D', 'B', 'B',
  'C', 'B', 'B', 'D', 'A', 'D', 'B', 'B', 'B', 'D',
  'A', 'D', 'B', 'A', 'D', 'A', 'C', 'D', 'A', 'D',
  'B', 'B', 'C', 'A', 'C', 'D', 'A', 'B', 'D', 'D',
  'C', 'D', 'B', 'D', 'A', 'B', 'C', 'A', 'A', 'D'
];

const readingRelative = [
  'B', 'C', 'C', 'D', 'B', 'B', 'A', 'A', 'B', 'A',
  'D', 'C', 'B', 'D', 'B', 'C', 'A', 'B', 'B', 'C',
  'B', 'D', 'A', 'D', 'D', 'C', 'A', 'A', 'D', 'C',
  'A', 'B', 'D', 'D', 'D', 'C', 'A', 'B', 'C', 'C',
  'A', 'B', 'B', 'A', 'C', 'B', 'C', 'A', 'A', 'C',
  'D', 'B', 'C', 'A', 'D', 'C', 'A', 'D', 'C', 'B',
  'B', 'A', 'A', 'D', 'C', 'D', 'A', 'B', 'B', 'A',
  'D', 'C', 'D', 'A', 'B', 'B', 'A', 'C', 'D', 'B',
  'D', 'B', 'C', 'A', 'D', 'A', 'B', 'D', 'B', 'C',
  'D', 'D', 'C', 'A', 'D', 'C', 'D', 'B', 'A', 'C'
];

const answerKey = {};

listening.forEach((answer, index) => {
  answerKey[index + 1] = answer;
});

readingRelative.forEach((answer, index) => {
  answerKey[index + 101] = answer;
});

module.exports = answerKey;
