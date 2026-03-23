// Generated from public answer sources:
// - https://chuyendetienganh.com/bai-viet/dap-an-full-test-lcrc-ets-2020-moi-nhat
// - https://api.chuyendetienganh.com/upload/post_upload/images/07-2020/test-7.jpg
// - https://api.chuyendetienganh.com/upload/post_upload/images/97998970_2642911482614213_7428367515794800640_n.jpg
const listening = [
  'A', 'C', 'C', 'B', 'D', 'A', 'C', 'A', 'C', 'B',
  'C', 'B', 'C', 'C', 'A', 'B', 'B', 'C', 'C', 'B',
  'C', 'C', 'A', 'C', 'A', 'B', 'A', 'B', 'A', 'B',
  'A', 'B', 'A', 'C', 'B', 'A', 'A', 'C', 'D', 'B',
  'B', 'A', 'A', 'C', 'A', 'D', 'C', 'D', 'B', 'C',
  'A', 'C', 'B', 'A', 'C', 'A', 'B', 'D', 'B', 'D',
  'A', 'B', 'D', 'A', 'D', 'C', 'A', 'A', 'B', 'B',
  'D', 'A', 'C', 'B', 'B', 'D', 'A', 'B', 'C', 'B',
  'A', 'B', 'C', 'B', 'A', 'C', 'D', 'A', 'A', 'A',
  'B', 'C', 'A', 'D', 'B', 'A', 'C', 'C', 'D', 'D'
];

const readingRelative = [
  'D', 'B', 'B', 'B', 'C', 'A', 'B', 'D', 'D', 'C',
  'C', 'A', 'C', 'B', 'D', 'A', 'C', 'C', 'D', 'A',
  'C', 'B', 'A', 'A', 'D', 'A', 'C', 'B', 'C', 'A',
  'D', 'B', 'A', 'C', 'A', 'C', 'D', 'D', 'A', 'D',
  'A', 'B', 'B', 'A', 'D', 'C', 'D', 'A', 'D', 'C',
  'C', 'A', 'C', 'B', 'C', 'D', 'B', 'C', 'A', 'D',
  'A', 'D', 'C', 'A', 'B', 'C', 'B', 'C', 'D', 'C',
  'B', 'B', 'A', 'C', 'D', 'B', 'B', 'A', 'D', 'A',
  'B', 'C', 'C', 'D', 'B', 'A', 'D', 'D', 'C', 'C',
  'B', 'A', 'C', 'D', 'D', 'A', 'A', 'D', 'D', 'B'
];

const answerKey = {};

listening.forEach((answer, index) => {
  answerKey[index + 1] = answer;
});

readingRelative.forEach((answer, index) => {
  answerKey[index + 101] = answer;
});

module.exports = answerKey;
