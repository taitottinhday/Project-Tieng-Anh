// Generated from public answer sources:
// - https://chuyendetienganh.com/bai-viet/dap-an-full-test-lcrc-ets-2020-moi-nhat
// - https://api.chuyendetienganh.com/upload/post_upload/images/07-2020/test-8.jpg
// - https://api.chuyendetienganh.com/upload/post_upload/images/96830545_2565444263693517_4789347671338909696_n.jpg
const listening = [
  'A', 'D', 'C', 'D', 'C', 'B', 'A', 'A', 'B', 'B',
  'A', 'B', 'A', 'C', 'C', 'C', 'B', 'C', 'A', 'C',
  'C', 'A', 'C', 'C', 'B', 'B', 'C', 'A', 'A', 'A',
  'C', 'A', 'C', 'D', 'A', 'B', 'C', 'A', 'D', 'C',
  'A', 'B', 'D', 'C', 'B', 'D', 'C', 'D', 'A', 'B',
  'D', 'B', 'D', 'C', 'A', 'D', 'B', 'C', 'D', 'C',
  'A', 'C', 'B', 'A', 'C', 'D', 'A', 'B', 'D', 'D',
  'C', 'B', 'D', 'C', 'A', 'B', 'B', 'A', 'D', 'A',
  'B', 'C', 'D', 'C', 'A', 'D', 'C', 'B', 'A', 'D',
  'B', 'A', 'C', 'B', 'B', 'C', 'B', 'C', 'D', 'B'
];

const readingRelative = [
  'D', 'C', 'B', 'D', 'A', 'D', 'D', 'C', 'B', 'A',
  'C', 'B', 'C', 'A', 'B', 'C', 'B', 'D', 'B', 'B',
  'D', 'D', 'B', 'D', 'C', 'A', 'D', 'B', 'C', 'A',
  'C', 'A', 'B', 'B', 'D', 'D', 'A', 'B', 'C', 'A',
  'D', 'C', 'C', 'A', 'B', 'D', 'A', 'C', 'A', 'C',
  'B', 'D', 'A', 'B', 'C', 'A', 'D', 'A', 'D', 'B',
  'D', 'B', 'B', 'D', 'B', 'A', 'A', 'D', 'D', 'A',
  'C', 'C', 'D', 'D', 'C', 'B', 'C', 'C', 'A', 'D',
  'C', 'A', 'B', 'D', 'C', 'A', 'A', 'C', 'D', 'B',
  'A', 'B', 'A', 'C', 'C', 'B', 'A', 'D', 'D', 'C'
];

const answerKey = {};

listening.forEach((answer, index) => {
  answerKey[index + 1] = answer;
});

readingRelative.forEach((answer, index) => {
  answerKey[index + 101] = answer;
});

module.exports = answerKey;
