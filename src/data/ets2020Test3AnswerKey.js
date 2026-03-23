// Generated from public answer sources:
// - https://chuyendetienganh.com/bai-viet/dap-an-full-test-lcrc-ets-2020-moi-nhat
// - https://api.chuyendetienganh.com/upload/post_upload/images/07-2020/test-3.jpg
// - https://api.chuyendetienganh.com/upload/post_upload/images/98581174_1752159848260597_3078394397541269504_n.jpg
const listening = [
  'C', 'D', 'A', 'D', 'C', 'B', 'A', 'C', 'B', 'B',
  'C', 'A', 'B', 'B', 'A', 'C', 'C', 'A', 'B', 'B',
  'C', 'A', 'A', 'C', 'C', 'B', 'A', 'B', 'B', 'A',
  'C', 'D', 'C', 'B', 'A', 'C', 'B', 'B', 'B', 'D',
  'D', 'C', 'A', 'B', 'A', 'D', 'A', 'C', 'B', 'C',
  'B', 'C', 'B', 'D', 'C', 'A', 'D', 'A', 'D', 'A',
  'B', 'C', 'B', 'D', 'D', 'C', 'B', 'C', 'A', 'A',
  'D', 'A', 'B', 'D', 'C', 'B', 'B', 'C', 'B', 'B',
  'C', 'A', 'A', 'C', 'D', 'B', 'A', 'D', 'A', 'D',
  'A', 'A', 'D', 'B', 'B', 'C', 'D', 'A', 'C', 'B'
];

const readingRelative = [
  'C', 'B', 'D', 'D', 'A', 'A', 'C', 'D', 'B', 'A',
  'D', 'C', 'C', 'D', 'A', 'A', 'B', 'C', 'D', 'A',
  'C', 'A', 'C', 'B', 'A', 'B', 'B', 'D', 'B', 'C',
  'D', 'D', 'B', 'A', 'B', 'A', 'C', 'D', 'D', 'A',
  'C', 'A', 'C', 'D', 'B', 'B', 'C', 'B', 'D', 'C',
  'B', 'C', 'A', 'C', 'D', 'B', 'A', 'D', 'D', 'B',
  'B', 'A', 'B', 'D', 'A', 'C', 'A', 'C', 'D', 'C',
  'A', 'C', 'D', 'C', 'A', 'C', 'D', 'A', 'D', 'B',
  'A', 'B', 'C', 'D', 'B', 'A', 'C', 'B', 'D', 'B',
  'A', 'A', 'C', 'D', 'C', 'A', 'A', 'C', 'D', 'B'
];

const answerKey = {};

listening.forEach((answer, index) => {
  answerKey[index + 1] = answer;
});

readingRelative.forEach((answer, index) => {
  answerKey[index + 101] = answer;
});

module.exports = answerKey;
