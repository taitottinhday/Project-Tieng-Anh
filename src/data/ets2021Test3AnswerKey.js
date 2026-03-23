// Generated from public answer sources:
// - https://chuyendetienganh.com/bai-viet/dap-an-full-test-lcrc-ets-2021-moi-nhat
// - https://api.chuyendetienganh.com/upload/post_upload/images/image(3).png
// - https://api.chuyendetienganh.com/upload/post_upload/images/image(8).png
const listening = [
  'D', 'D', 'D', 'C', 'A', 'B', 'C', 'A', 'B', 'C',
  'A', 'A', 'B', 'A', 'A', 'B', 'A', 'C', 'B', 'B',
  'C', 'C', 'A', 'A', 'A', 'C', 'A', 'C', 'C', 'A',
  'A', 'B', 'B', 'A', 'B', 'D', 'C', 'B', 'D', 'C',
  'A', 'C', 'A', 'B', 'A', 'C', 'C', 'B', 'A', 'C',
  'A', 'B', 'B', 'C', 'D', 'A', 'C', 'C', 'C', 'A',
  'D', 'B', 'C', 'A', 'B', 'C', 'B', 'C', 'D', 'A',
  'B', 'D', 'B', 'B', 'C', 'D', 'C', 'D', 'A', 'D',
  'A', 'B', 'B', 'A', 'B', 'A', 'B', 'C', 'A', 'C',
  'D', 'C', 'B', 'A', 'B', 'D', 'B', 'C', 'B', 'C'
];

const readingRelative = [
  'C', 'C', 'D', 'B', 'B', 'A', 'B', 'A', 'D', 'C',
  'A', 'D', 'A', 'C', 'B', 'D', 'D', 'B', 'C', 'B',
  'A', 'A', 'C', 'D', 'C', 'A', 'D', 'C', 'A', 'B',
  'B', 'D', 'B', 'C', 'D', 'C', 'A', 'C', 'B', 'A',
  'A', 'C', 'D', 'B', 'D', 'B', 'D', 'A', 'A', 'C',
  'B', 'D', 'A', 'D', 'C', 'B', 'D', 'C', 'C', 'D',
  'B', 'A', 'D', 'A', 'B', 'B', 'C', 'B', 'C', 'C',
  'A', 'D', 'A', 'B', 'C', 'D', 'B', 'A', 'C', 'D',
  'A', 'D', 'B', 'C', 'D', 'A', 'D', 'B', 'B', 'D',
  'B', 'B', 'B', 'D', 'A', 'C', 'A', 'C', 'B', 'D'
];

const answerKey = {};

listening.forEach((answer, index) => {
  answerKey[index + 1] = answer;
});

readingRelative.forEach((answer, index) => {
  answerKey[index + 101] = answer;
});

module.exports = answerKey;
