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

function composeLegacyMessage(payload = {}) {
  return [
    `SĐT: ${trimText(payload.phone)}`,
    `Mục tiêu học: ${trimText(payload.goal)}`,
    `Khóa học quan tâm: ${trimText(payload.course_interest)}`,
    `Khung giờ mong muốn: ${trimText(payload.schedule_preference)}`,
    `Kênh phản hồi mong muốn: ${trimText(payload.preferred_contact_method)}`,
    "",
    "Nội dung:",
    trimText(payload.message_body),
  ].join("\n");
}

function readLegacyField(message, label) {
  const source = String(message || "");
  const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const matched = source.match(new RegExp(`^${escapedLabel}:\\s*(.*)$`, "mi"));
  return matched ? trimText(matched[1]) : "";
}

function parseLegacyMessage(message = "") {
  const source = String(message || "");
  const bodyMatch = source.match(/Nội dung:\s*([\s\S]*)$/i);

  return {
    phone: readLegacyField(source, "SĐT"),
    goal: readLegacyField(source, "Mục tiêu học"),
    course_interest: readLegacyField(source, "Khóa học quan tâm"),
    schedule_preference: readLegacyField(source, "Khung giờ mong muốn"),
    preferred_contact_method: readLegacyField(source, "Kênh phản hồi mong muốn"),
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
    is_visible_to_student: raw.is_visible_to_student === undefined ? true : normalizeBoolean(raw.is_visible_to_student),
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
    message: trimText(raw.message),
    message_body: parsed.message_body,
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
    message: composeLegacyMessage(payload),
    status: "new",
    admin_note: "",
    viewed_at: null,
    contacted_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    responses: [],
  };
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
          message,
          status,
          admin_note,
          viewed_at,
          contacted_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'new', '', NULL, NULL)
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
  const fileRecord = buildFilePayload({
    ...record,
    message_body: record.message_body,
  });
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
          m.message,
          m.status,
          m.admin_note,
          m.viewed_at,
          m.contacted_at,
          m.created_at,
          m.updated_at,
          COUNT(r.id) AS response_count
        FROM messages m
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
          m.message,
          m.status,
          m.admin_note,
          m.viewed_at,
          m.contacted_at,
          m.created_at,
          m.updated_at
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

    const messages = rows.map(hydrateMessage);
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
    where.push("user_id = ?");
    params.push(userId);
  }

  if (normalizedEmail) {
    where.push("LOWER(email) = ?");
    params.push(normalizedEmail);
  }

  if (!where.length) {
    return [];
  }

  try {
    const [rows] = await db.query(
      `
        SELECT
          id,
          user_id,
          name,
          email,
          phone,
          goal,
          course_interest,
          schedule_preference,
          preferred_contact_method,
          message,
          status,
          admin_note,
          viewed_at,
          contacted_at,
          created_at,
          updated_at
        FROM messages
        WHERE ${where.join(" OR ")}
        ORDER BY created_at DESC, id DESC
      `,
      params
    );

    const messages = rows.map(hydrateMessage);
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
        SELECT id, user_id, email
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
        title: "Bạn nhận được phản hồi tư vấn từ admin",
        message:
          [
            responseRecord.message_to_student || "Trung tâm vừa cập nhật phản hồi tư vấn mới cho bạn.",
            ...consultationHighlights,
          ]
            .filter(Boolean)
            .join(" "),
        href: "/student/contact",
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
  createConsultationRequest,
  createConsultationResponse,
  listAdminConsultations,
  listStudentConsultations,
  markConsultationViewed,
  saveConsultationNote,
};
