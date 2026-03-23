// Generated from public answer sources:
// - https://chuyendetienganh.com/bai-viet/dap-an-full-test-lcrc-ets-2022-moi-nhat
// - https://api.chuyendetienganh.com/upload/post_upload/images/b8e19d5df3f0688e9e1604fa8b83df3e_dap-an-test-7-ets-2022.png
const listening = [
  'A', 'C', 'C', 'C', 'A', 'B', 'A', 'C', 'C', 'A',
  'B', 'B', 'C', 'A', 'A', 'B', 'A', 'C', 'C', 'A',
  'B', 'B', 'B', 'A', 'C', 'B', 'C', 'B', 'B', 'D',
  'C', 'B', 'D', 'B', 'B', 'A', 'A', 'C', 'B', 'B',
  'A', 'C', 'B', 'D', 'B', 'A', 'A', 'B', 'D', 'B',
  'C', 'D', 'B', 'A', 'D', 'D', 'C', 'B', 'B', 'D',
  'B', 'D', 'B', 'C', 'B', 'A', 'B', 'A', 'B', 'C',
  'C', 'D', 'B', 'B', 'B', 'A', 'B', 'D', 'A', 'B',
  'D', 'A', 'D', 'C', 'B', 'C', 'D', 'D', 'B', 'D',
  'A', 'C', 'D', 'A', 'B', 'A', 'D', 'B', 'B', 'A'
];

const readingRelative = [
  'B', 'D', 'D', 'B', 'A', 'A', 'B', 'C', 'A', 'D',
  'C', 'D', 'D', 'A', 'D', 'B', 'B', 'D', 'D', 'D',
  'A', 'B', 'D', 'A', 'A', 'C', 'C', 'C', 'B', 'D',
  'A', 'B', 'B', 'D', 'B', 'D', 'C', 'A', 'C', 'B',
  'A', 'B', 'C', 'A', 'D', 'B', 'D', 'B', 'C', 'D',
  'D', 'C', 'C', 'B', 'C', 'A', 'D', 'C', 'B', 'A',
  'B', 'B', 'C', 'C', 'A', 'D', 'B', 'B', 'C', 'A',
  'D', 'D', 'C', 'A', 'D', 'C', 'A', 'D', 'D', 'C',
  'A', 'B', 'B', 'B', 'C', 'C', 'B', 'C', 'B', 'D',
  'A', 'C', 'B', 'C', 'D', 'A', 'D', 'D', 'B', 'C'
];

const answerKey = {};

listening.forEach((answer, index) => {
  answerKey[index + 1] = answer;
});

readingRelative.forEach((answer, index) => {
  answerKey[index + 101] = answer;
});

module.exports = answerKey;
