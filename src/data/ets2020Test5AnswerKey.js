// Generated from public answer sources:
// - https://chuyendetienganh.com/bai-viet/dap-an-full-test-lcrc-ets-2020-moi-nhat
// - https://api.chuyendetienganh.com/upload/post_upload/images/07-2020/test-5.jpg
// - https://api.chuyendetienganh.com/upload/post_upload/images/97999010_1305443789654726_3453201315696476160_n.jpg
const listening = [
  'D', 'C', 'A', 'A', 'C', 'D', 'B', 'C', 'B', 'B',
  'A', 'C', 'C', 'B', 'B', 'A', 'C', 'C', 'A', 'B',
  'C', 'C', 'B', 'A', 'A', 'C', 'C', 'B', 'A', 'A',
  'A', 'A', 'B', 'D', 'B', 'D', 'C', 'A', 'C', 'D',
  'D', 'A', 'B', 'A', 'C', 'B', 'D', 'C', 'D', 'D',
  'C', 'C', 'B', 'C', 'D', 'D', 'A', 'C', 'B', 'A',
  'D', 'C', 'D', 'B', 'A', 'B', 'B', 'B', 'D', 'A',
  'C', 'C', 'B', 'A', 'D', 'C', 'C', 'D', 'B', 'C',
  'B', 'D', 'D', 'B', 'D', 'C', 'A', 'D', 'B', 'D',
  'D', 'D', 'A', 'C', 'C', 'A', 'B', 'C', 'A', 'B'
];

const readingRelative = [
  'A', 'B', 'D', 'C', 'B', 'D', 'B', 'B', 'A', 'B',
  'B', 'A', 'D', 'D', 'B', 'C', 'B', 'D', 'C', 'C',
  'D', 'A', 'A', 'A', 'D', 'D', 'B', 'A', 'D', 'A',
  'C', 'D', 'D', 'A', 'A', 'C', 'A', 'B', 'A', 'D',
  'C', 'D', 'C', 'A', 'D', 'A', 'A', 'D', 'A', 'B',
  'B', 'A', 'B', 'D', 'A', 'B', 'B', 'C', 'D', 'A',
  'B', 'B', 'D', 'D', 'B', 'D', 'C', 'B', 'D', 'A',
  'A', 'B', 'A', 'D', 'A', 'D', 'B', 'C', 'A', 'A',
  'C', 'A', 'B', 'D', 'A', 'A', 'A', 'D', 'C', 'B',
  'D', 'D', 'B', 'C', 'D', 'A', 'A', 'B', 'C', 'D'
];

const answerKey = {};

listening.forEach((answer, index) => {
  answerKey[index + 1] = answer;
});

readingRelative.forEach((answer, index) => {
  answerKey[index + 101] = answer;
});

module.exports = answerKey;
