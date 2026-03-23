// Generated from public answer sources:
// - https://chuyendetienganh.com/bai-viet/dap-an-full-test-lcrc-ets-2021-moi-nhat
// - https://api.chuyendetienganh.com/upload/post_upload/images/image(2).png
// - https://api.chuyendetienganh.com/upload/post_upload/images/image(7).png
const listening = [
  'B', 'B', 'D', 'C', 'D', 'A', 'A', 'C', 'A', 'C',
  'B', 'B', 'B', 'C', 'A', 'B', 'A', 'C', 'A', 'B',
  'B', 'C', 'B', 'A', 'C', 'B', 'A', 'B', 'A', 'B',
  'B', 'B', 'A', 'B', 'A', 'B', 'D', 'D', 'B', 'C',
  'C', 'D', 'C', 'A', 'D', 'A', 'A', 'C', 'A', 'C',
  'A', 'D', 'B', 'C', 'D', 'D', 'A', 'C', 'B', 'C',
  'D', 'B', 'C', 'A', 'B', 'B', 'D', 'B', 'D', 'A',
  'B', 'D', 'A', 'B', 'C', 'A', 'B', 'A', 'A', 'D',
  'A', 'C', 'A', 'A', 'C', 'C', 'A', 'D', 'B', 'D',
  'C', 'A', 'A', 'B', 'B', 'B', 'D', 'A', 'C', 'B'
];

const readingRelative = [
  'D', 'B', 'C', 'A', 'D', 'A', 'C', 'C', 'A', 'C',
  'A', 'C', 'D', 'B', 'B', 'B', 'C', 'D', 'D', 'A',
  'D', 'C', 'B', 'A', 'A', 'C', 'A', 'B', 'D', 'C',
  'A', 'D', 'B', 'B', 'D', 'C', 'A', 'C', 'C', 'B',
  'A', 'B', 'D', 'C', 'D', 'A', 'A', 'D', 'C', 'C',
  'B', 'A', 'B', 'D', 'C', 'B', 'D', 'A', 'B', 'C',
  'D', 'B', 'A', 'D', 'C', 'A', 'A', 'A', 'D', 'B',
  'B', 'B', 'A', 'B', 'D', 'A', 'B', 'D', 'C', 'B',
  'B', 'C', 'B', 'A', 'C', 'B', 'A', 'C', 'D', 'B',
  'D', 'C', 'A', 'B', 'D', 'C', 'B', 'A', 'D', 'D'
];

const answerKey = {};

listening.forEach((answer, index) => {
  answerKey[index + 1] = answer;
});

readingRelative.forEach((answer, index) => {
  answerKey[index + 101] = answer;
});

module.exports = answerKey;
