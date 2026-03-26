const nodemailer = require("nodemailer");

let cachedTransporter = null;

function getMailSettings() {
  return {
    service: process.env.SMTP_SERVICE || "",
    host: process.env.SMTP_HOST || "",
    port: Number(process.env.SMTP_PORT || 465),
    secure: String(process.env.SMTP_SECURE || "true").toLowerCase() !== "false",
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
    from: process.env.MAIL_FROM || process.env.SMTP_USER || "",
  };
}

function isMailConfigured() {
  const settings = getMailSettings();
  return Boolean(
    settings.user &&
    settings.pass &&
    settings.from &&
    (settings.service || settings.host)
  );
}

function getTransporter() {
  if (cachedTransporter) {
    return cachedTransporter;
  }

  const settings = getMailSettings();

  if (!isMailConfigured()) {
    throw new Error("Cấu hình SMTP chưa đầy đủ.");
  }

  cachedTransporter = nodemailer.createTransport(
    settings.service
      ? {
          service: settings.service,
          auth: {
            user: settings.user,
            pass: settings.pass,
          },
        }
      : {
          host: settings.host,
          port: settings.port,
          secure: settings.secure,
          auth: {
            user: settings.user,
            pass: settings.pass,
          },
        }
  );

  return cachedTransporter;
}

async function sendMailMessage({ to, subject, html }) {
  const transporter = getTransporter();
  const settings = getMailSettings();

  await transporter.sendMail({
    from: settings.from,
    to,
    subject,
    html,
  });
}

async function sendRegistrationOtp({ email, username, otpCode }) {
  await sendMailMessage({
    to: email,
    subject: "Mã OTP xác minh tài khoản học viên",
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.7;color:#102a43">
        <h2 style="margin:0 0 12px;color:#d9485f">Xác minh đăng ký tài khoản</h2>
        <p>Xin chào <strong>${username}</strong>,</p>
        <p>Đây là mã OTP để kích hoạt tài khoản của bạn trên hệ thống học viên:</p>
        <div style="margin:18px 0;padding:16px 20px;border-radius:18px;background:#eff6ff;border:1px solid #bfdbfe;font-size:30px;font-weight:800;letter-spacing:6px;text-align:center;color:#1d4ed8">
          ${otpCode}
        </div>
        <p>Mã có hiệu lực trong <strong>10 phút</strong>. Không chia sẻ mã này cho người khác.</p>
        <p>Nếu bạn không thực hiện đăng ký, vui lòng bỏ qua email này.</p>
      </div>
    `,
  });
}

async function sendPasswordResetEmail({
  email,
  username,
  resetUrl,
  expiresInMinutes = 30,
}) {
  await sendMailMessage({
    to: email,
    subject: "Đặt lại mật khẩu tài khoản học viên",
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.7;color:#102a43;background:#f8fbff;padding:24px">
        <div style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:24px;border:1px solid #dbe7f5;overflow:hidden">
          <div style="padding:28px 28px 20px;background:linear-gradient(90deg,#ff7a59 0%,#ff5d8f 48%,#ffb14a 100%);color:#ffffff">
            <p style="margin:0 0 10px;font-size:13px;letter-spacing:0.14em;text-transform:uppercase;opacity:0.92">ThayTai Student Platform</p>
            <h1 style="margin:0;font-size:28px;line-height:1.2">Đặt lại mật khẩu</h1>
          </div>
          <div style="padding:28px">
            <p>Xin chào <strong>${username}</strong>,</p>
            <p>Chúng tôi vừa nhận được yêu cầu đặt lại mật khẩu cho tài khoản <strong>${email}</strong>.</p>
            <p>Để tiếp tục, vui lòng bấm nút bên dưới. Liên kết này có hiệu lực trong <strong>${expiresInMinutes} phút</strong>.</p>
            <p style="margin:28px 0">
              <a href="${resetUrl}" style="display:inline-block;padding:14px 22px;border-radius:999px;background:#2f78ed;color:#ffffff;text-decoration:none;font-weight:700">Đặt lại mật khẩu</a>
            </p>
            <p>Nếu nút không hoạt động, bạn có thể sao chép đường dẫn sau và mở trong trình duyệt:</p>
            <p style="margin:0 0 18px;word-break:break-word;color:#175cd3">${resetUrl}</p>
            <p>Nếu bạn không yêu cầu đặt lại mật khẩu, chỉ cần bỏ qua email này. Mật khẩu hiện tại của bạn sẽ không bị thay đổi.</p>
          </div>
        </div>
      </div>
    `,
  });
}

module.exports = {
  isMailConfigured,
  sendRegistrationOtp,
  sendPasswordResetEmail,
};
