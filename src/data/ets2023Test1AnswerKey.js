// Transcribed from:
// https://mytour.vn/vi/blog/bai-viet/dap-an-and-amp-phuong-phap-giai-chi-tiet-ets-2023-tu-bai-1-den-bai-10-bo-ets-lc-and-amp-rc.html
const listening = [
  'D', 'C', 'B', 'C', 'D', 'A', 'B', 'A', 'B', 'C',
  'A', 'B', 'A', 'C', 'A', 'C', 'B', 'B', 'C', 'A',
  'C', 'C', 'B', 'A', 'B', 'A', 'C', 'A', 'C', 'B',
  'B', 'A', 'D', 'C', 'C', 'A', 'B', 'A', 'B', 'D',
  'C', 'B', 'D', 'C', 'D', 'B', 'B', 'A', 'D', 'C',
  'D', 'A', 'C', 'C', 'A', 'A', 'B', 'A', 'C', 'B',
  'A', 'A', 'D', 'B', 'D', 'C', 'A', 'B', 'D', 'D',
  'C', 'D', 'B', 'C', 'D', 'B', 'C', 'A', 'B', 'D',
  'C', 'A', 'D', 'A', 'A', 'B', 'D', 'C', 'A', 'B',
  'D', 'D', 'C', 'B', 'A', 'D', 'C', 'C', 'B', 'B'
];

const readingRelative = [
  'C', 'B', 'A', 'B', 'D', 'D', 'A', 'B', 'C', 'D',
  'C', 'B', 'D', 'D', 'A', 'B', 'B', 'A', 'C', 'D',
  'B', 'C', 'D', 'B', 'D', 'A', 'B', 'B', 'C', 'B',
  'B', 'C', 'C', 'A', 'D', 'A', 'C', 'D', 'A', 'A',
  'D', 'D', 'B', 'D', 'A', 'C', 'A', 'B', 'B', 'C',
  'C', 'B', 'D', 'D', 'C', 'C', 'D', 'C', 'B', 'C',
  'A', 'A', 'B', 'D', 'D', 'C', 'A', 'D', 'A', 'C',
  'C', 'B', 'C', 'D', 'A', 'C', 'A', 'B', 'D', 'C',
  'A', 'B', 'B', 'D', 'D', 'C', 'A', 'C', 'B', 'A',
  'B', 'B', 'D', 'A', 'D', 'C', 'A', 'D', 'B', 'C'
];

const answerKey = {};

listening.forEach((answer, index) => {
  answerKey[index + 1] = answer;
});

readingRelative.forEach((answer, index) => {
  answerKey[index + 101] = answer;
});

module.exports = answerKey;
