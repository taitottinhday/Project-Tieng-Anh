const crypto = require("crypto");
const express = require("express");
const bcrypt = require("bcrypt");
const db = require("../models/db");
const {
  isMailConfigured,
  sendPasswordResetEmail,
} = require("../services/mailer");
const {
  ensurePlatformSupport,
  syncStudentProfileFromUser,
} = require("../services/platformSupport");

const router = express.Router();
const PASSWORD_RESET_EXPIRY_MINUTES = 30;

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function trimTrailingSlash(value) {
  return String(value || "").trim().replace(/\/+$/, "");
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(email));
}

function rememberRegisterForm(req, { username = "", email = "" } = {}) {
  req.flash("register_username", String(username || "").trim());
  req.flash("register_email", normalizeEmail(email));
}

function rememberForgotPasswordEmail(req, email = "") {
  req.flash("forgot_email", normalizeEmail(email));
}

function buildAuthBaseUrl(req) {
  const configuredAuthBaseUrl = trimTrailingSlash(process.env.AUTH_BASE_URL || "");

  if (configuredAuthBaseUrl) {
    return configuredAuthBaseUrl;
  }

  return `${req.protocol}://${req.get("host")}${req.baseUrl || ""}`;
}

function buildPasswordResetUrl(req, token) {
  return `${buildAuthBaseUrl(req)}/reset-password?token=${encodeURIComponent(token)}`;
}

function hashPasswordResetToken(token) {
  return crypto.createHash("sha256").update(String(token || "")).digest("hex");
}

function maskEmail(email) {
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail.includes("@")) {
    return normalizedEmail;
  }

  const [localPart, domainPart] = normalizedEmail.split("@");
  const visibleLocal = localPart.slice(0, Math.min(3, localPart.length));
  const localMask = localPart.length > visibleLocal.length
    ? "*".repeat(Math.min(4, localPart.length - visibleLocal.length))
    : "";
  const maskedDomain = domainPart.replace(/(^.).*?(\.[^.]+$)/, "$1***$2");

  return `${visibleLocal}${localMask}@${maskedDomain}`;
}

function getProviderLabel(provider) {
  if (provider === "google") {
    return "Google";
  }

  if (provider === "facebook") {
    return "Facebook";
  }

  return "Social";
}

function getOAuthConfig(provider, req) {
  const authBaseUrl = buildAuthBaseUrl(req);

  if (provider === "google") {
    return {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      redirectUri: `${authBaseUrl}/auth/google/callback`,
      authorizationUrl: "https://accounts.google.com/o/oauth2/v2/auth",
      tokenUrl: "https://oauth2.googleapis.com/token",
      scope: "openid email profile",
      authorizationParams: {
        prompt: "select_account",
        include_granted_scopes: "true",
      },
    };
  }

  if (provider === "facebook") {
    return {
      clientId: process.env.FACEBOOK_CLIENT_ID || "",
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET || "",
      redirectUri: `${authBaseUrl}/auth/facebook/callback`,
      authorizationUrl: "https://www.facebook.com/v19.0/dialog/oauth",
      tokenUrl: "https://graph.facebook.com/v19.0/oauth/access_token",
      scope: "email public_profile",
      authorizationParams: {},
    };
  }

  return null;
}

function isOAuthConfigured(provider, req) {
  const config = getOAuthConfig(provider, req);
  return Boolean(config?.clientId && config?.clientSecret);
}

function establishSession(req, user) {
  req.session.user = {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
  };
}

function redirectByRole(req, res, user) {
  return res.redirect(getRoleRedirectPath(req, user));
}

function getRoleRedirectPath(req, user) {
  if (user.role === "admin") {
    return req.baseUrl + "/admin";
  }

  if (user.role === "teacher") {
    return req.baseUrl + "/teacher/dashboard";
  }

  return req.baseUrl + "/";
}

function renderOAuthPopupResult(res, { redirectTo = "/", closeDelay = 120 } = {}) {
  const safeRedirectTo = JSON.stringify(String(redirectTo || "/"));
  const safeCloseDelay = Number.isFinite(closeDelay) ? Math.max(0, closeDelay) : 120;

  return res.send(`<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>Hoàn tất đăng nhập</title>
</head>
<body>
  <script>
    (function () {
      var redirectTo = ${safeRedirectTo};
      var closeDelay = ${safeCloseDelay};

      try {
        if (window.opener && !window.opener.closed) {
          window.opener.location.href = redirectTo;
        } else {
          window.location.replace(redirectTo);
          return;
        }
      } catch (error) {
        console.error(error);
        window.location.replace(redirectTo);
        return;
      }

      window.setTimeout(function () {
        window.close();
      }, closeDelay);
    })();
  </script>
  <p>Đang quay lại cửa sổ chính...</p>
</body>
</html>`);
}

function buildAuthorizationSearchParams(config, state) {
  const searchParams = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: "code",
    scope: config.scope,
    state,
  });

  Object.entries(config.authorizationParams || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, String(value));
    }
  });

  return searchParams;
}

function getSyntheticOAuthEmail(provider, providerUserId) {
  const normalizedProvider = String(provider || "").trim().toLowerCase();
  const normalizedProviderUserId = String(providerUserId || "").trim();

  if (!normalizedProvider || !normalizedProviderUserId) {
    return "";
  }

  return `${normalizedProvider}-${normalizedProviderUserId}@oauth.local`;
}

async function exchangeOAuthCode(provider, code, req) {
  const config = getOAuthConfig(provider, req);

  if (!config) {
    throw new Error("OAuth provider is not supported.");
  }

  const bodyParams = new URLSearchParams({
    code,
    client_id: config.clientId,
    client_secret: config.clientSecret,
    redirect_uri: config.redirectUri,
  });

  if (provider === "google") {
    bodyParams.set("grant_type", "authorization_code");
  }

  if (provider === "facebook") {
    const url = new URL(config.tokenUrl);
    url.search = bodyParams.toString();
    const facebookResponse = await fetch(url.toString());

    if (!facebookResponse.ok) {
      const responseText = await facebookResponse.text();
      throw new Error(
        `Unable to exchange facebook authorization code. ${responseText.slice(0, 500)}`
      );
    }

    return facebookResponse.json();
  }

  const tokenResponse = await fetch(config.tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: bodyParams,
  });

  if (!tokenResponse.ok) {
    const responseText = await tokenResponse.text();
    throw new Error(
      `Unable to exchange ${provider} authorization code. ${responseText.slice(0, 500)}`
    );
  }

  return tokenResponse.json();
}

async function getGoogleProfile(accessToken) {
  const response = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("Unable to fetch Google profile.");
  }

  const profile = await response.json();
  return {
    providerUserId: String(profile.id || ""),
    email: normalizeEmail(profile.email),
    username: profile.name || profile.email || "Google User",
  };
}

async function getFacebookProfile(accessToken) {
  const response = await fetch(
    `https://graph.facebook.com/me?fields=id,name,email&access_token=${encodeURIComponent(accessToken)}`
  );

  if (!response.ok) {
    throw new Error("Unable to fetch Facebook profile.");
  }

  const profile = await response.json();
  return {
    providerUserId: String(profile.id || ""),
    email: normalizeEmail(profile.email),
    username: profile.name || profile.email || "Facebook User",
  };
}

async function findOrCreateOAuthUser({ provider, providerUserId, email, username }) {
  await ensurePlatformSupport();

  const normalizedEmail = normalizeEmail(email);
  const resolvedEmail = normalizedEmail || getSyntheticOAuthEmail(provider, providerUserId);

  if (!resolvedEmail) {
    throw new Error("Social account is missing a usable email.");
  }

  const [identityRows] = await db.query(
    `
      SELECT u.id, u.username, u.email, u.role
      FROM user_oauth_identities oi
      INNER JOIN users u ON u.id = oi.user_id
      WHERE oi.provider = ? AND oi.provider_user_id = ?
      LIMIT 1
    `,
    [provider, providerUserId]
  );

  let user = identityRows[0] || null;

  if (!user) {
    const [userRows] = await db.query(
      "SELECT id, username, email, role FROM users WHERE email = ? LIMIT 1",
      [resolvedEmail]
    );

    user = userRows[0] || null;
  }

  if (!user) {
    const randomPassword = crypto.randomBytes(24).toString("hex");
    const passwordHash = await bcrypt.hash(randomPassword, 10);
    const fallbackName = resolvedEmail.split("@")[0];
    const normalizedUsername = String(username || fallbackName).trim().slice(0, 100);

    const [result] = await db.query(
      "INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)",
      [normalizedUsername || fallbackName, resolvedEmail, passwordHash, "user"]
    );

    const [createdRows] = await db.query(
      "SELECT id, username, email, role FROM users WHERE id = ? LIMIT 1",
      [result.insertId]
    );

    user = createdRows[0];
  }

  await db.query(
    `
      INSERT INTO user_oauth_identities (
        user_id,
        provider,
        provider_user_id,
        provider_email
      ) VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        user_id = VALUES(user_id),
        provider_email = VALUES(provider_email)
    `,
    [user.id, provider, providerUserId, normalizedEmail || null]
  );

  await syncStudentProfileFromUser(user);

  return user;
}

async function findUserByEmail(email) {
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail) {
    return null;
  }

  const [rows] = await db.query(
    "SELECT id, username, email, role FROM users WHERE email = ? LIMIT 1",
    [normalizedEmail]
  );

  return rows[0] || null;
}

async function createPasswordResetToken(req, userId) {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + PASSWORD_RESET_EXPIRY_MINUTES * 60 * 1000);

  await db.query(
    `
      UPDATE password_reset_tokens
      SET used_at = NOW()
      WHERE user_id = ? AND used_at IS NULL
    `,
    [userId]
  );

  await db.query(
    `
      INSERT INTO password_reset_tokens (
        user_id,
        token_hash,
        requested_ip,
        user_agent,
        expires_at
      ) VALUES (?, ?, ?, ?, ?)
    `,
    [
      userId,
      hashPasswordResetToken(rawToken),
      req.ip || null,
      String(req.get("user-agent") || "").slice(0, 255) || null,
      expiresAt,
    ]
  );

  return {
    rawToken,
    expiresAt,
  };
}

async function getActivePasswordResetRecord(token) {
  const normalizedToken = String(token || "").trim();

  if (!normalizedToken) {
    return null;
  }

  const [rows] = await db.query(
    `
      SELECT
        prt.id,
        prt.user_id,
        prt.expires_at,
        prt.used_at,
        u.username,
        u.email
      FROM password_reset_tokens prt
      INNER JOIN users u ON u.id = prt.user_id
      WHERE prt.token_hash = ?
        AND prt.used_at IS NULL
        AND prt.expires_at > NOW()
      LIMIT 1
    `,
    [hashPasswordResetToken(normalizedToken)]
  );

  return rows[0] || null;
}

router.get("/register", (req, res) => {
  res.render("auth/register", {
    title: "Đăng ký tài khoản",
    pageTitle: "Đăng ký tài khoản",
    baseUrl: req.baseUrl,
    formData: {
      username: req.flash("register_username")[0] || "",
      email: req.flash("register_email")[0] || "",
    },
  });
});

router.post("/register", async (req, res) => {
  const username = String(req.body.username || "").trim();
  const email = normalizeEmail(req.body.email);
  const password = String(req.body.password || "");
  const notRobotChecked = String(req.body.not_robot || "").trim().toLowerCase() === "on";

  try {
    await ensurePlatformSupport();
    rememberRegisterForm(req, { username, email });

    if (!username || !email || !password) {
      req.flash("error_msg", "Vui lòng nhập đầy đủ tên hiển thị, email và mật khẩu.");
      return res.redirect(req.baseUrl + "/register");
    }

    if (!isValidEmail(email)) {
      req.flash("error_msg", "Email đăng nhập không hợp lệ.");
      return res.redirect(req.baseUrl + "/register");
    }

    if (password.length < 6) {
      req.flash("error_msg", "Mật khẩu cần tối thiểu 6 ký tự.");
      return res.redirect(req.baseUrl + "/register");
    }

    if (!notRobotChecked) {
      req.flash("error_msg", "Vui lòng xác nhận bạn không phải robot trước khi đăng ký.");
      return res.redirect(req.baseUrl + "/register");
    }

    const [existingRows] = await db.query(
      "SELECT id FROM users WHERE email = ? LIMIT 1",
      [email]
    );

    if (existingRows.length) {
      req.flash("error_msg", "Email này đã được đăng ký. Vui lòng dùng email khác hoặc đăng nhập.");
      return res.redirect(req.baseUrl + "/register");
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      "INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)",
      [username, email, passwordHash, "user"]
    );

    const [userRows] = await db.query(
      "SELECT id, username, email, role FROM users WHERE id = ? LIMIT 1",
      [result.insertId]
    );

    await syncStudentProfileFromUser(userRows[0]);
    req.flash("success_msg", "Đăng ký thành công. Bạn có thể đăng nhập ngay.");
    return res.redirect(req.baseUrl + "/login");
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      req.flash("error_msg", "Email này đã có tài khoản. Vui lòng đăng nhập.");
      return res.redirect(req.baseUrl + "/login");
    }

    console.error("register error:", err);
    req.flash("error_msg", "Không thể đăng ký lúc này. Vui lòng thử lại.");
    return res.redirect(req.baseUrl + "/register");
  }
});

router.post("/register/resend-otp", (req, res) => {
  req.flash("info", "Đăng ký đã chuyển sang xác nhận trực tiếp, không còn dùng OTP.");
  return res.redirect(req.baseUrl + "/register");
});

router.post("/register/verify-otp", (req, res) => {
  req.flash("info", "Đăng ký đã chuyển sang xác nhận trực tiếp, không còn dùng OTP.");
  return res.redirect(req.baseUrl + "/register");
});

router.get("/forgot-password", (req, res) => {
  res.render("auth/forgot-password", {
    title: "Quên mật khẩu",
    pageTitle: "Quên mật khẩu",
    baseUrl: req.baseUrl,
    formEmail: req.flash("forgot_email")[0] || "",
    mailConfigured: isMailConfigured(),
  });
});

router.post("/forgot-password", async (req, res) => {
  const email = normalizeEmail(req.body.email);
  const genericSuccessMessage =
    "Nếu email tồn tại trong hệ thống, chúng tôi sẽ gửi liên kết đặt lại mật khẩu trong ít phút.";

  try {
    await ensurePlatformSupport();

    if (!email) {
      rememberForgotPasswordEmail(req, email);
      req.flash("error_msg", "Vui lòng nhập email để nhận liên kết đặt lại mật khẩu.");
      return res.redirect(req.baseUrl + "/forgot-password");
    }

    if (!isValidEmail(email)) {
      rememberForgotPasswordEmail(req, email);
      req.flash("error_msg", "Email chưa đúng định dạng. Vui lòng kiểm tra lại.");
      return res.redirect(req.baseUrl + "/forgot-password");
    }

    if (!isMailConfigured()) {
      rememberForgotPasswordEmail(req, email);
      req.flash(
        "error_msg",
        "Hệ thống chưa sẵn sàng gửi email đặt lại mật khẩu. Vui lòng liên hệ trung tâm để được hỗ trợ nhanh."
      );
      return res.redirect(req.baseUrl + "/forgot-password");
    }

    const user = await findUserByEmail(email);

    if (!user) {
      req.flash("success_msg", genericSuccessMessage);
      return res.redirect(req.baseUrl + "/forgot-password");
    }

    const { rawToken } = await createPasswordResetToken(req, user.id);

    await sendPasswordResetEmail({
      email: user.email,
      username: user.username || user.email,
      resetUrl: buildPasswordResetUrl(req, rawToken),
      expiresInMinutes: PASSWORD_RESET_EXPIRY_MINUTES,
    });

    req.flash("success_msg", genericSuccessMessage);
    return res.redirect(req.baseUrl + "/forgot-password");
  } catch (err) {
    console.error("forgot password error:", err);
    rememberForgotPasswordEmail(req, email);

    const timeoutLikeError = /timed out|timeout|ETIMEDOUT|ECONNRESET|ECONNREFUSED/i.test(
      String(err && (err.message || err.code || err))
    );

    req.flash(
      "error_msg",
      timeoutLikeError
        ? "Kênh gửi email đang phản hồi chậm hoặc chưa kết nối được. Vui lòng thử lại sau ít phút."
        : "Không thể xử lý yêu cầu đặt lại mật khẩu lúc này. Vui lòng thử lại sau ít phút."
    );
    return res.redirect(req.baseUrl + "/forgot-password");
  }
});

router.get("/reset-password", async (req, res) => {
  const token = String(req.query.token || "").trim();

  try {
    await ensurePlatformSupport();

    const resetRecord = await getActivePasswordResetRecord(token);

    if (!resetRecord) {
      req.flash(
        "error_msg",
        "Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu một liên kết mới."
      );
      return res.redirect(req.baseUrl + "/forgot-password");
    }

    return res.render("auth/reset-password", {
      title: "Đặt lại mật khẩu",
      pageTitle: "Đặt lại mật khẩu",
      baseUrl: req.baseUrl,
      token,
      maskedEmail: maskEmail(resetRecord.email),
      expiresMinutes: PASSWORD_RESET_EXPIRY_MINUTES,
    });
  } catch (err) {
    console.error("reset password page error:", err);
    req.flash("error_msg", "Không thể mở liên kết đặt lại mật khẩu lúc này. Vui lòng thử lại.");
    return res.redirect(req.baseUrl + "/forgot-password");
  }
});

router.post("/reset-password", async (req, res) => {
  const token = String(req.body.token || "").trim();
  const password = String(req.body.password || "");
  const confirmPassword = String(req.body.confirmPassword || "");
  const redirectToReset = `${req.baseUrl}/reset-password?token=${encodeURIComponent(token)}`;

  try {
    await ensurePlatformSupport();

    const resetRecord = await getActivePasswordResetRecord(token);

    if (!resetRecord) {
      req.flash(
        "error_msg",
        "Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu một liên kết mới."
      );
      return res.redirect(req.baseUrl + "/forgot-password");
    }

    if (!password) {
      req.flash("error_msg", "Vui lòng nhập mật khẩu mới.");
      return res.redirect(redirectToReset);
    }

    if (password.length < 6) {
      req.flash("error_msg", "Mật khẩu mới cần tối thiểu 6 ký tự.");
      return res.redirect(redirectToReset);
    }

    if (password !== confirmPassword) {
      req.flash("error_msg", "Mật khẩu xác nhận chưa khớp. Vui lòng nhập lại.");
      return res.redirect(redirectToReset);
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await db.query("UPDATE users SET password = ? WHERE id = ?", [
      passwordHash,
      resetRecord.user_id,
    ]);

    await db.query(
      `
        UPDATE password_reset_tokens
        SET used_at = NOW()
        WHERE user_id = ? AND used_at IS NULL
      `,
      [resetRecord.user_id]
    );

    req.flash("success_msg", "Mật khẩu đã được cập nhật. Bạn có thể đăng nhập ngay bằng mật khẩu mới.");
    return res.redirect(req.baseUrl + "/login");
  } catch (err) {
    console.error("reset password submit error:", err);
    req.flash("error_msg", "Không thể cập nhật mật khẩu lúc này. Vui lòng thử lại.");
    return res.redirect(redirectToReset);
  }
});

router.get("/login", (req, res) => {
  const loginEmail = req.flash("login_email")[0] || "";

  res.render("auth/login", {
    title: "Đăng nhập",
    pageTitle: "Đăng nhập",
    baseUrl: req.baseUrl,
    formEmail: loginEmail,
    googleConfigured: isOAuthConfigured("google", req),
    facebookConfigured: isOAuthConfigured("facebook", req),
  });
});

router.post("/login", async (req, res) => {
  const email = normalizeEmail(req.body.email);
  const password = String(req.body.password || "");

  try {
    const [rows] = await db.query(
      "SELECT * FROM users WHERE email = ? LIMIT 1",
      [email]
    );

    if (rows.length === 0) {
      req.flash("login_email", email || "");
      req.flash("error_msg", "Email hoặc mật khẩu không chính xác.");
      return res.redirect(req.baseUrl + "/login");
    }

    const user = rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      req.flash("login_email", email || "");
      req.flash("error_msg", "Email hoặc mật khẩu không chính xác.");
      return res.redirect(req.baseUrl + "/login");
    }

    establishSession(req, user);
    return redirectByRole(req, res, user);
  } catch (err) {
    console.error("login error:", err);
    req.flash("login_email", email || "");
    req.flash("error_msg", "Không thể đăng nhập lúc này. Vui lòng thử lại.");
    return res.redirect(req.baseUrl + "/login");
  }
});

router.get("/auth/:provider(google|facebook)", async (req, res) => {
  const provider = req.params.provider;
  const providerLabel = getProviderLabel(provider);
  const usePopup = provider === "facebook" && String(req.query.popup || "") === "1";

  try {
    if (!isOAuthConfigured(provider, req)) {
      req.flash(
        "error_msg",
        `${providerLabel} OAuth chưa được cấu hình. Điền CLIENT ID và CLIENT SECRET để bật đăng nhập ${providerLabel}.`
      );
      return res.redirect(req.baseUrl + "/login");
    }

    const config = getOAuthConfig(provider, req);
    const state = crypto.randomBytes(20).toString("hex");
    req.session.oauthState = {
      provider,
      value: state,
      popup: usePopup,
    };

    const searchParams = buildAuthorizationSearchParams(config, state);

    if (usePopup) {
      searchParams.set("display", "popup");
    }

    return res.redirect(`${config.authorizationUrl}?${searchParams.toString()}`);
  } catch (err) {
    console.error(`${provider} auth start error:`, err);
    req.flash("error_msg", "Không thể mở đăng nhập social lúc này.");
    return res.redirect(req.baseUrl + "/login");
  }
});

router.get("/auth/facebook/callback", async (req, res, next) => {
  const { code = "", state = "", error = "" } = req.query;

  if (!req.session?.oauthState?.popup) {
    return next();
  }

  try {
    if (
      req.session.oauthState.provider !== "facebook" ||
      req.session.oauthState.value !== state
    ) {
      req.flash("error_msg", "Phien dang nhap Facebook popup khong hop le. Vui long thu lai.");
      req.session.oauthState = null;
      return renderOAuthPopupResult(res, { redirectTo: req.baseUrl + "/login" });
    }

    req.session.oauthState = null;

    if (error) {
      req.flash("error_msg", "Ban da huy dang nhap bang Facebook.");
      return renderOAuthPopupResult(res, { redirectTo: req.baseUrl + "/login" });
    }

    if (!code) {
      req.flash("error_msg", "Khong nhan duoc ma xac thuc tu Facebook.");
      return renderOAuthPopupResult(res, { redirectTo: req.baseUrl + "/login" });
    }

    const tokenPayload = await exchangeOAuthCode("facebook", code, req);
    const profile = await getFacebookProfile(tokenPayload.access_token);

    const user = await findOrCreateOAuthUser({
      provider: "facebook",
      providerUserId: profile.providerUserId,
      email: profile.email,
      username: profile.username,
    });

    establishSession(req, user);

    return renderOAuthPopupResult(res, {
      redirectTo: getRoleRedirectPath(req, user),
    });
  } catch (err) {
    console.error("facebook popup callback error:", err);
    req.flash(
      "error_msg",
      "Khong the hoan tat dang nhap bang Facebook luc nay. Vui long thu lai."
    );
    req.session.oauthState = null;
    return renderOAuthPopupResult(res, { redirectTo: req.baseUrl + "/login" });
  }
});

router.get("/auth/:provider(google|facebook)/callback", async (req, res) => {
  const provider = req.params.provider;
  const providerLabel = getProviderLabel(provider);
  const { code = "", state = "", error = "" } = req.query;

  try {
    if (
      !req.session.oauthState ||
      req.session.oauthState.provider !== provider ||
      req.session.oauthState.value !== state
    ) {
      req.flash("error_msg", "Phiên đăng nhập social không hợp lệ. Vui lòng thử lại.");
      return res.redirect(req.baseUrl + "/login");
    }

    req.session.oauthState = null;

    if (error) {
      req.flash("error_msg", `Bạn đã hủy đăng nhập bằng ${providerLabel}.`);
      return res.redirect(req.baseUrl + "/login");
    }

    if (!code) {
      req.flash("error_msg", `Không nhận được mã xác thực từ ${providerLabel}.`);
      return res.redirect(req.baseUrl + "/login");
    }

    const tokenPayload = await exchangeOAuthCode(provider, code, req);
    const accessToken = tokenPayload.access_token;

    const profile = provider === "google"
      ? await getGoogleProfile(accessToken)
      : await getFacebookProfile(accessToken);

    const user = await findOrCreateOAuthUser({
      provider,
      providerUserId: profile.providerUserId,
      email: profile.email,
      username: profile.username,
    });

    establishSession(req, user);
    return redirectByRole(req, res, user);
  } catch (err) {
    console.error(`${provider} callback error:`, err);
    console.error(`${provider} callback context:`, {
      authBaseUrl: buildAuthBaseUrl(req),
      redirectUri: getOAuthConfig(provider, req)?.redirectUri,
      host: req.get("host"),
      protocol: req.protocol,
    });
    req.flash(
      "error_msg",
      "Không thể hoàn tất đăng nhập bằng Google/Facebook lúc này. Vui lòng thử lại."
    );
    return res.redirect(req.baseUrl + "/login");
  }
});

function isLoggedIn(req, res, next) {
  if (!req.session.user) {
    return res.redirect(req.baseUrl + "/login");
  }
  next();
}

function isAdmin(req, res, next) {
  if (!req.session.user) {
    return res.redirect(req.baseUrl + "/login");
  }

  if (req.session.user.role !== "admin") {
    return res.status(403).send("Access Denied - Admins Only");
  }

  next();
}

function isTeacher(req, res, next) {
  if (!req.session.user) {
    return res.redirect(req.baseUrl + "/login");
  }

  if (req.session.user.role !== "teacher") {
    return res.status(403).send("Access Denied - Teachers Only");
  }

  next();
}

router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    return res.redirect(req.baseUrl + "/login");
  });
});

module.exports = router;
module.exports.isLoggedIn = isLoggedIn;
module.exports.isAdmin = isAdmin;
module.exports.isTeacher = isTeacher;
