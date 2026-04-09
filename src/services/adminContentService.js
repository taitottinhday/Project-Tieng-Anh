const fs = require("fs");
const path = require("path");
const multer = require("multer");

const PROJECT_ROOT = process.cwd();
const PUBLIC_ROOT = path.join(PROJECT_ROOT, "public");
const DATA_ROOT = path.join(PROJECT_ROOT, "data", "admin-content");
const EXAM_UPLOAD_ROOT = path.join(DATA_ROOT, "exams");
const PUBLIC_RESOURCE_ROOT = path.join(PUBLIC_ROOT, "uploads", "resources");
const MANIFEST_PATH = path.join(DATA_ROOT, "manifest.json");

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
    fs.writeFileSync(MANIFEST_PATH, JSON.stringify({ exams: [], resources: [] }, null, 2), "utf8");
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
  return `/${path.relative(PUBLIC_ROOT, filePath).replace(/\\/g, "/")}`;
}

function normalizeResourceAudience(audience) {
  return String(audience || "").trim().toLowerCase() === "student" ? "student" : "public";
}

function isPathInsideRoot(targetPath, rootPath) {
  const resolvedTarget = path.resolve(targetPath);
  const resolvedRoot = path.resolve(rootPath);
  return resolvedTarget === resolvedRoot || resolvedTarget.startsWith(`${resolvedRoot}${path.sep}`);
}

function resolveManagedAbsolutePath(filePath) {
  const normalized = String(filePath || "").trim();
  if (!normalized) {
    return null;
  }

  let absolutePath = null;

  if (path.isAbsolute(normalized)) {
    absolutePath = path.resolve(normalized);
  } else if (normalized.startsWith("/")) {
    absolutePath = path.resolve(PUBLIC_ROOT, normalized.replace(/^\/+/, ""));
  } else {
    absolutePath = path.resolve(PROJECT_ROOT, normalized);
  }

  if (isPathInsideRoot(absolutePath, EXAM_UPLOAD_ROOT) || isPathInsideRoot(absolutePath, PUBLIC_RESOURCE_ROOT)) {
    return absolutePath;
  }

  return null;
}

function cleanupManagedFile(filePath) {
  const absolutePath = resolveManagedAbsolutePath(filePath);
  if (absolutePath && fs.existsSync(absolutePath)) {
    fs.unlinkSync(absolutePath);
  }
}

function cleanupFiles(filePaths = []) {
  filePaths.forEach((filePath) => cleanupManagedFile(filePath));
}

function getStoredResourcePath(entry = {}) {
  return entry.storedFilePath || entry.publicPath || "";
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
    .sort(
      (left, right) =>
        new Date(right.updatedAt || right.createdAt || 0).getTime() -
        new Date(left.updatedAt || left.createdAt || 0).getTime()
    );
}

function registerUploadedExam({ year, testNumber, title, bookName, dataFile, answerKeyFile }) {
  if (!dataFile || !answerKeyFile) {
    cleanupFiles([dataFile?.path, answerKeyFile?.path]);
    throw new Error("Cần tải lên cả file đề và file answer key.");
  }

  const normalizedYear = Number(year);
  const normalizedTestNumber = Number(testNumber);

  if (!normalizedYear || !normalizedTestNumber) {
    cleanupFiles([dataFile.path, answerKeyFile.path]);
    throw new Error("Năm đề và số test không hợp lệ.");
  }

  const examId = normalizeExamId(normalizedYear, normalizedTestNumber);
  const manifest = readManifest();
  const existingEntry = manifest.exams.find((item) => item.id === examId);
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

  try {
    manifest.exams = manifest.exams.filter((item) => item.id !== examId).concat(nextEntry);
    writeManifest(manifest);
  } catch (error) {
    cleanupFiles([dataFile.path, answerKeyFile.path]);
    throw error;
  }

  if (existingEntry) {
    cleanupFiles([existingEntry.dataFilePath, existingEntry.answerKeyFilePath]);
  }

  return nextEntry;
}

function registerUploadedResource({ title, description, audience, resourceFile }) {
  if (!resourceFile) {
    throw new Error("Cần tải lên ít nhất một tài liệu.");
  }

  const normalizedTitle = String(title || "").trim();
  if (!normalizedTitle) {
    cleanupManagedFile(resourceFile.path);
    throw new Error("Tiêu đề tài liệu là bắt buộc.");
  }

  const manifest = readManifest();
  const timestamp = new Date().toISOString();
  const nextEntry = {
    id: `resource-${Date.now()}-${Math.round(Math.random() * 1e6)}`,
    title: normalizedTitle,
    description: String(description || "").trim() || "",
    audience: normalizeResourceAudience(audience),
    originalName: resourceFile.originalname,
    storedFilePath: toProjectRelativePath(resourceFile.path),
    publicPath: toPublicPath(resourceFile.path),
    mimeType: resourceFile.mimetype || null,
    sizeBytes: Number(resourceFile.size || 0),
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  try {
    manifest.resources = [nextEntry, ...manifest.resources];
    writeManifest(manifest);
  } catch (error) {
    cleanupManagedFile(resourceFile.path);
    throw error;
  }

  return nextEntry;
}

function updateUploadedResource({ id, title, description, audience, resourceFile }) {
  const normalizedId = String(id || "").trim();
  const manifest = readManifest();
  const resourceIndex = manifest.resources.findIndex((item) => item.id === normalizedId);

  if (resourceIndex === -1) {
    cleanupManagedFile(resourceFile?.path);
    throw new Error("Không tìm thấy tài liệu cần cập nhật.");
  }

  const normalizedTitle = String(title || "").trim();
  if (!normalizedTitle) {
    cleanupManagedFile(resourceFile?.path);
    throw new Error("Tiêu đề tài liệu là bắt buộc.");
  }

  const currentEntry = manifest.resources[resourceIndex];
  const nextEntry = {
    ...currentEntry,
    title: normalizedTitle,
    description: String(description || "").trim() || "",
    audience: normalizeResourceAudience(audience || currentEntry.audience),
    originalName: resourceFile?.originalname || currentEntry.originalName || currentEntry.title,
    storedFilePath: resourceFile ? toProjectRelativePath(resourceFile.path) : currentEntry.storedFilePath || "",
    publicPath: resourceFile ? toPublicPath(resourceFile.path) : currentEntry.publicPath,
    mimeType: resourceFile?.mimetype || currentEntry.mimeType || null,
    sizeBytes: resourceFile ? Number(resourceFile.size || 0) : Number(currentEntry.sizeBytes || 0),
    updatedAt: new Date().toISOString(),
  };

  try {
    manifest.resources[resourceIndex] = nextEntry;
    writeManifest(manifest);
  } catch (error) {
    cleanupManagedFile(resourceFile?.path);
    throw error;
  }

  if (resourceFile) {
    cleanupManagedFile(getStoredResourcePath(currentEntry));
  }

  return nextEntry;
}

function deleteUploadedResource(id) {
  const normalizedId = String(id || "").trim();
  const manifest = readManifest();
  const existingEntry = manifest.resources.find((item) => item.id === normalizedId);

  if (!existingEntry) {
    throw new Error("Không tìm thấy tài liệu cần xóa.");
  }

  manifest.resources = manifest.resources.filter((item) => item.id !== normalizedId);
  writeManifest(manifest);
  cleanupManagedFile(getStoredResourcePath(existingEntry));

  return existingEntry;
}

module.exports = {
  MANIFEST_PATH,
  deleteUploadedResource,
  getPublishedResourceEntries,
  getUploadedExamEntries,
  normalizeExamId,
  registerUploadedExam,
  registerUploadedResource,
  updateUploadedResource,
  uploadAdminExamAssets,
  uploadAdminResourceAssets,
};
