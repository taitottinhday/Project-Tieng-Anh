const listening = [
  'A','B','B','D','C','C','B','C','C','A','C','C','C','B','A','A','A','C','B','C',
  'A','B','C','A','C','A','B','A','C','C','B','D','B','B','A','C','B','A','C','D',
  'C','D','A','C','D','B','B','C','A','C','D','A','A','B','C','C','A','D','B','A',
  'D','C','C','A','D','C','B','B','D','A','D','A','C','C','B','C','B','A','C','A',
  'B','C','A','B','C','D','A','C','A','B','C','A','B','D','B','A','D','C','A','D'
];

const readingRelative = [
  'B','D','C','B','D','D','A','D','A','B','A','B','A','C','D','C','D','B','A','A',
  'D','A','B','A','D','D','C','C','C','B','D','D','A','B','C','A','B','B','A','C',
  'B','C','A','B','D','A','C','B','B','C','B','D','A','B','A','D','B','B','A','B',
  'A','C','D','C','C','D','A','D','B','C','A','D','B','C','C','B','C','C','A','B',
  'A','D','B','C','C','C','D','B','A','B','D','C','A','B','C','A','C','C','D','B'
];

const answerKey = {};
listening.forEach((answer, index) => {
  answerKey[index + 1] = answer;
});
readingRelative.forEach((answer, index) => {
  answerKey[index + 101] = answer;
});

module.exports = answerKey;
