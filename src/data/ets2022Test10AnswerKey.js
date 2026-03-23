// Generated from public answer sources:
// - https://chuyendetienganh.com/bai-viet/dap-an-full-test-lcrc-ets-2022-moi-nhat
// - https://api.chuyendetienganh.com/upload/post_upload/images/de2ac82aca01bbcca39c1abaf479f545_dap-an-test-10-ets-2022.png
const listening = [
  'B', 'A', 'C', 'B', 'A', 'D', 'C', 'A', 'B', 'C',
  'C', 'B', 'A', 'A', 'A', 'B', 'A', 'C', 'B', 'B',
  'C', 'A', 'A', 'A', 'C', 'C', 'B', 'A', 'C', 'A',
  'C', 'D', 'A', 'A', 'A', 'D', 'B', 'A', 'B', 'C',
  'D', 'A', 'A', 'C', 'A', 'C', 'B', 'C', 'C', 'A',
  'D', 'C', 'B', 'A', 'C', 'A', 'D', 'C', 'B', 'D',
  'C', 'C', 'D', 'B', 'D', 'B', 'A', 'B', 'B', 'A',
  'B', 'C', 'C', 'C', 'B', 'A', 'A', 'D', 'C', 'B',
  'D', 'A', 'B', 'D', 'C', 'A', 'B', 'C', 'D', 'B',
  'C', 'B', 'A', 'B', 'C', 'C', 'B', 'A', 'B', 'D'
];

const readingRelative = [
  'C', 'D', 'A', 'D', 'B', 'A', 'D', 'A', 'C', 'A',
  'B', 'C', 'D', 'B', 'D', 'A', 'D', 'C', 'D', 'A',
  'B', 'B', 'B', 'A', 'C', 'B', 'D', 'C', 'D', 'B',
  'D', 'A', 'A', 'C', 'C', 'A', 'D', 'A', 'D', 'C',
  'C', 'A', 'D', 'B', 'B', 'C', 'D', 'B', 'C', 'D',
  'A', 'B', 'D', 'A', 'C', 'B', 'D', 'D', 'B', 'A',
  'A', 'C', 'D', 'A', 'C', 'B', 'D', 'A', 'C', 'B',
  'B', 'D', 'A', 'C', 'B', 'B', 'A', 'A', 'C', 'B',
  'C', 'C', 'A', 'B', 'D', 'B', 'B', 'D', 'A', 'C',
  'B', 'A', 'C', 'C', 'B', 'C', 'A', 'B', 'C', 'D'
];

const answerKey = {};

listening.forEach((answer, index) => {
  answerKey[index + 1] = answer;
});

readingRelative.forEach((answer, index) => {
  answerKey[index + 101] = answer;
});

module.exports = answerKey;
