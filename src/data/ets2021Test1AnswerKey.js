// Generated from public answer sources:
// - https://chuyendetienganh.com/bai-viet/dap-an-full-test-lcrc-ets-2021-moi-nhat
// - https://api.chuyendetienganh.com/upload/post_upload/images/image(1).png
// - https://api.chuyendetienganh.com/upload/post_upload/images/image(6).png
const listening = [
  'C', 'A', 'D', 'B', 'C', 'C', 'A', 'A', 'A', 'D',
  'A', 'A', 'C', 'B', 'B', 'A', 'C', 'C', 'B', 'B',
  'A', 'B', 'C', 'A', 'B', 'A', 'C', 'A', 'C', 'B',
  'A', 'A', 'C', 'D', 'C', 'A', 'C', 'B', 'B', 'D',
  'D', 'B', 'A', 'B', 'D', 'A', 'B', 'D', 'A', 'A',
  'D', 'C', 'D', 'C', 'B', 'A', 'B', 'D', 'D', 'D',
  'A', 'C', 'D', 'A', 'C', 'B', 'D', 'A', 'B', 'D',
  'A', 'C', 'B', 'D', 'B', 'A', 'B', 'C', 'C', 'D',
  'B', 'C', 'C', 'D', 'A', 'C', 'B', 'D', 'B', 'C',
  'A', 'A', 'C', 'D', 'D', 'A', 'C', 'D', 'A', 'B'
];

const readingRelative = [
  'B', 'B', 'C', 'A', 'A', 'D', 'A', 'C', 'D', 'C',
  'C', 'A', 'D', 'A', 'A', 'D', 'A', 'C', 'B', 'C',
  'A', 'B', 'C', 'D', 'B', 'D', 'A', 'B', 'D', 'A',
  'A', 'C', 'D', 'A', 'A', 'B', 'C', 'D', 'C', 'D',
  'B', 'A', 'A', 'B', 'C', 'D', 'D', 'D', 'C', 'A',
  'C', 'A', 'D', 'A', 'D', 'C', 'C', 'B', 'B', 'C',
  'C', 'D', 'A', 'D', 'A', 'C', 'D', 'B', 'A', 'A',
  'C', 'A', 'B', 'B', 'C', 'B', 'C', 'A', 'C', 'D',
  'B', 'D', 'A', 'B', 'B', 'B', 'D', 'A', 'C', 'C',
  'A', 'B', 'B', 'C', 'A', 'A', 'C', 'B', 'A', 'D'
];

const answerKey = {};

listening.forEach((answer, index) => {
  answerKey[index + 1] = answer;
});

readingRelative.forEach((answer, index) => {
  answerKey[index + 101] = answer;
});

module.exports = answerKey;
