const fs = require("fs");
const path = require("path");
const multer = require("multer");

const PROJECT_ROOT = process.cwd();
const DATA_ROOT = path.join(PROJECT_ROOT, "data", "admin-content");
const EXAM_UPLOAD_ROOT = path.join(DATA_ROOT, "exams");
const MANIFEST_PATH = path.join(DATA_ROOT, "manifest.json");
const PUBLIC_RESOURCE_ROOT = path.join(PROJECT_ROOT, "public", "uploads", "resources");

const EXAM_ALLOWED_EXTENSIONS = new Set([".json", ".js"]);
const RESOURCE_BLOCKED_EXTENSIONS = new Set([
  ".bat",
  ".cmd",
  ".com",
  ".cpl",
  ".exe",
  ".hta",
  ".html",
  ".js",
  ".jse",
  ".msi",
  ".msp",
  ".php",
  ".ps1",
  ".sh",
]);

function ensureAdminContentDirectories() {
  [DATA_ROOT, EXAM_UPLOAD_ROOT, PUBLIC_RESOURCE_ROOT].forEach((directoryPath) => {
    if (!fs.existsSync(directoryPath)) {
      fs.mkdirSync(directoryPath, { recursive: true });
    }
  });

  if (!fs.existsSync(MANIFEST_PATH)) {
    fs.writeFileSync(
      MANIFEST_PATH,
      JSON.stringify({ exams: [], resources: [] }, null, 2),
      "utf8"
    );
  }
}

function readManifest() {
  ensureAdminContentDirectories();

  try {
    const parsed = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));
    return {
      exams: Array.isArray(parsed.exams) ? parsed.exams : [],
      resources: Array.isArray(parsed.resources) ? parsed.resources : [],
    };
  } catch (error) {
    return { exams: [], resources: [] };
  }
}

function writeManifest(manifest) {
  ensureAdminContentDirectories();
  fs.writeFileSync(
    MANIFEST_PATH,
    JSON.stringify(
      {
        exams: Array.isArray(manifest.exams) ? manifest.exams : [],
        resources: Array.isArray(manifest.resources) ? manifest.resources : [],
      },
      null,
      2
    ),
    "utf8"
  );
}

function normalizeExamId(year, testNumber) {
  return `ets-${Number(year)}-test-${Number(testNumber)}`;
}

function getSafeExtension(filename) {
  return path.extname(String(filename || "")).toLowerCase();
}

function buildStoredName(prefix, originalName) {
  return `${prefix}-${Date.now()}-${Math.round(Math.random() * 1e9)}${getSafeExtension(originalName)}`;
}

function toProjectRelativePath(filePath) {
  return path.relative(PROJECT_ROOT, filePath).replace(/\\/g, "/");
}

function toPublicPath(filePath) {
  const publicRoot = path.join(PROJECT_ROOT, "public");
  return `/${path.relative(publicRoot, filePath).replace(/\\/g, "/")}`;
}

function adminExamFileFilter(req, file, cb) {
  const extension = getSafeExtension(file.originalname);

  if (!EXAM_ALLOWED_EXTENSIONS.has(extension)) {
    return cb(new Error("Chỉ hỗ trợ file đề và answer key dạng .json hoặc .js."));
  }

  return cb(null, true);
}

function adminResourceFileFilter(req, file, cb) {
  const extension = getSafeExtension(file.originalname);

  if (RESOURCE_BLOCKED_EXTENSIONS.has(extension)) {
    return cb(new Error("Tệp tài liệu này không được hỗ trợ vì lý do bảo mật."));
  }

  return cb(null, true);
}

const uploadAdminExamAssets = multer({
  storage: multer.diskStorage({
    destination(req, file, cb) {
      ensureAdminContentDirectories();
      cb(null, EXAM_UPLOAD_ROOT);
    },
    filename(req, file, cb) {
      const prefix = file.fieldname === "answer_key_file" ? "answer-key" : "exam-data";
      cb(null, buildStoredName(prefix, file.originalname));
    },
  }),
  fileFilter: adminExamFileFilter,
  limits: {
    files: 2,
    fileSize: 30 * 1024 * 1024,
  },
});

const uploadAdminResourceAssets = multer({
  storage: multer.diskStorage({
    destination(req, file, cb) {
      ensureAdminContentDirectories();
      cb(null, PUBLIC_RESOURCE_ROOT);
    },
    filename(req, file, cb) {
      cb(null, buildStoredName("resource", file.originalname));
    },
  }),
  fileFilter: adminResourceFileFilter,
  limits: {
    files: 1,
    fileSize: 40 * 1024 * 1024,
  },
});

function getUploadedExamEntries() {
  return readManifest()
    .exams
    .slice()
    .sort((left, right) => {
      const yearGap = Number(right.year || 0) - Number(left.year || 0);
      if (yearGap !== 0) {
        return yearGap;
      }

      return Number(left.testNumber || 0) - Number(right.testNumber || 0);
    });
}

function getPublishedResourceEntries() {
  return readManifest()
    .resources
    .slice()
    .sort((left, right) => new Date(right.createdAt || 0).getTime() - new Date(left.createdAt || 0).getTime());
}

function cleanupStoredFile(relativePath) {
  const normalized = String(relativePath || "").trim();
  if (!normalized) {
    return;
  }

  const absolutePath = path.join(PROJECT_ROOT, normalized);
  if (absolutePath.startsWith(EXAM_UPLOAD_ROOT) && fs.existsSync(absolutePath)) {
    fs.unlinkSync(absolutePath);
  }
}

function registerUploadedExam({ year, testNumber, title, bookName, dataFile, answerKeyFile }) {
  if (!dataFile || !answerKeyFile) {
    throw new Error("Cần tải lên cả file đề và file answer key.");
  }

  const normalizedYear = Number(year);
  const normalizedTestNumber = Number(testNumber);

  if (!normalizedYear || !normalizedTestNumber) {
    throw new Error("Năm đề và số test không hợp lệ.");
  }

  const examId = normalizeExamId(normalizedYear, normalizedTestNumber);
  const manifest = readManifest();
  const existingEntry = manifest.exams.find((item) => item.id === examId);

  if (existingEntry) {
    cleanupStoredFile(existingEntry.dataFilePath);
    cleanupStoredFile(existingEntry.answerKeyFilePath);
  }

  const nextEntry = {
    id: examId,
    year: normalizedYear,
    testNumber: normalizedTestNumber,
    title: String(title || "").trim() || `Đề ETS ${normalizedYear} Test ${normalizedTestNumber}`,
    bookName: String(bookName || "").trim() || `ETS ${normalizedYear}`,
    dataFilePath: toProjectRelativePath(dataFile.path),
    answerKeyFilePath: toProjectRelativePath(answerKeyFile.path),
    createdAt: new Date().toISOString(),
  };

  manifest.exams = manifest.exams
    .filter((item) => item.id !== examId)
    .concat(nextEntry);

  writeManifest(manifest);
  return nextEntry;
}

function registerUploadedResource({ title, description, audience, resourceFile }) {
  if (!resourceFile) {
    throw new Error("Cần tải lên ít nhất một tài liệu.");
  }

  const normalizedTitle = String(title || "").trim();
  if (!normalizedTitle) {
    throw new Error("Tiêu đề tài liệu là bắt buộc.");
  }

  const manifest = readManifest();
  const nextEntry = {
    id: `resource-${Date.now()}-${Math.round(Math.random() * 1e6)}`,
    title: normalizedTitle,
    description: String(description || "").trim() || "",
    audience: String(audience || "").trim() || "public",
    originalName: resourceFile.originalname,
    publicPath: toPublicPath(resourceFile.path),
    createdAt: new Date().toISOString(),
  };

  manifest.resources = [nextEntry, ...manifest.resources];
  writeManifest(manifest);
  return nextEntry;
}

module.exports = {
  MANIFEST_PATH,
  normalizeExamId,
  getPublishedResourceEntries,
  getUploadedExamEntries,
  registerUploadedExam,
  registerUploadedResource,
  uploadAdminExamAssets,
  uploadAdminResourceAssets,
};
