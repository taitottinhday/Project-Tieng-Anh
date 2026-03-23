// Generated from public answer sources:
// - https://chuyendetienganh.com/bai-viet/dap-an-full-test-lcrc-ets-2022-moi-nhat
// - https://api.chuyendetienganh.com/upload/post_upload/images/20dd37e4e5420252cb3d13452003a3c8_dap-an-test-5-ets-2022.png
const listening = [
  'D', 'C', 'C', 'A', 'D', 'B', 'B', 'B', 'A', 'B',
  'C', 'B', 'B', 'B', 'C', 'A', 'B', 'B', 'C', 'C',
  'A', 'A', 'A', 'B', 'C', 'C', 'B', 'A', 'C', 'B',
  'A', 'A', 'C', 'B', 'B', 'D', 'C', 'C', 'B', 'A',
  'B', 'D', 'A', 'C', 'D', 'C', 'A', 'D', 'C', 'A',
  'B', 'D', 'C', 'A', 'B', 'C', 'A', 'D', 'D', 'C',
  'B', 'A', 'B', 'B', 'A', 'B', 'D', 'A', 'D', 'C',
  'B', 'D', 'A', 'A', 'C', 'B', 'C', 'A', 'C', 'B',
  'B', 'A', 'C', 'B', 'D', 'D', 'B', 'C', 'D', 'C',
  'A', 'B', 'C', 'C', 'D', 'C', 'A', 'C', 'D', 'C'
];

const readingRelative = [
  'C', 'D', 'D', 'A', 'C', 'C', 'D', 'A', 'B', 'B',
  'C', 'C', 'D', 'D', 'B', 'C', 'D', 'A', 'C', 'A',
  'D', 'C', 'B', 'A', 'B', 'A', 'B', 'B', 'B', 'C',
  'B', 'C', 'D', 'A', 'C', 'A', 'C', 'B', 'C', 'C',
  'B', 'D', 'B', 'D', 'A', 'D', 'B', 'C', 'B', 'A',
  'A', 'D', 'A', 'C', 'B', 'C', 'C', 'B', 'A', 'D',
  'C', 'D', 'B', 'D', 'D', 'B', 'A', 'C', 'A', 'D',
  'B', 'B', 'A', 'A', 'C', 'D', 'B', 'A', 'B', 'A',
  'B', 'B', 'C', 'C', 'A', 'C', 'A', 'D', 'B', 'B',
  'D', 'A', 'B', 'C', 'D', 'C', 'D', 'D', 'A', 'D'
];

const answerKey = {};

listening.forEach((answer, index) => {
  answerKey[index + 1] = answer;
});

readingRelative.forEach((answer, index) => {
  answerKey[index + 101] = answer;
});

module.exports = answerKey;
