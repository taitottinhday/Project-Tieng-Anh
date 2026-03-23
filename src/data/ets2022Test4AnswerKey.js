// Generated from public answer sources:
// - https://chuyendetienganh.com/bai-viet/dap-an-full-test-lcrc-ets-2022-moi-nhat
// - https://api.chuyendetienganh.com/upload/post_upload/images/d075f38afa4ee45b5171cfe85561778d_dap-an-test-4-ets-2022.png
const listening = [
  'A', 'D', 'C', 'B', 'C', 'C', 'B', 'B', 'A', 'C',
  'C', 'B', 'C', 'C', 'B', 'A', 'C', 'A', 'A', 'C',
  'C', 'A', 'A', 'C', 'C', 'A', 'C', 'B', 'C', 'C',
  'A', 'B', 'A', 'D', 'D', 'B', 'B', 'C', 'A', 'D',
  'D', 'A', 'A', 'A', 'B', 'B', 'D', 'B', 'A', 'C',
  'B', 'A', 'C', 'A', 'B', 'D', 'B', 'A', 'D', 'C',
  'D', 'B', 'B', 'C', 'B', 'C', 'B', 'B', 'C', 'A',
  'A', 'C', 'B', 'C', 'D', 'A', 'B', 'C', 'D', 'C',
  'B', 'A', 'D', 'C', 'A', 'D', 'C', 'B', 'B', 'D',
  'D', 'A', 'D', 'B', 'C', 'D', 'B', 'D', 'B', 'C'
];

const readingRelative = [
  'A', 'D', 'D', 'B', 'A', 'D', 'C', 'B', 'B', 'B',
  'D', 'C', 'C', 'A', 'D', 'A', 'A', 'C', 'B', 'A',
  'C', 'A', 'D', 'D', 'B', 'D', 'B', 'C', 'B', 'A',
  'D', 'A', 'B', 'C', 'B', 'A', 'D', 'B', 'D', 'B',
  'A', 'D', 'D', 'C', 'B', 'D', 'A', 'C', 'B', 'A',
  'D', 'C', 'C', 'D', 'C', 'D', 'C', 'C', 'B', 'B',
  'A', 'C', 'B', 'C', 'A', 'A', 'C', 'B', 'A', 'D',
  'B', 'C', 'D', 'A', 'A', 'A', 'B', 'A', 'D', 'B',
  'C', 'B', 'D', 'B', 'A', 'C', 'D', 'C', 'A', 'D',
  'A', 'B', 'D', 'B', 'C', 'A', 'D', 'B', 'C', 'B'
];

const answerKey = {};

listening.forEach((answer, index) => {
  answerKey[index + 1] = answer;
});

readingRelative.forEach((answer, index) => {
  answerKey[index + 101] = answer;
});

module.exports = answerKey;
