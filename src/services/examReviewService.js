const https = require('https');

const REVIEW_STATUS = Object.freeze({
  CORRECT: 'correct',
  INCORRECT: 'incorrect',
  SKIPPED: 'skipped'
});

const STERLINGO_RESULT_ENDPOINT = 'https://api-toeic.sterlingo.vn/api/exams/result';
const RESULT_CACHE = new Map();

function normalizePartIds(partIds = []) {
  const values = Array.isArray(partIds) ? partIds : [partIds];

  return Array.from(
    new Set(
      values
        .map((value) => Number(value))
        .filter((value) => Number.isInteger(value) && value > 0)
    )
  ).sort((left, right) => left - right);
}

function buildCacheKey(apiExamId, partIds = []) {
  return `${String(apiExamId || '').trim()}::${normalizePartIds(partIds).join(',') || 'all'}`;
}

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    const request = https.get(url, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'StudentPlatformReview/1.0'
      }
    }, (response) => {
      const chunks = [];

      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => {
        const raw = Buffer.concat(chunks).toString('utf8');

        if (response.statusCode < 200 || response.statusCode >= 300) {
          reject(new Error(`Sterlingo review API returned ${response.statusCode}: ${raw.slice(0, 200)}`));
          return;
        }

        try {
          resolve(JSON.parse(raw));
        } catch (error) {
          reject(new Error(`Cannot parse Sterlingo review payload: ${error.message}`));
        }
      });
    });

    request.setTimeout(8000, () => {
      request.destroy(new Error('Sterlingo review request timed out.'));
    });

    request.on('error', reject);
  });
}

async function fetchSterlingoResult(apiExamId, partIds = []) {
  const normalizedExamId = String(apiExamId || '').trim();
  if (!normalizedExamId || normalizedExamId.includes('+')) {
    return null;
  }

  const normalizedPartIds = normalizePartIds(partIds);
  const cacheKey = buildCacheKey(normalizedExamId, normalizedPartIds);

  if (!RESULT_CACHE.has(cacheKey)) {
    const searchParams = normalizedPartIds
      .map((partId) => `partIds=${encodeURIComponent(String(partId))}`)
      .join('&');
    const url = `${STERLINGO_RESULT_ENDPOINT}/${encodeURIComponent(normalizedExamId)}${searchParams ? `?${searchParams}` : ''}`;

    RESULT_CACHE.set(
      cacheKey,
      fetchJson(url)
        .then((payload) => (payload && payload.data ? payload.data : null))
        .catch((error) => {
          console.warn(`Sterlingo review fetch failed for ${normalizedExamId}:`, error.message);
          return null;
        })
    );
  }

  return RESULT_CACHE.get(cacheKey);
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function sanitizeHtmlFragment(value) {
  return String(value || '')
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/\son\w+=(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/javascript:/gi, '');
}

function toSafeHtml(value) {
  const source = String(value || '').trim();
  if (!source) {
    return '';
  }

  if (/<\/?[a-z][\s\S]*>/i.test(source)) {
    return sanitizeHtmlFragment(source);
  }

  return escapeHtml(source).replace(/\r?\n/g, '<br>');
}

function normalizeImageUrls(images) {
  return Array.isArray(images)
    ? images.map((image) => image && image.image_path).filter(Boolean)
    : [];
}

function parseOptions(rawOptions, fallbackOptions = []) {
  if (!rawOptions) {
    return Array.isArray(fallbackOptions)
      ? fallbackOptions.map((option) => ({ ...option }))
      : [];
  }

  return String(rawOptions)
    .split('|')
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item, index) => {
      const defaultLabel = String.fromCharCode(65 + index);
      const fallbackOption = Array.isArray(fallbackOptions)
        ? (fallbackOptions[index] || fallbackOptions.find((option) => option.label === defaultLabel))
        : null;
      const matched = item.match(/^([A-Z])(?:[.)]\s*)?(.*)$/i);
      const label = matched ? matched[1].toUpperCase() : (fallbackOption && fallbackOption.label) || defaultLabel;
      const rawText = matched ? matched[2] : item;
      const text = rawText || (fallbackOption && fallbackOption.text) || '';

      return {
        label,
        text,
        isLetterOnly: !text.trim()
      };
    });
}

function normalizeAnswerLabel(value, options = [], fallbackLabel = null) {
  if (value === undefined || value === null || value === '') {
    return fallbackLabel ? normalizeAnswerLabel(fallbackLabel, options) : null;
  }

  if (typeof value === 'number' || /^\d+$/.test(String(value).trim())) {
    const optionIndex = Number(value) - 1;
    return options[optionIndex] ? options[optionIndex].label : (fallbackLabel ? normalizeAnswerLabel(fallbackLabel, options) : null);
  }

  const normalized = String(value).trim().toUpperCase();
  return normalized || (fallbackLabel ? normalizeAnswerLabel(fallbackLabel, options) : null);
}

function buildQuestionIndex(exam) {
  const groups = Array.isArray(exam.groups) ? exam.groups : [];
  const partSummary = Array.isArray(exam.partSummary) ? exam.partSummary : [];
  const partMap = new Map(partSummary.map((part) => [Number(part.partNumber), part]));
  const groupMap = new Map();

  groups.forEach((group) => {
    (Array.isArray(group.questions) ? group.questions : []).forEach((question) => {
      groupMap.set(Number(question.number), group);
    });
  });

  return new Map(
    (Array.isArray(exam.flatQuestions) ? exam.flatQuestions : []).map((question) => {
      const group = groupMap.get(Number(question.number)) || {};
      const part = partMap.get(Number(question.partNumber)) || {};

      return [
        Number(question.number),
        {
          number: Number(question.number),
          sourceNumber: Number(question.sourceNumber || question.number),
          sourceApiExamId: question.sourceApiExamId || exam.slug || null,
          partNumber: Number(question.partNumber),
          partTitle: part.title || `Part ${question.partNumber}`,
          partInstructions: part.instructions || '',
          questionFormat: question.questionFormat || part.title || `Part ${question.partNumber}`,
          prompt: question.prompt || '',
          options: Array.isArray(question.options) ? question.options.map((option) => ({ ...option })) : [],
          correctAnswer: question.correctAnswer || null,
          audioUrl: question.audioUrl || group.sharedAudioUrl || null,
          imageUrls: Array.isArray(question.imageUrls) && question.imageUrls.length
            ? question.imageUrls.slice()
            : (Array.isArray(group.sharedImages) ? group.sharedImages.slice() : []),
          passageHtml: toSafeHtml(group.sharedContent || ''),
          transcriptHtml: toSafeHtml(question.transcriptHtml || ''),
          translationHtml: toSafeHtml(question.translationHtml || ''),
          explanationHtml: toSafeHtml(question.explanationHtml || '')
        }
      ];
    })
  );
}

function resolveVisiblePartNumbers(exam, questionResults = [], furthestQuestionNumber = null) {
  const partSummary = Array.isArray(exam.partSummary) ? exam.partSummary : [];
  const orderMap = new Map(partSummary.map((part, index) => [Number(part.partNumber), index]));
  let maxReachedOrder = -1;

  questionResults.forEach((result) => {
    if (!result || !result.selectedAnswer) {
      return;
    }

    const order = orderMap.get(Number(result.partNumber));
    if (Number.isInteger(order)) {
      maxReachedOrder = Math.max(maxReachedOrder, order);
    }
  });

  const normalizedFurthestNumber = Number(furthestQuestionNumber);
  if (Number.isInteger(normalizedFurthestNumber)) {
    const furthestQuestion = (Array.isArray(exam.flatQuestions) ? exam.flatQuestions : [])
      .find((question) => Number(question.number) === normalizedFurthestNumber);

    if (furthestQuestion) {
      const order = orderMap.get(Number(furthestQuestion.partNumber));
      if (Number.isInteger(order)) {
        maxReachedOrder = Math.max(maxReachedOrder, order);
      }
    }
  }

  if (maxReachedOrder < 0) {
    return partSummary.length === 1
      ? [Number(partSummary[0].partNumber)]
      : [];
  }

  return partSummary
    .slice(0, maxReachedOrder + 1)
    .map((part) => Number(part.partNumber));
}

function buildRemoteRequestMap(localQuestionIndex, visiblePartNumbers) {
  const visiblePartSet = new Set(visiblePartNumbers.map(Number));
  const requestMap = new Map();

  Array.from(localQuestionIndex.values()).forEach((question) => {
    if (!visiblePartSet.has(Number(question.partNumber)) || !question.sourceApiExamId) {
      return;
    }

    if (!requestMap.has(question.sourceApiExamId)) {
      requestMap.set(question.sourceApiExamId, new Set());
    }

    requestMap.get(question.sourceApiExamId).add(Number(question.partNumber));
  });

  return requestMap;
}

async function fetchRemoteQuestionMaps(requestMap) {
  const remoteMaps = new Map();
  const entries = Array.from(requestMap.entries());

  await Promise.all(entries.map(async ([apiExamId, partSet]) => {
    const data = await fetchSterlingoResult(apiExamId, Array.from(partSet));
    const questionMap = new Map();

    if (data && Array.isArray(data.questions)) {
      data.questions.forEach((question) => {
        questionMap.set(Number(question.number_of_question), question);
      });
    }

    remoteMaps.set(apiExamId, questionMap);
  }));

  return remoteMaps;
}

function buildQuestionReviewDetail(examTitle, localQuestion, questionResult, remoteQuestion) {
  const partNumber = Number(remoteQuestion && remoteQuestion.question_part ? remoteQuestion.question_part : localQuestion.partNumber);
  const questionFormat = (remoteQuestion && remoteQuestion.question_format) || localQuestion.questionFormat || localQuestion.partTitle || `Part ${partNumber}`;
  const options = parseOptions(
    remoteQuestion && remoteQuestion.options,
    localQuestion.options
  );
  const selectedAnswer = normalizeAnswerLabel(questionResult.selectedAnswer, options);
  const correctAnswer = normalizeAnswerLabel(
    remoteQuestion && remoteQuestion.correct_answer,
    options,
    questionResult.correctAnswer || localQuestion.correctAnswer
  );
  const directImages = normalizeImageUrls(remoteQuestion && remoteQuestion.images);
  const parentImages = normalizeImageUrls(remoteQuestion && remoteQuestion.parent_question && remoteQuestion.parent_question.images);
  const imageUrls = directImages.length
    ? directImages
    : (parentImages.length ? parentImages : localQuestion.imageUrls);
  const prompt = (remoteQuestion && remoteQuestion.content) || localQuestion.prompt || '';
  const status = !selectedAnswer
    ? REVIEW_STATUS.SKIPPED
    : (selectedAnswer === correctAnswer ? REVIEW_STATUS.CORRECT : REVIEW_STATUS.INCORRECT);

  return {
    number: Number(questionResult.number),
    sourceNumber: Number(localQuestion.sourceNumber || questionResult.number),
    partNumber,
    partTitle: localQuestion.partTitle || `Part ${partNumber}`,
    questionFormat,
    status,
    selectedAnswer,
    correctAnswer,
    prompt,
    promptHtml: toSafeHtml(prompt),
    questionTag: `[Part ${partNumber}] ${questionFormat}`,
    audioUrl: (remoteQuestion && remoteQuestion.audio)
      || (remoteQuestion && remoteQuestion.parent_question && remoteQuestion.parent_question.audio)
      || localQuestion.audioUrl
      || null,
    imageUrls,
    passageHtml: toSafeHtml(
      (remoteQuestion && remoteQuestion.parent_question && remoteQuestion.parent_question.content)
      || localQuestion.passageHtml
    ) || localQuestion.passageHtml,
    transcriptHtml: toSafeHtml(
      (remoteQuestion && remoteQuestion.transcript)
      || (remoteQuestion && remoteQuestion.parent_question && remoteQuestion.parent_question.transcript)
      || localQuestion.transcriptHtml
    ) || localQuestion.transcriptHtml,
    translationHtml: toSafeHtml(
      (remoteQuestion && remoteQuestion.translate)
      || (remoteQuestion && remoteQuestion.parent_question && remoteQuestion.parent_question.translate)
      || localQuestion.translationHtml
    ) || localQuestion.translationHtml,
    explanationHtml: toSafeHtml(
      (remoteQuestion && remoteQuestion.explain)
      || localQuestion.explanationHtml
    ) || localQuestion.explanationHtml,
    options: options.map((option) => ({
      ...option,
      textHtml: toSafeHtml(option.text),
      isSelected: option.label === selectedAnswer,
      isCorrect: option.label === correctAnswer
    })),
    modalTitle: `${examTitle} | Part ${partNumber} | Đáp án #${questionResult.number}`
  };
}

async function buildExamReviewPayload(exam, questionResults = [], options = {}) {
  if (!exam || !Array.isArray(exam.flatQuestions) || !exam.flatQuestions.length) {
    return null;
  }

  const visiblePartNumbers = resolveVisiblePartNumbers(
    exam,
    questionResults,
    options.furthestQuestionNumber
  );

  if (!visiblePartNumbers.length) {
    return {
      available: false,
      parts: [],
      details: []
    };
  }

  const visiblePartSet = new Set(visiblePartNumbers.map(Number));
  const localQuestionIndex = buildQuestionIndex(exam);
  const requestMap = buildRemoteRequestMap(localQuestionIndex, visiblePartNumbers);
  const remoteQuestionMaps = await fetchRemoteQuestionMaps(requestMap);
  const visibleResults = questionResults.filter((result) => visiblePartSet.has(Number(result.partNumber)));
  const details = visibleResults
    .map((result) => {
      const localQuestion = localQuestionIndex.get(Number(result.number));
      if (!localQuestion) {
        return null;
      }

      const remoteQuestionMap = remoteQuestionMaps.get(localQuestion.sourceApiExamId);
      const remoteQuestion = remoteQuestionMap
        ? remoteQuestionMap.get(Number(localQuestion.sourceNumber))
        : null;

      return buildQuestionReviewDetail(
        exam.title || exam.examTitle || 'Review',
        localQuestion,
        result,
        remoteQuestion
      );
    })
    .filter(Boolean)
    .sort((left, right) => left.number - right.number);

  const partMetaMap = new Map(
    (Array.isArray(exam.partSummary) ? exam.partSummary : [])
      .map((part) => [Number(part.partNumber), part])
  );
  const partBuckets = new Map();
  let correctCount = 0;
  let incorrectCount = 0;
  let skippedCount = 0;

  details.forEach((detail) => {
    if (!partBuckets.has(detail.partNumber)) {
      const partMeta = partMetaMap.get(detail.partNumber) || {};
      partBuckets.set(detail.partNumber, {
        partNumber: detail.partNumber,
        title: partMeta.title || detail.partTitle || `Part ${detail.partNumber}`,
        correctCount: 0,
        incorrectCount: 0,
        skippedCount: 0,
        groups: new Map()
      });
    }

    const bucket = partBuckets.get(detail.partNumber);
    const groupKey = detail.questionFormat || bucket.title;

    if (!bucket.groups.has(groupKey)) {
      bucket.groups.set(groupKey, {
        label: groupKey,
        correctCount: 0,
        incorrectCount: 0,
        skippedCount: 0,
        firstNumber: detail.number,
        questions: []
      });
    }

    const group = bucket.groups.get(groupKey);
    group.questions.push({
      number: detail.number,
      status: detail.status
    });
    group.firstNumber = Math.min(group.firstNumber, detail.number);

    if (detail.status === REVIEW_STATUS.CORRECT) {
      bucket.correctCount += 1;
      group.correctCount += 1;
      correctCount += 1;
      return;
    }

    if (detail.status === REVIEW_STATUS.INCORRECT) {
      bucket.incorrectCount += 1;
      group.incorrectCount += 1;
      incorrectCount += 1;
      return;
    }

    bucket.skippedCount += 1;
    group.skippedCount += 1;
    skippedCount += 1;
  });

  const parts = visiblePartNumbers
    .map((partNumber) => partBuckets.get(Number(partNumber)))
    .filter(Boolean)
    .map((bucket) => ({
      partNumber: bucket.partNumber,
      title: bucket.title,
      correctCount: bucket.correctCount,
      incorrectCount: bucket.incorrectCount,
      skippedCount: bucket.skippedCount,
      groups: Array.from(bucket.groups.values())
        .sort((left, right) => left.firstNumber - right.firstNumber)
        .map((group) => ({
          label: group.label,
          correctCount: group.correctCount,
          incorrectCount: group.incorrectCount,
          skippedCount: group.skippedCount,
          questions: group.questions.sort((left, right) => left.number - right.number)
        }))
    }));

  return {
    available: parts.length > 0,
    visiblePartNumbers,
    highestReachedPartNumber: visiblePartNumbers[visiblePartNumbers.length - 1] || null,
    correctCount,
    incorrectCount,
    skippedCount,
    totalQuestions: details.length,
    parts,
    details
  };
}

module.exports = {
  REVIEW_STATUS,
  buildExamReviewPayload
};
