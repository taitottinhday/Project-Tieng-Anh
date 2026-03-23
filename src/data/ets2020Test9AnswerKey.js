// Generated from public answer sources:
// - https://chuyendetienganh.com/bai-viet/dap-an-full-test-lcrc-ets-2020-moi-nhat
// - https://api.chuyendetienganh.com/upload/post_upload/images/07-2020/test-9.jpg
// - https://api.chuyendetienganh.com/upload/post_upload/images/98274396_640259553499581_5628178299193655296_n.jpg
const listening = [
  'C', 'B', 'D', 'A', 'D', 'A', 'C', 'A', 'C', 'B',
  'C', 'B', 'C', 'B', 'A', 'B', 'C', 'B', 'B', 'A',
  'A', 'C', 'A', 'A', 'A', 'B', 'C', 'B', 'A', 'C',
  'A', 'D', 'B', 'C', 'D', 'C', 'C', 'A', 'C', 'C',
  'D', 'C', 'B', 'C', 'A', 'B', 'A', 'D', 'B', 'B',
  'C', 'A', 'D', 'B', 'A', 'B', 'C', 'D', 'A', 'A',
  'C', 'A', 'C', 'A', 'B', 'D', 'D', 'C', 'A', 'D',
  'C', 'D', 'B', 'D', 'C', 'C', 'A', 'B', 'C', 'B',
  'D', 'D', 'B', 'D', 'A', 'A', 'D', 'C', 'B', 'A',
  'D', 'B', 'A', 'D', 'C', 'B', 'D', 'D', 'B', 'A'
];

const readingRelative = [
  'A', 'C', 'D', 'B', 'A', 'B', 'C', 'D', 'A', 'B',
  'C', 'B', 'B', 'A', 'A', 'D', 'C', 'B', 'B', 'D',
  'A', 'B', 'C', 'B', 'A', 'B', 'D', 'A', 'D', 'C',
  'C', 'A', 'C', 'A', 'C', 'D', 'A', 'B', 'A', 'C',
  'B', 'D', 'C', 'B', 'D', 'A', 'A', 'B', 'B', 'C',
  'D', 'B', 'C', 'D', 'B', 'C', 'C', 'B', 'D', 'D',
  'A', 'C', 'A', 'B', 'D', 'C', 'D', 'C', 'D', 'A',
  'B', 'A', 'B', 'D', 'D', 'A', 'C', 'A', 'D', 'C',
  'B', 'A', 'C', 'C', 'D', 'D', 'D', 'B', 'C', 'B',
  'A', 'B', 'D', 'D', 'C', 'B', 'D', 'C', 'A', 'C'
];

const answerKey = {};

listening.forEach((answer, index) => {
  answerKey[index + 1] = answer;
});

readingRelative.forEach((answer, index) => {
  answerKey[index + 101] = answer;
});

module.exports = answerKey;
