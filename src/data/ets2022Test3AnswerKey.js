// Generated from public answer sources:
// - https://chuyendetienganh.com/bai-viet/dap-an-full-test-lcrc-ets-2022-moi-nhat
// - https://api.chuyendetienganh.com/upload/post_upload/images/c1b7c2fb5f92dd5e15f4ba808ec15392_dap-an-test-3-ets-2022.png
const listening = [
  'A', 'A', 'C', 'D', 'B', 'D', 'B', 'A', 'C', 'A',
  'A', 'C', 'A', 'B', 'A', 'A', 'A', 'C', 'C', 'A',
  'C', 'C', 'B', 'C', 'C', 'A', 'B', 'C', 'A', 'D',
  'B', 'A', 'D', 'A', 'B', 'A', 'C', 'C', 'D', 'C',
  'C', 'D', 'B', 'C', 'B', 'A', 'D', 'C', 'C', 'B',
  'C', 'D', 'C', 'C', 'A', 'C', 'B', 'C', 'A', 'C',
  'D', 'D', 'B', 'C', 'A', 'B', 'D', 'B', 'B', 'C',
  'B', 'A', 'D', 'A', 'D', 'C', 'C', 'B', 'D', 'C',
  'B', 'A', 'B', 'D', 'A', 'B', 'A', 'C', 'C', 'D',
  'A', 'D', 'C', 'B', 'C', 'A', 'B', 'B', 'A', 'B'
];

const readingRelative = [
  'C', 'A', 'B', 'D', 'B', 'A', 'A', 'B', 'D', 'D',
  'A', 'D', 'C', 'D', 'B', 'B', 'A', 'C', 'A', 'D',
  'C', 'C', 'D', 'B', 'A', 'B', 'C', 'B', 'D', 'C',
  'C', 'A', 'A', 'D', 'D', 'A', 'D', 'C', 'D', 'C',
  'D', 'A', 'D', 'A', 'D', 'B', 'C', 'B', 'B', 'C',
  'C', 'A', 'B', 'A', 'B', 'A', 'D', 'B', 'C', 'A',
  'C', 'D', 'A', 'B', 'C', 'B', 'A', 'B', 'A', 'C',
  'D', 'A', 'D', 'C', 'A', 'A', 'C', 'B', 'D', 'B',
  'D', 'B', 'A', 'A', 'B', 'A', 'C', 'C', 'D', 'B',
  'B', 'D', 'A', 'C', 'C', 'D', 'B', 'A', 'C', 'C'
];

const answerKey = {};

listening.forEach((answer, index) => {
  answerKey[index + 1] = answer;
});

readingRelative.forEach((answer, index) => {
  answerKey[index + 101] = answer;
});

module.exports = answerKey;
