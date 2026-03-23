// Generated from public answer sources:
// - https://chuyendetienganh.com/bai-viet/dap-an-full-test-lcrc-ets-2022-moi-nhat
// - https://api.chuyendetienganh.com/upload/post_upload/images/5f6e213993768087f1b5781bdea171f1_dap-an-test-2-ets-2022.png
const listening = [
  'B', 'D', 'C', 'C', 'B', 'A', 'A', 'C', 'B', 'A',
  'C', 'B', 'A', 'C', 'B', 'A', 'B', 'A', 'B', 'B',
  'A', 'C', 'C', 'B', 'C', 'A', 'A', 'B', 'B', 'B',
  'A', 'D', 'B', 'C', 'D', 'A', 'C', 'B', 'C', 'A',
  'D', 'A', 'C', 'C', 'D', 'C', 'B', 'D', 'A', 'B',
  'C', 'A', 'A', 'C', 'B', 'A', 'B', 'C', 'D', 'D',
  'B', 'A', 'C', 'B', 'D', 'C', 'A', 'D', 'B', 'A',
  'B', 'A', 'C', 'D', 'C', 'A', 'A', 'D', 'C', 'B',
  'D', 'A', 'C', 'B', 'D', 'D', 'A', 'C', 'C', 'D',
  'B', 'D', 'B', 'D', 'A', 'D', 'C', 'B', 'D', 'B'
];

const readingRelative = [
  'A', 'C', 'A', 'D', 'A', 'D', 'A', 'B', 'B', 'A',
  'C', 'B', 'D', 'C', 'B', 'D', 'A', 'B', 'C', 'D',
  'A', 'C', 'B', 'A', 'C', 'B', 'B', 'A', 'D', 'C',
  'C', 'D', 'A', 'B', 'D', 'D', 'B', 'A', 'B', 'A',
  'B', 'D', 'C', 'C', 'A', 'B', 'B', 'D', 'B', 'C',
  'D', 'D', 'D', 'B', 'A', 'B', 'A', 'B', 'B', 'C',
  'A', 'C', 'B', 'B', 'D', 'D', 'A', 'D', 'C', 'A',
  'C', 'A', 'C', 'C', 'D', 'B', 'D', 'B', 'C', 'A',
  'D', 'D', 'B', 'C', 'A', 'A', 'D', 'B', 'B', 'A',
  'D', 'A', 'B', 'D', 'C', 'B', 'A', 'C', 'C', 'D'
];

const answerKey = {};

listening.forEach((answer, index) => {
  answerKey[index + 1] = answer;
});

readingRelative.forEach((answer, index) => {
  answerKey[index + 101] = answer;
});

module.exports = answerKey;
