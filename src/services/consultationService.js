const fs = require("fs");
const path = require("path");
const db = require("../models/db");
const { createStudentNotification } = require("./studentNotificationService");

const messagesFile = path.join(__dirname, "../data/messages.json");
const MESSAGE_STATUS_ORDER = {
  new: 0,
  viewed: 1,
  contacted: 2,
};
const MESSAGE_CHANNELS = {
  ADMIN_ONLY: "admin_only",
  TEACHER_FEEDBACK: "teacher_feedback",
};

function ensureDataFile() {
  const dir = path.dirname(messagesFile);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (!fs.existsSync(messagesFile)) {
    fs.writeFileSync(messagesFile, "[]");
  }
}

function readFileMessages() {
  try {
    ensureDataFile();
    const raw = JSON.parse(fs.readFileSync(messagesFile, "utf-8"));
    return Array.isArray(raw) ? raw : [];
  } catch (error) {
    console.error("consultationService read file error:", error);
    return [];
  }
}

function writeFileMessages(messages) {
  try {
    ensureDataFile();
    fs.writeFileSync(messagesFile, JSON.stringify(messages, null, 2));
  } catch (error) {
    console.error("consultationService write file error:", error);
  }
}

function trimText(value) {
  return String(value || "").trim();
}

function normalizeStatus(value) {
  const status = trimText(value).toLowerCase();
  return MESSAGE_STATUS_ORDER[status] !== undefined ? status : "new";
}

function normalizeBoolean(value) {
  if (typeof value === "boolean") {
    return value;
  }

  const normalized = trimText(value).toLowerCase();
  return ["1", "true", "on", "yes"].includes(normalized);
}

function normalizeMessageChannel(value) {
  const normalized = trimText(value).toLowerCase();
  return normalized === MESSAGE_CHANNELS.TEACHER_FEEDBACK
    ? MESSAGE_CHANNELS.TEACHER_FEEDBACK
    : MESSAGE_CHANNELS.ADMIN_ONLY;
}

function normalizeOptionalId(value) {
  const numericValue = Number(value || 0);
  return Number.isInteger(numericValue) && numericValue > 0 ? numericValue : null;
}

function readLegacyField(message, label) {
  const source = String(message || "");
  const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const matched = source.match(new RegExp(`^${escapedLabel}:\\s*(.*)$`, "mi"));
  return matched ? trimText(matched[1]) : "";
}

function readLegacyFieldFromLabels(message, labels = []) {
  for (const label of labels) {
    const value = readLegacyField(message, label);
    if (value) {
      return value;
    }
  }

  return "";
}

function composeLegacyMessage(payload = {}) {
  return [
    `SĐT: ${trimText(payload.phone)}`,
    `Mục tiêu học: ${trimText(payload.goal)}`,
    `Khóa học quan tâm: ${trimText(payload.course_interest)}`,
    `Khung giờ mong muốn: ${trimText(payload.schedule_preference)}`,
    `Kênh phản hồi mong muốn: ${trimText(payload.preferred_contact_method)}`,
    `Chi tiết kênh phản hồi: ${trimText(payload.preferred_contact_detail)}`,
    `Luồng tiếp nhận: ${normalizeMessageChannel(payload.message_channel)}`,
    `Giáo viên được góp ý: ${trimText(payload.target_teacher_name)}`,
    `Lớp liên quan: ${trimText(payload.related_class_code)}`,
    `Teacher rating: ${trimText(payload.teacher_feedback_rating)}`,
    "",
    "Nội dung:",
    trimText(payload.message_body),
  ].join("\n");
}

function parseLegacyMessage(message = "") {
  const source = String(message || "");
  const bodyMatch = source.match(/Nội dung:\s*([\s\S]*)$/i);

  return {
    phone: readLegacyFieldFromLabels(source, ["SĐT", "SÄT"]),
    goal: readLegacyFieldFromLabels(source, ["Mục tiêu học", "Má»¥c tiÃªu há»c"]),
    course_interest: readLegacyFieldFromLabels(source, [
      "Khóa học quan tâm",
      "KhÃ³a há»c quan tÃ¢m",
    ]),
    schedule_preference: readLegacyFieldFromLabels(source, [
      "Khung giờ mong muốn",
      "Khung giá» mong muá»‘n",
    ]),
    preferred_contact_method: readLegacyFieldFromLabels(source, [
      "Kênh phản hồi mong muốn",
      "KÃªnh pháº£n há»“i mong muá»‘n",
    ]),
    preferred_contact_detail: readLegacyFieldFromLabels(source, [
      "Chi tiết kênh phản hồi",
      "Chi tiáº¿t kÃªnh pháº£n há»“i",
    ]),
    message_channel: readLegacyFieldFromLabels(source, [
      "Luồng tiếp nhận",
      "Luá»“ng tiáº¿p nháº­n",
    ]),
    target_teacher_name: readLegacyFieldFromLabels(source, [
      "Giáo viên được góp ý",
      "GiÃ¡o viÃªn Ä‘Æ°á»£c gÃ³p Ã½",
    ]),
    related_class_code: readLegacyFieldFromLabels(source, [
      "Lớp liên quan",
      "Lá»›p liÃªn quan",
    ]),
    teacher_feedback_rating: readLegacyFieldFromLabels(source, ["Teacher rating"]),
    message_body: bodyMatch ? trimText(bodyMatch[1]) : trimText(source),
  };
}

function hydrateResponse(raw = {}) {
  return {
    id: raw.id,
    message_id: raw.message_id,
    admin_user_id: raw.admin_user_id || null,
    admin_name: trimText(raw.admin_name) || "Tư vấn viên",
    contact_method: trimText(raw.contact_method),
    contact_location: trimText(raw.contact_location),
    contact_schedule: trimText(raw.contact_schedule),
    request_phone: normalizeBoolean(raw.request_phone),
    message_to_student: trimText(raw.message_to_student),
    is_visible_to_student:
      raw.is_visible_to_student === undefined ? true : normalizeBoolean(raw.is_visible_to_student),
    created_at: raw.created_at || null,
    updated_at: raw.updated_at || null,
  };
}

function hydrateMessage(raw = {}) {
  const parsed = parseLegacyMessage(raw.message);

  return {
    id: raw.id,
    user_id: raw.user_id || null,
    name: trimText(raw.name),
    email: trimText(raw.email),
    phone: trimText(raw.phone) || parsed.phone,
    goal: trimText(raw.goal) || parsed.goal,
    course_interest: trimText(raw.course_interest) || parsed.course_interest,
    schedule_preference: trimText(raw.schedule_preference) || parsed.schedule_preference,
    preferred_contact_method:
      trimText(raw.preferred_contact_method) || parsed.preferred_contact_method,
    preferred_contact_detail:
      trimText(raw.preferred_contact_detail) || parsed.preferred_contact_detail,
    message_channel: normalizeMessageChannel(raw.message_channel || parsed.message_channel),
    target_teacher_id: normalizeOptionalId(raw.target_teacher_id),
    target_teacher_name: trimText(raw.target_teacher_name) || parsed.target_teacher_name,
    target_class_id: normalizeOptionalId(raw.target_class_id),
    related_class_code: trimText(raw.related_class_code) || parsed.related_class_code,
    related_course_name: trimText(raw.related_course_name),
    teacher_feedback_rating:
      trimText(raw.teacher_feedback_rating) || parsed.teacher_feedback_rating,
    message: trimText(raw.message),
    message_body: trimText(raw.message_body) || parsed.message_body,
    status: normalizeStatus(raw.status),
    admin_note: trimText(raw.admin_note),
    viewed_at: raw.viewed_at || null,
    contacted_at: raw.contacted_at || null,
    created_at: raw.created_at || null,
    updated_at: raw.updated_at || null,
    response_count: Number(raw.response_count || 0),
    responses: Array.isArray(raw.responses) ? raw.responses.map(hydrateResponse) : [],
  };
}

function compareMessages(a, b) {
  const statusDelta = (MESSAGE_STATUS_ORDER[a.status] ?? 99) - (MESSAGE_STATUS_ORDER[b.status] ?? 99);

  if (statusDelta !== 0) {
    return statusDelta;
  }

  const timeA = new Date(a.created_at || 0).getTime();
  const timeB = new Date(b.created_at || 0).getTime();
  return timeB - timeA;
}

function compareResponses(a, b) {
  const timeA = new Date(a.created_at || 0).getTime();
  const timeB = new Date(b.created_at || 0).getTime();
  return timeB - timeA;
}

function mapResponsesByMessage(rows = []) {
  return rows.reduce((accumulator, row) => {
    const item = hydrateResponse(row);
    const bucket = accumulator.get(String(item.message_id)) || [];
    bucket.push(item);
    accumulator.set(String(item.message_id), bucket);
    return accumulator;
  }, new Map());
}

async function getResponsesForMessages(messageIds = [], { visibleOnly = false } = {}) {
  if (!messageIds.length) {
    return new Map();
  }

  const placeholders = messageIds.map(() => "?").join(", ");
  const whereVisible = visibleOnly ? " AND is_visible_to_student = 1" : "";
  const [rows] = await db.query(
    `
      SELECT
        id,
        message_id,
        admin_user_id,
        admin_name,
        contact_method,
        contact_location,
        contact_schedule,
        request_phone,
        message_to_student,
        is_visible_to_student,
        created_at,
        updated_at
      FROM message_responses
      WHERE message_id IN (${placeholders})${whereVisible}
      ORDER BY created_at DESC, id DESC
    `,
    messageIds
  );

  return mapResponsesByMessage(rows);
}

function buildFilePayload(payload = {}) {
  const normalizedChannel = normalizeMessageChannel(payload.message_channel);

  return {
    id: Date.now(),
    user_id: payload.user_id || null,
    name: trimText(payload.name),
    email: trimText(payload.email),
    phone: trimText(payload.phone),
    goal: trimText(payload.goal),
    course_interest: trimText(payload.course_interest),
    schedule_preference: trimText(payload.schedule_preference),
    preferred_contact_method: trimText(payload.preferred_contact_method),
    preferred_contact_detail: trimText(payload.preferred_contact_detail),
    message_channel: normalizedChannel,
    target_teacher_id: normalizeOptionalId(payload.target_teacher_id),
    target_teacher_name: trimText(payload.target_teacher_name),
    target_class_id: normalizeOptionalId(payload.target_class_id),
    related_class_code: trimText(payload.related_class_code),
    related_course_name: trimText(payload.related_course_name),
    teacher_feedback_rating: trimText(payload.teacher_feedback_rating),
    message_body: trimText(payload.message_body),
    message: composeLegacyMessage({
      ...payload,
      message_channel: normalizedChannel,
    }),
    status: "new",
    admin_note: "",
    viewed_at: null,
    contacted_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    responses: [],
  };
}

function mapRowsToMessages(rows = []) {
  return rows.map(hydrateMessage);
}

async function createConsultationRequest(payload = {}) {
  const record = {
    user_id: payload.user_id || null,
    name: trimText(payload.name),
    email: trimText(payload.email),
    phone: trimText(payload.phone),
    goal: trimText(payload.goal),
    course_interest: trimText(payload.course_interest),
    schedule_preference: trimText(payload.schedule_preference),
    preferred_contact_method: trimText(payload.preferred_contact_method),
    preferred_contact_detail: trimText(payload.preferred_contact_detail),
    message_channel: normalizeMessageChannel(payload.message_channel),
    target_teacher_id: normalizeOptionalId(payload.target_teacher_id),
    target_teacher_name: trimText(payload.target_teacher_name),
    target_class_id: normalizeOptionalId(payload.target_class_id),
    related_class_code: trimText(payload.related_class_code),
    related_course_name: trimText(payload.related_course_name),
    teacher_feedback_rating: trimText(payload.teacher_feedback_rating),
    message_body: trimText(payload.message_body),
  };

  const fullMessage = composeLegacyMessage(record);

  try {
    const [result] = await db.query(
      `
        INSERT INTO messages (
          user_id,
          name,
          email,
          phone,
          goal,
          course_interest,
          schedule_preference,
          preferred_contact_method,
          message_channel,
          target_teacher_id,
          target_class_id,
          teacher_feedback_rating,
          message,
          status,
          admin_note,
          viewed_at,
          contacted_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'new', '', NULL, NULL)
      `,
      [
        record.user_id,
        record.name,
        record.email || null,
        record.phone || null,
        record.goal || null,
        record.course_interest || null,
        record.schedule_preference || null,
        record.preferred_contact_method || null,
        record.message_channel,
        record.target_teacher_id,
        record.target_class_id,
        record.teacher_feedback_rating || null,
        fullMessage,
      ]
    );

    return {
      storedIn: "db",
      id: result.insertId,
    };
  } catch (error) {
    console.log("[consultation] DB error, using file storage:", error.message);
  }

  const messages = readFileMessages();
  const fileRecord = buildFilePayload(record);
  messages.push(fileRecord);
  writeFileMessages(messages);

  return {
    storedIn: "file",
    id: fileRecord.id,
  };
}

async function listAdminConsultations() {
  try {
    const [rows] = await db.query(
      `
        SELECT
          m.id,
          m.user_id,
          m.name,
          m.email,
          m.phone,
          m.goal,
          m.course_interest,
          m.schedule_preference,
          m.preferred_contact_method,
          m.message_channel,
          m.target_teacher_id,
          m.target_class_id,
          m.teacher_feedback_rating,
          m.message,
          m.status,
          m.admin_note,
          m.viewed_at,
          m.contacted_at,
          m.created_at,
          m.updated_at,
          t.full_name AS target_teacher_name,
          c.code AS related_class_code,
          co.name AS related_course_name,
          COUNT(r.id) AS response_count
        FROM messages m
        LEFT JOIN teachers t ON t.id = m.target_teacher_id
        LEFT JOIN classes c ON c.id = m.target_class_id
        LEFT JOIN courses co ON co.id = c.course_id
        LEFT JOIN message_responses r ON r.message_id = m.id
        GROUP BY
          m.id,
          m.user_id,
          m.name,
          m.email,
          m.phone,
          m.goal,
          m.course_interest,
          m.schedule_preference,
          m.preferred_contact_method,
          m.message_channel,
          m.target_teacher_id,
          m.target_class_id,
          m.teacher_feedback_rating,
          m.message,
          m.status,
          m.admin_note,
          m.viewed_at,
          m.contacted_at,
          m.created_at,
          m.updated_at,
          t.full_name,
          c.code,
          co.name
        ORDER BY
          CASE
            WHEN m.status = 'new' THEN 0
            WHEN m.status = 'viewed' THEN 1
            WHEN m.status = 'contacted' THEN 2
            ELSE 3
          END,
          m.created_at DESC,
          m.id DESC
      `
    );

    const messages = mapRowsToMessages(rows);
    const responsesByMessage = await getResponsesForMessages(messages.map((item) => item.id));

    return messages.map((item) => ({
      ...item,
      responses: (responsesByMessage.get(String(item.id)) || []).sort(compareResponses),
    }));
  } catch (error) {
    console.log("[consultation] Admin list DB error, using file storage:", error.message);
  }

  return readFileMessages().map(hydrateMessage).sort(compareMessages);
}

async function listStudentConsultations({ userId = null, email = "" } = {}) {
  const normalizedEmail = trimText(email).toLowerCase();
  const where = [];
  const params = [];

  if (userId) {
    where.push("m.user_id = ?");
    params.push(userId);
  }

  if (normalizedEmail) {
    where.push("LOWER(m.email) = ?");
    params.push(normalizedEmail);
  }

  if (!where.length) {
    return [];
  }

  try {
    const [rows] = await db.query(
      `
        SELECT
          m.id,
          m.user_id,
          m.name,
          m.email,
          m.phone,
          m.goal,
          m.course_interest,
          m.schedule_preference,
          m.preferred_contact_method,
          m.message_channel,
          m.target_teacher_id,
          m.target_class_id,
          m.teacher_feedback_rating,
          m.message,
          m.status,
          m.admin_note,
          m.viewed_at,
          m.contacted_at,
          m.created_at,
          m.updated_at,
          t.full_name AS target_teacher_name,
          c.code AS related_class_code,
          co.name AS related_course_name
        FROM messages m
        LEFT JOIN teachers t ON t.id = m.target_teacher_id
        LEFT JOIN classes c ON c.id = m.target_class_id
        LEFT JOIN courses co ON co.id = c.course_id
        WHERE ${where.join(" OR ")}
        ORDER BY m.created_at DESC, m.id DESC
      `,
      params
    );

    const messages = mapRowsToMessages(rows);
    const responsesByMessage = await getResponsesForMessages(
      messages.map((item) => item.id),
      { visibleOnly: true }
    );

    return messages.map((item) => ({
      ...item,
      responses: (responsesByMessage.get(String(item.id)) || []).sort(compareResponses),
      response_count: (responsesByMessage.get(String(item.id)) || []).length,
    }));
  } catch (error) {
    console.log("[consultation] Student list DB error, using file storage:", error.message);
  }

  return readFileMessages()
    .map(hydrateMessage)
    .filter((item) => {
      if (userId && String(item.user_id || "") === String(userId)) {
        return true;
      }

      return normalizedEmail && trimText(item.email).toLowerCase() === normalizedEmail;
    })
    .map((item) => ({
      ...item,
      responses: item.responses.filter((response) => response.is_visible_to_student),
    }))
    .sort(compareMessages);
}

async function listTeacherConsultations({ teacherId = null } = {}) {
  const normalizedTeacherId = normalizeOptionalId(teacherId);
  if (!normalizedTeacherId) {
    return [];
  }

  try {
    const [rows] = await db.query(
      `
        SELECT
          m.id,
          m.user_id,
          m.name,
          m.email,
          m.phone,
          m.goal,
          m.course_interest,
          m.schedule_preference,
          m.preferred_contact_method,
          m.message_channel,
          m.target_teacher_id,
          m.target_class_id,
          m.teacher_feedback_rating,
          m.message,
          m.status,
          m.admin_note,
          m.viewed_at,
          m.contacted_at,
          m.created_at,
          m.updated_at,
          t.full_name AS target_teacher_name,
          c.code AS related_class_code,
          co.name AS related_course_name
        FROM messages m
        LEFT JOIN teachers t ON t.id = m.target_teacher_id
        LEFT JOIN classes c ON c.id = m.target_class_id
        LEFT JOIN courses co ON co.id = c.course_id
        WHERE m.message_channel = ? AND m.target_teacher_id = ?
        ORDER BY
          CASE
            WHEN m.status = 'new' THEN 0
            WHEN m.status = 'viewed' THEN 1
            WHEN m.status = 'contacted' THEN 2
            ELSE 3
          END,
          m.created_at DESC,
          m.id DESC
      `,
      [MESSAGE_CHANNELS.TEACHER_FEEDBACK, normalizedTeacherId]
    );

    return mapRowsToMessages(rows);
  } catch (error) {
    console.log("[consultation] Teacher list DB error, using file storage:", error.message);
  }

  return readFileMessages()
    .map(hydrateMessage)
    .filter(
      (item) =>
        item.message_channel === MESSAGE_CHANNELS.TEACHER_FEEDBACK &&
        String(item.target_teacher_id || "") === String(normalizedTeacherId)
    )
    .sort(compareMessages);
}

async function markConsultationViewed(id) {
  try {
    await db.query(
      `
        UPDATE messages
        SET
          status = CASE WHEN status = 'contacted' THEN status ELSE 'viewed' END,
          viewed_at = COALESCE(viewed_at, NOW())
        WHERE id = ?
      `,
      [id]
    );
    return true;
  } catch (error) {
    console.log("[consultation] viewed DB error, using file storage:", error.message);
  }

  const messages = readFileMessages();
  const nextMessages = messages.map((item) => {
    if (String(item.id) !== String(id)) {
      return item;
    }

    return {
      ...item,
      status: item.status === "contacted" ? "contacted" : "viewed",
      viewed_at: item.viewed_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  });
  writeFileMessages(nextMessages);
  return true;
}

async function saveConsultationNote(id, adminNote) {
  const nextNote = trimText(adminNote);

  try {
    await db.query(
      "UPDATE messages SET admin_note = ? WHERE id = ?",
      [nextNote || null, id]
    );
    return true;
  } catch (error) {
    console.log("[consultation] note DB error, using file storage:", error.message);
  }

  const messages = readFileMessages();
  const nextMessages = messages.map((item) => {
    if (String(item.id) !== String(id)) {
      return item;
    }

    return {
      ...item,
      admin_note: nextNote,
      updated_at: new Date().toISOString(),
    };
  });
  writeFileMessages(nextMessages);
  return true;
}

async function createConsultationResponse(id, payload = {}) {
  const responseRecord = {
    admin_user_id: payload.admin_user_id || null,
    admin_name: trimText(payload.admin_name) || "Tư vấn viên",
    contact_method: trimText(payload.contact_method),
    contact_location: trimText(payload.contact_location),
    contact_schedule: trimText(payload.contact_schedule),
    request_phone: normalizeBoolean(payload.request_phone),
    message_to_student: trimText(payload.message_to_student),
    is_visible_to_student: true,
  };

  if (
    !responseRecord.contact_method &&
    !responseRecord.contact_location &&
    !responseRecord.contact_schedule &&
    !responseRecord.request_phone &&
    !responseRecord.message_to_student
  ) {
    const error = new Error("empty_consultation_response");
    error.code = "EMPTY_CONSULTATION_RESPONSE";
    throw error;
  }

  try {
    const [messageRows] = await db.query(
      `
        SELECT id, user_id, email, message_channel
        FROM messages
        WHERE id = ?
        LIMIT 1
      `,
      [id]
    );
    const messageRecord = messageRows[0] || null;

    await db.query(
      `
        INSERT INTO message_responses (
          message_id,
          admin_user_id,
          admin_name,
          contact_method,
          contact_location,
          contact_schedule,
          request_phone,
          message_to_student,
          is_visible_to_student
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
      `,
      [
        id,
        responseRecord.admin_user_id,
        responseRecord.admin_name,
        responseRecord.contact_method || null,
        responseRecord.contact_location || null,
        responseRecord.contact_schedule || null,
        responseRecord.request_phone ? 1 : 0,
        responseRecord.message_to_student || null,
      ]
    );

    await db.query(
      `
        UPDATE messages
        SET
          status = 'contacted',
          contacted_at = NOW(),
          viewed_at = COALESCE(viewed_at, NOW())
        WHERE id = ?
      `,
      [id]
    );

    let targetUserId = Number(messageRecord?.user_id || 0);

    if (!targetUserId && messageRecord?.email) {
      const [userRows] = await db.query(
        `
          SELECT id
          FROM users
          WHERE email = ?
          LIMIT 1
        `,
        [trimText(messageRecord.email)]
      );

      targetUserId = Number(userRows[0]?.id || 0);

      if (targetUserId) {
        await db.query(
          `
            UPDATE messages
            SET user_id = COALESCE(user_id, ?)
            WHERE id = ?
          `,
          [targetUserId, id]
        );
      }
    }

    if (targetUserId) {
      const consultationHighlights = [];
      if (responseRecord.contact_method) {
        consultationHighlights.push(`Kênh liên hệ: ${responseRecord.contact_method}.`);
      }
      if (responseRecord.contact_schedule) {
        consultationHighlights.push(`Khung giờ tư vấn: ${responseRecord.contact_schedule}.`);
      }
      if (responseRecord.contact_location) {
        consultationHighlights.push(`Địa điểm/Luồng tư vấn: ${responseRecord.contact_location}.`);
      }
      if (responseRecord.request_phone) {
        consultationHighlights.push("Trung tâm đang cần thêm số điện thoại hoặc Zalo để hỗ trợ nhanh hơn.");
      }

      await createStudentNotification({
        userId: targetUserId,
        title:
          messageRecord?.message_channel === MESSAGE_CHANNELS.TEACHER_FEEDBACK
            ? "Admin đã phản hồi góp ý của bạn về giáo viên"
            : "Bạn nhận được phản hồi tư vấn từ admin",
        message:
          [
            responseRecord.message_to_student || "Trung tâm vừa cập nhật phản hồi mới cho bạn.",
            ...consultationHighlights,
          ]
            .filter(Boolean)
            .join(" "),
        href: "/student/mailbox",
      });
    }

    return true;
  } catch (error) {
    if (error.code === "EMPTY_CONSULTATION_RESPONSE") {
      throw error;
    }

    console.log("[consultation] response DB error, using file storage:", error.message);
  }

  const messages = readFileMessages();
  const nextMessages = messages.map((item) => {
    if (String(item.id) !== String(id)) {
      return item;
    }

    const responses = Array.isArray(item.responses) ? item.responses : [];
    return {
      ...item,
      status: "contacted",
      viewed_at: item.viewed_at || new Date().toISOString(),
      contacted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      responses: [
        {
          id: Date.now(),
          message_id: item.id,
          ...responseRecord,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        ...responses,
      ],
    };
  });

  writeFileMessages(nextMessages);
  return true;
}

module.exports = {
  MESSAGE_CHANNELS,
  createConsultationRequest,
  createConsultationResponse,
  listAdminConsultations,
  listStudentConsultations,
  listTeacherConsultations,
  markConsultationViewed,
  saveConsultationNote,
};
