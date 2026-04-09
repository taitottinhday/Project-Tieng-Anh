// Generated from public answer sources:
// - https://chuyendetienganh.com/bai-viet/dap-an-full-test-lcrc-ets-2020-moi-nhat
// - https://api.chuyendetienganh.com/upload/post_upload/images/07-2020/test-2.jpg
// - https://api.chuyendetienganh.com/upload/post_upload/images/98581165_1148714315482347_2389185440843300864_n.jpg
const listening = [
  'D', 'A', 'C', 'A', 'B', 'C', 'C', 'C', 'A', 'B',
  'C', 'C', 'B', 'A', 'A', 'C', 'A', 'B', 'C', 'B',
  'B', 'A', 'A', 'C', 'C', 'A', 'C', 'C', 'A', 'B',
  'A', 'B', 'C', 'A', 'A', 'C', 'D', 'A', 'C', 'B',
  'B', 'C', 'A', 'A', 'C', 'B', 'D', 'B', 'C', 'C',
  'A', 'D', 'B', 'A', 'C', 'A', 'C', 'D', 'D', 'C',
  'A', 'C', 'B', 'A', 'B', 'C', 'D', 'A', 'C', 'B',
  'B', 'D', 'C', 'B', 'A', 'A', 'A', 'D', 'C', 'D',
  'C', 'C', 'B', 'D', 'C', 'D', 'C', 'A', 'B', 'B',
  'A', 'D', 'C', 'B', 'A', 'B', 'A', 'A', 'D', 'C'
];

const readingRelative = [
  'C', 'A', 'B', 'A', 'A', 'D', 'C', 'D', 'B', 'B',
  'B', 'C', 'A', 'D', 'B', 'A', 'D', 'C', 'A', 'D',
  'C', 'B', 'C', 'D', 'D', 'B', 'D', 'A', 'C', 'B',
  'C', 'B', 'A', 'D', 'A', 'D', 'C', 'B', 'B', 'D',
  'D', 'A', 'A', 'B', 'A', 'D', 'C', 'D', 'A', 'D',
  'D', 'B', 'B', 'C', 'D', 'C', 'D', 'C', 'A', 'D',
  'A', 'B', 'A', 'C', 'D', 'A', 'B', 'B', 'A', 'B',
  'C', 'D', 'A', 'C', 'D', 'C', 'B', 'D', 'D', 'C',
  'C', 'D', 'A', 'D', 'C', 'B', 'C', 'A', 'B', 'C',
  'B', 'C', 'C', 'D', 'A', 'B', 'A', 'D', 'C', 'A'
];

const answerKey = {};

listening.forEach((answer, index) => {
  answerKey[index + 1] = answer;
});

readingRelative.forEach((answer, index) => {
  answerKey[index + 101] = answer;
});

module.exports = answerKey;
