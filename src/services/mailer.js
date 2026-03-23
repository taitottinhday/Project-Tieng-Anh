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
  return Boolean(settings.user && settings.pass && settings.from && (settings.service || settings.host));
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

async function sendRegistrationOtp({ email, username, otpCode }) {
  const transporter = getTransporter();
  const settings = getMailSettings();

  await transporter.sendMail({
    from: settings.from,
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

module.exports = {
  isMailConfigured,
  sendRegistrationOtp,
};
