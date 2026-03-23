// Generated from public answer sources:
// - https://chuyendetienganh.com/bai-viet/dap-an-full-test-lcrc-ets-2021-moi-nhat
// - https://api.chuyendetienganh.com/upload/post_upload/images/image(5).png
// - https://api.chuyendetienganh.com/upload/post_upload/images/image(10).png
const listening = [
  'A', 'B', 'D', 'C', 'B', 'A', 'B', 'C', 'A', 'B',
  'B', 'C', 'A', 'A', 'C', 'A', 'C', 'C', 'B', 'A',
  'A', 'A', 'B', 'A', 'B', 'B', 'C', 'C', 'B', 'A',
  'A', 'C', 'B', 'B', 'A', 'B', 'D', 'C', 'B', 'C',
  'A', 'C', 'B', 'C', 'B', 'D', 'B', 'A', 'D', 'B',
  'A', 'D', 'A', 'D', 'C', 'A', 'C', 'A', 'A', 'C',
  'A', 'D', 'B', 'D', 'B', 'B', 'C', 'B', 'C', 'B',
  'A', 'B', 'D', 'C', 'D', 'B', 'B', 'A', 'C', 'B',
  'D', 'C', 'C', 'A', 'B', 'B', 'C', 'A', 'D', 'A',
  'B', 'B', 'A', 'D', 'B', 'B', 'D', 'C', 'A', 'D'
];

const readingRelative = [
  'D', 'B', 'B', 'D', 'C', 'A', 'D', 'B', 'A', 'B',
  'C', 'C', 'D', 'D', 'C', 'A', 'C', 'D', 'B', 'D',
  'B', 'A', 'A', 'B', 'C', 'A', 'C', 'C', 'D', 'B',
  'B', 'A', 'C', 'D', 'A', 'A', 'B', 'B', 'D', 'A',
  'C', 'C', 'A', 'D', 'A', 'B', 'C', 'A', 'D', 'C',
  'D', 'A', 'C', 'A', 'A', 'C', 'B', 'C', 'C', 'A',
  'A', 'D', 'B', 'B', 'D', 'B', 'C', 'C', 'B', 'D',
  'A', 'C', 'B', 'D', 'A', 'C', 'A', 'D', 'C', 'B',
  'A', 'C', 'C', 'A', 'D', 'D', 'B', 'C', 'C', 'A',
  'A', 'B', 'D', 'A', 'B', 'B', 'D', 'B', 'A', 'A'
];

const answerKey = {};

listening.forEach((answer, index) => {
  answerKey[index + 1] = answer;
});

readingRelative.forEach((answer, index) => {
  answerKey[index + 101] = answer;
});

module.exports = answerKey;
