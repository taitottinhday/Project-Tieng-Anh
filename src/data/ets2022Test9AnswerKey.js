// Generated from public answer sources:
// - https://chuyendetienganh.com/bai-viet/dap-an-full-test-lcrc-ets-2022-moi-nhat
// - https://api.chuyendetienganh.com/upload/post_upload/images/54403d59b31c383df1d64c10e8d289b7_dap-an-test-9-ets-2022.png
const listening = [
  'C', 'D', 'B', 'A', 'D', 'B', 'C', 'C', 'C', 'A',
  'C', 'B', 'B', 'A', 'A', 'B', 'A', 'C', 'A', 'C',
  'C', 'A', 'B', 'B', 'A', 'C', 'B', 'C', 'B', 'B',
  'A', 'D', 'C', 'B', 'A', 'C', 'A', 'C', 'B', 'C',
  'B', 'D', 'C', 'B', 'D', 'C', 'C', 'C', 'A', 'D',
  'C', 'D', 'B', 'A', 'D', 'A', 'B', 'A', 'B', 'A',
  'C', 'B', 'B', 'D', 'D', 'D', 'A', 'C', 'A', 'D',
  'D', 'A', 'D', 'C', 'D', 'A', 'C', 'B', 'D', 'B',
  'A', 'D', 'A', 'C', 'D', 'A', 'C', 'C', 'B', 'C',
  'D', 'C', 'B', 'D', 'B', 'C', 'A', 'B', 'D', 'A'
];

const readingRelative = [
  'B', 'B', 'D', 'C', 'A', 'A', 'B', 'C', 'B', 'C',
  'A', 'B', 'C', 'A', 'C', 'A', 'D', 'D', 'D', 'A',
  'B', 'B', 'D', 'D', 'C', 'D', 'B', 'C', 'B', 'D',
  'B', 'C', 'A', 'D', 'A', 'D', 'D', 'B', 'B', 'D',
  'A', 'A', 'A', 'B', 'C', 'A', 'C', 'A', 'A', 'B',
  'D', 'C', 'B', 'C', 'C', 'A', 'D', 'B', 'A', 'D',
  'B', 'B', 'C', 'D', 'A', 'C', 'B', 'B', 'A', 'C',
  'A', 'C', 'D', 'A', 'C', 'A', 'B', 'D', 'C', 'B',
  'C', 'C', 'D', 'A', 'C', 'D', 'C', 'D', 'B', 'B',
  'D', 'A', 'B', 'A', 'C', 'D', 'C', 'D', 'A', 'B'
];

const answerKey = {};

listening.forEach((answer, index) => {
  answerKey[index + 1] = answer;
});

readingRelative.forEach((answer, index) => {
  answerKey[index + 101] = answer;
});

module.exports = answerKey;
