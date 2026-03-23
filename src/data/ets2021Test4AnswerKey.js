// Generated from public answer sources:
// - https://chuyendetienganh.com/bai-viet/dap-an-full-test-lcrc-ets-2021-moi-nhat
// - https://api.chuyendetienganh.com/upload/post_upload/images/image(4).png
// - https://api.chuyendetienganh.com/upload/post_upload/images/image(9).png
const listening = [
  'B', 'A', 'D', 'C', 'D', 'D', 'C', 'C', 'A', 'B',
  'B', 'C', 'B', 'B', 'B', 'C', 'C', 'B', 'A', 'C',
  'B', 'B', 'A', 'B', 'C', 'B', 'B', 'A', 'C', 'A',
  'A', 'B', 'A', 'C', 'D', 'A', 'B', 'B', 'B', 'A',
  'A', 'A', 'D', 'C', 'D', 'A', 'B', 'C', 'A', 'D',
  'C', 'B', 'C', 'A', 'C', 'A', 'B', 'B', 'B', 'C',
  'D', 'B', 'A', 'C', 'C', 'B', 'D', 'A', 'D', 'C',
  'A', 'D', 'C', 'D', 'A', 'B', 'C', 'D', 'A', 'B',
  'C', 'A', 'D', 'C', 'B', 'C', 'A', 'D', 'D', 'B',
  'C', 'A', 'B', 'D', 'B', 'B', 'D', 'B', 'C', 'B'
];

const readingRelative = [
  'A', 'D', 'A', 'C', 'B', 'D', 'C', 'D', 'C', 'B',
  'B', 'B', 'A', 'B', 'C', 'A', 'B', 'D', 'C', 'D',
  'A', 'D', 'C', 'D', 'A', 'D', 'C', 'D', 'C', 'D',
  'A', 'C', 'D', 'B', 'A', 'B', 'C', 'B', 'D', 'A',
  'C', 'A', 'A', 'C', 'B', 'A', 'D', 'B', 'D', 'C',
  'C', 'A', 'B', 'A', 'B', 'A', 'D', 'A', 'B', 'D',
  'B', 'A', 'B', 'C', 'C', 'A', 'A', 'D', 'A', 'B',
  'C', 'D', 'A', 'D', 'B', 'A', 'D', 'C', 'B', 'C',
  'B', 'C', 'B', 'B', 'A', 'B', 'A', 'C', 'C', 'D',
  'C', 'D', 'A', 'A', 'B', 'D', 'C', 'A', 'B', 'B'
];

const answerKey = {};

listening.forEach((answer, index) => {
  answerKey[index + 1] = answer;
});

readingRelative.forEach((answer, index) => {
  answerKey[index + 101] = answer;
});

module.exports = answerKey;
