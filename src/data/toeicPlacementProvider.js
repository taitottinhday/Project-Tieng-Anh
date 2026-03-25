const fs = require('fs');
const path = require('path');
const defaultAnswerKey = require('./toeicPlacementAnswerKey');

const PART_META = {
  1: { skill: 'listening', title: 'Photographs', instructions: 'Quan sát tranh và chọn đáp án mô tả phù hợp nhất.' },
  2: { skill: 'listening', title: 'Question-Response', instructions: 'Nghe câu hỏi và chọn phản hồi hợp lý nhất.' },
  3: { skill: 'listening', title: 'Conversations', instructions: 'Nghe đoạn hội thoại và trả lời nhóm câu hỏi đi kèm.' },
  4: { skill: 'listening', title: 'Talks', instructions: 'Nghe bài nói chuyện ngắn và chọn đáp án đúng.' },
  5: { skill: 'reading', title: 'Incomplete Sentences', instructions: 'Chọn từ hoặc cụm từ đúng để hoàn thành câu.' },
  6: { skill: 'reading', title: 'Text Completion', instructions: 'Đọc văn bản và điền đáp án phù hợp vào chỗ trống.' },
  7: { skill: 'reading', title: 'Reading Comprehension', instructions: 'Đọc tài liệu và trả lời câu hỏi.' }
};
const DEMO_RESPONSE = {
  message: 'Success',
  data: {
    id: 'Pu7wk78Q_IPTvvj56B_pn',
    exam_name: 'Test 1 ETS 2024',
    book: { book_name: 'ETS 2024' },
    questions: [
      { content: '', question_part: '1', parent_question: null, options: 'A|B|C|D', number_of_question: 1, audio: 'https://sterlingo-toeic-bucket-prod.s3.ap-southeast-1.amazonaws.com/audios/1709483682971_Test_1-1.mp3', images: [{ image_path: 'https://sterlingo-toeic-bucket-prod.s3.ap-southeast-1.amazonaws.com/images/1709483683762_1.webp' }] },
      { content: '', question_part: '1', parent_question: null, options: 'A|B|C|D', number_of_question: 2, audio: 'https://sterlingo-toeic-bucket-prod.s3.ap-southeast-1.amazonaws.com/audios/1709483722374_Test_1-2.mp3', images: [{ image_path: 'https://sterlingo-toeic-bucket-prod.s3.ap-southeast-1.amazonaws.com/images/1709483723043_2.webp' }] },
      { content: '', question_part: '2', parent_question: null, options: 'A|B|C', number_of_question: 7, audio: 'https://sterlingo-toeic-bucket-prod.s3.ap-southeast-1.amazonaws.com/audios/1709484046237_Test_1-7.mp3', images: null },
      { content: 'What event does the woman mention?', question_part: '3', parent_question: { id: 'LUFIyZ9EuolLPoJ-HK8tF', content: '', audio: 'https://sterlingo-toeic-bucket-prod.s3.ap-southeast-1.amazonaws.com/audios/1709517606328_Test_1-32-34.mp3', images: null }, options: 'A. A job fair|B. A cooking class|C. A fund-raiser|D. A company picnic', number_of_question: 32, audio: null, images: null },
      { content: 'What does the woman ask for?', question_part: '3', parent_question: { id: 'LUFIyZ9EuolLPoJ-HK8tF', content: '', audio: 'https://sterlingo-toeic-bucket-prod.s3.ap-southeast-1.amazonaws.com/audios/1709517606328_Test_1-32-34.mp3', images: null }, options: 'A. A guest list|B. A dessert recipe|C. A business card|D. A promotional code', number_of_question: 33, audio: null, images: null },
      { content: 'What does the man recommend doing?', question_part: '3', parent_question: { id: 'LUFIyZ9EuolLPoJ-HK8tF', content: '', audio: 'https://sterlingo-toeic-bucket-prod.s3.ap-southeast-1.amazonaws.com/audios/1709517606328_Test_1-32-34.mp3', images: null }, options: 'A. Returning some merchandise|B. Watching a video|C. Creating an account|D. Reading a review', number_of_question: 34, audio: null, images: null },
      { content: 'Who has recorded the message?', question_part: '4', parent_question: { id: '3_YkSwSZHAGl5jtlYhvIW', content: '', audio: 'https://sterlingo-toeic-bucket-prod.s3.ap-southeast-1.amazonaws.com/audios/1709519639324_Test_1-71-73.mp3', images: null }, options: 'A. A city mayor’s office|B. A maintenance department|C. An automobile dealership|D. A building management office', number_of_question: 71, audio: null, images: null },
      { content: 'What are the listeners asked to do?', question_part: '4', parent_question: { id: '3_YkSwSZHAGl5jtlYhvIW', content: '', audio: 'https://sterlingo-toeic-bucket-prod.s3.ap-southeast-1.amazonaws.com/audios/1709519639324_Test_1-71-73.mp3', images: null }, options: 'A. Move their vehicles|B. Pay their parking fines|C. Use an alternate entrance|D. Participate in a meeting', number_of_question: 72, audio: null, images: null },
      { content: 'What does the speaker say was mailed last week?', question_part: '4', parent_question: { id: '3_YkSwSZHAGl5jtlYhvIW', content: '', audio: 'https://sterlingo-toeic-bucket-prod.s3.ap-southeast-1.amazonaws.com/audios/1709519639324_Test_1-71-73.mp3', images: null }, options: 'A. An election ballot|B. A maintenance plan|C. A map|D. A coupon', number_of_question: 73, audio: null, images: null },
      { content: 'Former Sendai Company CEO Ken Nakata spoke about -- career experiences.', question_part: '5', parent_question: null, options: 'A. he|B. his|C. him|D. himself', number_of_question: 101, audio: null, images: null },
      { content: 'Passengers who will be taking a -- domestic flight should go to Terminal A.', question_part: '5', parent_question: null, options: 'A. connectivity|B. connects|C. connect|D. connecting', number_of_question: 102, audio: null, images: null },
      { content: 'Fresh and -- apple-cider donuts are available at Oakcrest Orchard’s retail shop for £6 per dozen.', question_part: '5', parent_question: null, options: 'A. eaten|B. open|C. tasty|D. free', number_of_question: 103, audio: null, images: null },
      { content: 'Zahn Flooring has the widest selection of -- in the United Kingdom.', question_part: '5', parent_question: null, options: 'A. paints|B. tiles|C. furniture|D. curtains', number_of_question: 104, audio: null, images: null },
      { content: null, question_part: '6', parent_question: { id: 'vez-u2w-CexAMOwvOYiiF', content: '', audio: null, images: [{ image_path: 'https://sterlingo-toeic-bucket-prod.s3.ap-southeast-1.amazonaws.com/images/1709523954504_131.webp' }] }, options: 'A. Children of all ages will enjoy the new exhibits.|B. Learn about rainfall patterns across the region.|C. Build a set of simple patio furniture with easy-to-acquire materials.|D. Next Saturday at 4 p.m., we are hosting a free workshop for the public.', number_of_question: 131, audio: null, images: null },
      { content: null, question_part: '6', parent_question: { id: 'vez-u2w-CexAMOwvOYiiF', content: '', audio: null, images: [{ image_path: 'https://sterlingo-toeic-bucket-prod.s3.ap-southeast-1.amazonaws.com/images/1709523954504_131.webp' }] }, options: 'A. to use|B. used to|C. by using|D. that uses', number_of_question: 132, audio: null, images: null },
      { content: null, question_part: '6', parent_question: { id: 'vez-u2w-CexAMOwvOYiiF', content: '', audio: null, images: [{ image_path: 'https://sterlingo-toeic-bucket-prod.s3.ap-southeast-1.amazonaws.com/images/1709523954504_131.webp' }] }, options: 'A. Best of all|B. For example|C. In any event|D. As a matter of fact', number_of_question: 133, audio: null, images: null },
      { content: null, question_part: '6', parent_question: { id: 'vez-u2w-CexAMOwvOYiiF', content: '', audio: null, images: [{ image_path: 'https://sterlingo-toeic-bucket-prod.s3.ap-southeast-1.amazonaws.com/images/1709523954504_131.webp' }] }, options: 'A. we|B. they|C. both|D. yours', number_of_question: 134, audio: null, images: null },
      { content: 'Where is the information most likely found?', question_part: '7', parent_question: { id: 'ji_1EPpUFWJvw3kAXEEQZ', content: '', audio: null, images: [{ image_path: 'https://sterlingo-toeic-bucket-prod.s3.ap-southeast-1.amazonaws.com/images/1709524950799_147.webp' }] }, options: 'A. On a door|B. On a receipt|C. In a box|D. On a Web site', number_of_question: 147, audio: null, images: null },
      { content: 'What kind of item is most likely discussed?', question_part: '7', parent_question: { id: 'ji_1EPpUFWJvw3kAXEEQZ', content: '', audio: null, images: [{ image_path: 'https://sterlingo-toeic-bucket-prod.s3.ap-southeast-1.amazonaws.com/images/1709524950799_147.webp' }] }, options: 'A. A desktop computer|B. A piece of furniture|C. A household appliance|D. A power tool', number_of_question: 148, audio: null, images: null },
      { content: 'What is suggested by the schedule?', question_part: '7', parent_question: { id: '5o7tzf2Qcxz_cldXqGvxd', content: '', audio: null, images: [{ image_path: 'https://sterlingo-toeic-bucket-prod.s3.ap-southeast-1.amazonaws.com/images/1709525061380_149.webp' }] }, options: 'A. A conference has been scheduled.|B. A firm has offices in two time zones.|C. Administrative assistants make travel plans.|D. Some meeting times have been changed.', number_of_question: 149, audio: null, images: null },
      { content: 'What is indicated about 11:00 a.m. Winnipeg time?', question_part: '7', parent_question: { id: '5o7tzf2Qcxz_cldXqGvxd', content: '', audio: null, images: [{ image_path: 'https://sterlingo-toeic-bucket-prod.s3.ap-southeast-1.amazonaws.com/images/1709525061380_149.webp' }] }, options: 'A. It is when the Winnipeg office closes for lunch.|B. It is when staff in Toulouse begin their workday.|C. It is not a preferred time to schedule a meeting.|D. It has just been added to the schedule.', number_of_question: 150, audio: null, images: null }
    ]
  }
};

function getDataFileCandidates(baseName = 'toeic-placement-exam') {
  return [
    path.join(process.cwd(), 'data', `${baseName}.json`),
    path.join(process.cwd(), 'data', `${baseName}.js`),
    path.join(__dirname, `${baseName}.json`),
    path.join(__dirname, `${baseName}.js`)
  ];
}

function parseExternalPayload(raw) {
  const normalized = String(raw || '').replace(/^\uFEFF/, '').trim();

  if (!normalized) {
    return null;
  }

  try {
    return JSON.parse(normalized);
  } catch (jsonError) {
    const exportPrefix = 'module.exports =';
    if (normalized.startsWith(exportPrefix)) {
      const exportedJson = normalized.slice(exportPrefix.length).trim().replace(/;$/, '');
      return JSON.parse(exportedJson);
    }

    throw jsonError;
  }
}

function readExternalPayload(fileCandidates = getDataFileCandidates()) {
  const candidates = fileCandidates
    .filter((candidate) => fs.existsSync(candidate))
    .map((candidate) => {
      try {
        const raw = fs.readFileSync(candidate, 'utf8');
        const payload = parseExternalPayload(raw);
        const questionCount = Array.isArray(payload && payload.data && payload.data.questions)
          ? payload.data.questions.length
          : 0;
        const stats = fs.statSync(candidate);

        return {
          candidate,
          payload,
          questionCount,
          mtimeMs: stats.mtimeMs
        };
      } catch (error) {
        return null;
      }
    })
    .filter(Boolean)
    .sort((left, right) => {
      if (right.questionCount !== left.questionCount) {
        return right.questionCount - left.questionCount;
      }

      return right.mtimeMs - left.mtimeMs;
    });

  if (!candidates.length) {
    return null;
  }

  return candidates[0].payload;
}

function parseOptions(rawOptions, questionNumber) {
  return String(rawOptions || '')
    .split('|')
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item, index) => {
      const match = item.match(/^([A-D])\.\s*(.*)$/i);
      const label = match ? match[1].toUpperCase() : String.fromCharCode(65 + index);
      const text = match ? (match[2] || label) : (/^[A-D]$/i.test(item) ? `Choice ${label}` : item);
      return {
        id: `${questionNumber}-${label}`,
        label,
        text,
        isLetterOnly: /^[A-D]$/i.test(item)
      };
    });
}

function buildQuestionPrompt(question, partNumber, displayOrder) {
  if (question.content) {
    return question.content;
  }

  const fallback = {
    1: `Look at the photograph for question ${displayOrder}.`,
    2: `Listen carefully and choose the best response for question ${displayOrder}.`,
    3: `Listen to the conversation and answer question ${displayOrder}.`,
    4: `Listen to the talk and answer question ${displayOrder}.`,
    5: `Choose the best option to complete question ${displayOrder}.`,
    6: `Choose the best option to complete the text for question ${displayOrder}.`,
    7: `Read the material and answer question ${displayOrder}.`
  };

  return fallback[partNumber] || `Question ${displayOrder}`;
}

function normalizeImages(images) {
  return Array.isArray(images)
    ? images.map((image) => image && image.image_path).filter(Boolean)
    : [];
}

function normalizePayload(rawPayload, options = {}) {
  const {
    answerKey = defaultAnswerKey,
    isDemo = false,
    fallbackPayload = DEMO_RESPONSE,
    fallbackBookName = 'ETS 2024'
  } = options;
  const fallbackExamData = fallbackPayload && fallbackPayload.data ? fallbackPayload.data : DEMO_RESPONSE.data;
  const examData = rawPayload && rawPayload.data ? rawPayload.data : fallbackExamData;
  const rawQuestions = Array.isArray(examData.questions) ? examData.questions : [];
  const sortedQuestions = rawQuestions.slice().sort((a, b) => Number(a.number_of_question) - Number(b.number_of_question));
  const groups = [];
  const groupMap = new Map();
  const flatQuestions = [];

  sortedQuestions.forEach((question) => {
    const number = Number(question.number_of_question);
    const partNumber = Number(question.question_part);
    const partMeta = PART_META[partNumber] || PART_META[7];
    const parent = question.parent_question || null;
    const groupId = parent && parent.id ? parent.id : `single-${number}`;
    const groupImages = normalizeImages(question.images || (parent && parent.images));
    const sharedAudioUrl = question.audio || (parent && parent.audio) || null;

    if (!groupMap.has(groupId)) {
      const nextGroup = {
        id: groupId,
        partNumber,
        skill: partMeta.skill,
        title: partMeta.title,
        instructions: partMeta.instructions,
        sharedContent: (parent && parent.content) || '',
        sharedAudioUrl,
        sharedImages: groupImages,
        questions: []
      };
      groupMap.set(groupId, nextGroup);
      groups.push(nextGroup);
    }

    const normalizedQuestion = {
      id: `q-${number}`,
      number,
      displayOrder: number,
      sourceNumber: number,
      sourceApiExamId: examData.id,
      partNumber,
      skill: partMeta.skill,
      questionFormat: question.question_format || partMeta.title,
      prompt: buildQuestionPrompt(question, partNumber, number),
      options: parseOptions(question.options, number),
      inputName: `question_${number}`,
      correctAnswer: answerKey[number] || null,
      transcriptHtml: question.transcript || (parent && parent.transcript) || '',
      translationHtml: question.translate || (parent && parent.translate) || '',
      explanationHtml: question.explain || '',
      audioUrl: sharedAudioUrl,
      imageUrls: groupImages
    };

    groupMap.get(groupId).questions.push(normalizedQuestion);
    flatQuestions.push(normalizedQuestion);
  });

  const partSummary = Object.entries(PART_META).map(([partNumber, meta]) => {
    const totalQuestions = flatQuestions.filter((question) => question.partNumber === Number(partNumber)).length;
    return {
      partNumber: Number(partNumber),
      title: meta.title,
      instructions: meta.instructions,
      skill: meta.skill,
      totalQuestions
    };
  });

  const listeningCount = flatQuestions.filter((question) => question.skill === 'listening').length;
  const readingCount = flatQuestions.filter((question) => question.skill === 'reading').length;

  return {
    id: examData.id,
    slug: examData.id,
    title: examData.exam_name || 'TOEIC Placement Test',
    bookName: examData.book && examData.book.book_name ? examData.book.book_name : fallbackBookName,
    durationMinutes: 120,
    totalQuestions: flatQuestions.length,
    listeningCount,
    readingCount,
    expectedTotalQuestions: isDemo ? 200 : flatQuestions.length,
    expectedListeningCount: isDemo ? 100 : listeningCount,
    expectedReadingCount: isDemo ? 100 : readingCount,
    groups,
    flatQuestions,
    partSummary,
    isDemo
  };
}

function loadExamFromFiles(options = {}) {
  const {
    fileCandidates = getDataFileCandidates(),
    answerKey = defaultAnswerKey,
    fallbackPayload = DEMO_RESPONSE,
    fallbackBookName = 'ETS 2024',
    allowDemoFallback = true
  } = options;
  const externalPayload = readExternalPayload(fileCandidates);

  if (!externalPayload && !allowDemoFallback) {
    throw new Error(`No valid exam payload found for candidates: ${fileCandidates.join(', ')}`);
  }

  return normalizePayload(externalPayload || fallbackPayload, {
    answerKey,
    isDemo: !externalPayload,
    fallbackPayload,
    fallbackBookName
  });
}

function loadPlacementExam() {
  return loadExamFromFiles({
    fileCandidates: getDataFileCandidates(),
    answerKey: defaultAnswerKey,
    fallbackPayload: DEMO_RESPONSE,
    fallbackBookName: 'ETS 2024',
    allowDemoFallback: true
  });
}

function getExamCard(exam = loadPlacementExam()) {
  return {
    id: exam.id,
    title: exam.title,
    description: 'Bai TOEIC 2 ky nang 200 cau, giao dien hien dai, cham diem va goi y khoa hoc tu dong.',
    durationMinutes: exam.durationMinutes,
    totalQuestions: exam.totalQuestions,
    listeningCount: exam.listeningCount,
    readingCount: exam.readingCount,
    expectedTotalQuestions: exam.expectedTotalQuestions,
    expectedListeningCount: exam.expectedListeningCount,
    expectedReadingCount: exam.expectedReadingCount,
    bookName: exam.bookName,
    isDemo: exam.isDemo
  };
}

module.exports = {
  PART_META,
  loadExamFromFiles,
  loadPlacementExam,
  getExamCard
};
