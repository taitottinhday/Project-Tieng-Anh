// Transcribed from:
// https://mytour.vn/vi/blog/bai-viet/dap-an-and-amp-phuong-phap-giai-chi-tiet-ets-2023-tu-bai-1-den-bai-10-bo-ets-lc-and-amp-rc.html
const listening = [
  'B', 'D', 'C', 'A', 'A', 'B', 'C', 'B', 'A', 'B',
  'C', 'A', 'B', 'A', 'C', 'A', 'C', 'B', 'A', 'A',
  'B', 'C', 'B', 'A', 'B', 'A', 'B', 'C', 'B', 'C',
  'B', 'B', 'D', 'C', 'C', 'D', 'A', 'D', 'A', 'C',
  'D', 'D', 'B', 'B', 'C', 'B', 'B', 'D', 'A', 'D',
  'B', 'C', 'C', 'B', 'B', 'A', 'B', 'D', 'B', 'A',
  'D', 'C', 'B', 'B', 'B', 'C', 'D', 'D', 'A', 'B',
  'D', 'B', 'B', 'B', 'C', 'B', 'B', 'D', 'C', 'B',
  'C', 'D', 'C', 'D', 'B', 'A', 'C', 'D', 'C', 'A',
  'B', 'B', 'C', 'A', 'B', 'D', 'B', 'D', 'B', 'B'
];

const readingRelative = [
  'C', 'D', 'A', 'B', 'D', 'C', 'A', 'D', 'B', 'C',
  'C', 'A', 'B', 'A', 'A', 'A', 'B', 'B', 'B', 'A',
  'A', 'C', 'D', 'B', 'C', 'C', 'D', 'A', 'D', 'C',
  'D', 'B', 'C', 'A', 'C', 'D', 'A', 'C', 'D', 'B',
  'C', 'A', 'D', 'B', 'B', 'C', 'B', 'D', 'A', 'B',
  'B', 'B', 'D', 'C', 'D', 'B', 'A', 'C', 'C', 'A',
  'B', 'D', 'A', 'D', 'C', 'D', 'D', 'B', 'C', 'D',
  'C', 'B', 'A', 'C', 'A', 'D', 'C', 'B', 'A', 'B',
  'B', 'C', 'D', 'D', 'A', 'A', 'D', 'C', 'D', 'B',
  'D', 'B', 'B', 'A', 'C', 'B', 'A', 'D', 'C', 'B'
];

const answerKey = {};

listening.forEach((answer, index) => {
  answerKey[index + 1] = answer;
});

readingRelative.forEach((answer, index) => {
  answerKey[index + 101] = answer;
});

module.exports = answerKey;
