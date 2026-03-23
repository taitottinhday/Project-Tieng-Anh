// Generated from public answer sources:
// - https://chuyendetienganh.com/bai-viet/dap-an-full-test-lcrc-ets-2020-moi-nhat
// - https://api.chuyendetienganh.com/upload/post_upload/images/07-2020/test-10.jpg
// - https://api.chuyendetienganh.com/upload/post_upload/images/97974614_265450817939726_6900669472823050240_n.jpg
const listening = [
  'B', 'D', 'A', 'A', 'D', 'A', 'A', 'B', 'A', 'C',
  'B', 'A', 'A', 'A', 'A', 'A', 'B', 'B', 'A', 'A',
  'C', 'B', 'A', 'C', 'B', 'A', 'A', 'B', 'C', 'B',
  'B', 'B', 'D', 'C', 'D', 'A', 'B', 'B', 'A', 'D',
  'A', 'D', 'C', 'A', 'C', 'B', 'B', 'C', 'A', 'B',
  'A', 'C', 'B', 'B', 'D', 'C', 'D', 'B', 'D', 'C',
  'A', 'B', 'C', 'B', 'A', 'C', 'D', 'D', 'C', 'B',
  'D', 'C', 'A', 'B', 'C', 'A', 'D', 'A', 'B', 'D',
  'B', 'A', 'B', 'C', 'A', 'D', 'B', 'C', 'B', 'D',
  'A', 'D', 'A', 'B', 'C', 'C', 'D', 'B', 'B', 'D'
];

const readingRelative = [
  'A', 'B', 'D', 'D', 'C', 'B', 'A', 'A', 'C', 'C',
  'D', 'D', 'C', 'B', 'A', 'C', 'A', 'D', 'B', 'B',
  'A', 'D', 'B', 'D', 'D', 'D', 'B', 'A', 'C', 'C',
  'D', 'D', 'C', 'A', 'B', 'D', 'C', 'A', 'D', 'D',
  'A', 'C', 'A', 'C', 'A', 'D', 'C', 'D', 'C', 'A',
  'B', 'C', 'D', 'B', 'C', 'A', 'C', 'D', 'B', 'B',
  'C', 'B', 'C', 'D', 'A', 'B', 'B', 'B', 'A', 'D',
  'D', 'C', 'C', 'D', 'A', 'A', 'A', 'C', 'D', 'A',
  'C', 'C', 'B', 'D', 'D', 'B', 'D', 'C', 'D', 'A',
  'B', 'A', 'C', 'A', 'C', 'C', 'C', 'B', 'D', 'A'
];

const answerKey = {};

listening.forEach((answer, index) => {
  answerKey[index + 1] = answer;
});

readingRelative.forEach((answer, index) => {
  answerKey[index + 101] = answer;
});

module.exports = answerKey;
