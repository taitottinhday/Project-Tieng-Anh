// Generated from public answer sources:
// - https://chuyendetienganh.com/bai-viet/dap-an-full-test-lcrc-ets-2020-moi-nhat
// - https://api.chuyendetienganh.com/upload/post_upload/images/07-2020/test-6.jpg
// - https://api.chuyendetienganh.com/upload/post_upload/images/97251177_2665740250373664_3942714144469286912_n.jpg
const listening = [
  'C', 'D', 'C', 'A', 'C', 'D', 'B', 'C', 'B', 'A',
  'C', 'B', 'B', 'A', 'C', 'C', 'A', 'C', 'C', 'B',
  'B', 'B', 'A', 'A', 'A', 'C', 'B', 'C', 'A', 'B',
  'C', 'D', 'B', 'A', 'C', 'B', 'B', 'C', 'A', 'B',
  'A', 'C', 'D', 'D', 'C', 'A', 'D', 'B', 'C', 'A',
  'D', 'C', 'B', 'D', 'C', 'C', 'A', 'D', 'C', 'B',
  'D', 'B', 'A', 'D', 'D', 'C', 'D', 'B', 'D', 'D',
  'C', 'C', 'A', 'A', 'B', 'D', 'D', 'C', 'C', 'B',
  'D', 'A', 'D', 'C', 'A', 'D', 'C', 'C', 'B', 'D',
  'C', 'A', 'B', 'A', 'C', 'B', 'A', 'B', 'C', 'B'
];

const readingRelative = [
  'B', 'C', 'A', 'C', 'C', 'B', 'B', 'D', 'A', 'A',
  'D', 'D', 'C', 'A', 'B', 'D', 'D', 'A', 'D', 'D',
  'C', 'A', 'B', 'B', 'A', 'A', 'D', 'C', 'B', 'A',
  'B', 'C', 'A', 'C', 'B', 'D', 'D', 'C', 'A', 'B',
  'D', 'D', 'A', 'C', 'D', 'B', 'C', 'D', 'A', 'D',
  'C', 'B', 'A', 'D', 'D', 'C', 'C', 'B', 'C', 'D',
  'A', 'C', 'D', 'C', 'A', 'C', 'C', 'B', 'C', 'A',
  'D', 'B', 'A', 'C', 'C', 'B', 'C', 'A', 'D', 'D',
  'C', 'B', 'D', 'C', 'B', 'C', 'A', 'D', 'B', 'D',
  'A', 'D', 'C', 'B', 'B', 'A', 'D', 'B', 'C', 'D'
];

const answerKey = {};

listening.forEach((answer, index) => {
  answerKey[index + 1] = answer;
});

readingRelative.forEach((answer, index) => {
  answerKey[index + 101] = answer;
});

module.exports = answerKey;
