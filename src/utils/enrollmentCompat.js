function looksLikeStatusSchemaError(error) {
  const code = String(error?.code || "").trim().toUpperCase();
  const message = String(error?.message || "").toLowerCase();

  if ([
    "ER_NO_DEFAULT_FOR_FIELD",
    "ER_TRUNCATED_WRONG_VALUE",
    "ER_BAD_NULL_ERROR",
    "WARN_DATA_TRUNCATED",
  ].includes(code)) {
    return true;
  }

  return (
    message.includes("status") &&
    (
      message.includes("default") ||
      message.includes("enum") ||
      message.includes("truncated") ||
      message.includes("incorrect") ||
      message.includes("cannot be null")
    )
  );
}

async function findEnrollmentId(db, studentId, classId) {
  const [rows] = await db.query(
    `
      SELECT id
      FROM enrollments
      WHERE student_id = ? AND class_id = ?
      LIMIT 1
    `,
    [studentId, classId]
  );

  return rows[0]?.id || null;
}

async function findOrCreateEnrollment(db, studentId, classId) {
  const existingId = await findEnrollmentId(db, studentId, classId);
  if (existingId) {
    return existingId;
  }

  const attempts = [
    {
      sql: `
        INSERT INTO enrollments (student_id, class_id, status)
        VALUES (?, ?, 'pending')
      `,
      params: [studentId, classId],
    },
    {
      sql: `
        INSERT INTO enrollments (student_id, class_id)
        VALUES (?, ?)
      `,
      params: [studentId, classId],
    },
    {
      sql: `
        INSERT INTO enrollments (student_id, class_id, status)
        VALUES (?, ?, 'active')
      `,
      params: [studentId, classId],
    },
  ];

  let lastError = null;

  for (const attempt of attempts) {
    try {
      const [result] = await db.query(attempt.sql, attempt.params);
      return result.insertId;
    } catch (error) {
      if (String(error?.code || "").toUpperCase() === "ER_DUP_ENTRY") {
        const duplicateId = await findEnrollmentId(db, studentId, classId);
        if (duplicateId) {
          return duplicateId;
        }
      }

      lastError = error;

      if (!looksLikeStatusSchemaError(error)) {
        throw error;
      }
    }
  }

  throw lastError || new Error("Unable to create enrollment.");
}

module.exports = {
  findOrCreateEnrollment,
};
