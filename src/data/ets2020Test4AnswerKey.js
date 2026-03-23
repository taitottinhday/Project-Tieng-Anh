// Generated from public answer sources:
// - https://chuyendetienganh.com/bai-viet/dap-an-full-test-lcrc-ets-2020-moi-nhat
// - https://api.chuyendetienganh.com/upload/post_upload/images/07-2020/test-4.jpg
// - https://api.chuyendetienganh.com/upload/post_upload/images/97087083_635795017006934_6025882297889193984_n.jpg
const listening = [
  'C', 'A', 'D', 'B', 'C', 'B', 'A', 'B', 'A', 'A',
  'A', 'C', 'B', 'C', 'A', 'C', 'A', 'C', 'A', 'C',
  'B', 'B', 'B', 'C', 'A', 'C', 'B', 'A', 'C', 'C',
  'B', 'D', 'A', 'A', 'A', 'D', 'C', 'C', 'B', 'D',
  'C', 'D', 'A', 'A', 'C', 'D', 'A', 'C', 'B', 'D',
  'A', 'B', 'C', 'A', 'D', 'D', 'A', 'B', 'A', 'C',
  'B', 'B', 'B', 'D', 'B', 'A', 'D', 'A', 'C', 'D',
  'C', 'B', 'C', 'C', 'A', 'D', 'C', 'A', 'D', 'B',
  'A', 'D', 'B', 'A', 'A', 'D', 'C', 'B', 'D', 'C',
  'B', 'C', 'A', 'D', 'B', 'C', 'D', 'B', 'C', 'A'
];

const readingRelative = [
  'C', 'B', 'A', 'B', 'A', 'B', 'A', 'C', 'A', 'B',
  'D', 'C', 'C', 'B', 'B', 'D', 'B', 'A', 'D', 'D',
  'A', 'B', 'A', 'D', 'B', 'D', 'C', 'A', 'B', 'C',
  'A', 'C', 'A', 'A', 'A', 'B', 'C', 'D', 'A', 'D',
  'C', 'B', 'C', 'D', 'D', 'A', 'B', 'C', 'C', 'D',
  'B', 'D', 'C', 'B', 'C', 'C', 'D', 'B', 'A', 'D',
  'D', 'A', 'B', 'C', 'B', 'D', 'A', 'B', 'A', 'D',
  'D', 'A', 'B', 'C', 'D', 'B', 'A', 'A', 'C', 'D',
  'D', 'C', 'B', 'A', 'C', 'D', 'C', 'D', 'B', 'A',
  'A', 'C', 'C', 'D', 'B', 'C', 'C', 'B', 'A', 'D'
];

const answerKey = {};

listening.forEach((answer, index) => {
  answerKey[index + 1] = answer;
});

readingRelative.forEach((answer, index) => {
  answerKey[index + 101] = answer;
});

module.exports = answerKey;
