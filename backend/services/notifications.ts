import nodemailer from "nodemailer";

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter | null {
  if (transporter) return transporter;
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    return transporter;
  }
  return null;
}

export interface NotificationPayload {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export async function sendEmail(payload: NotificationPayload): Promise<boolean> {
  const t = getTransporter();
  if (!t) {
    console.log(`[Email Mock] To: ${payload.to} | Subject: ${payload.subject}`);
    return true;
  }
  try {
    await t.sendMail({
      from: process.env.SMTP_FROM || "noreply@autobroker.et",
      to: payload.to,
      subject: payload.subject,
      text: payload.text,
      html: payload.html || payload.text,
    });
    return true;
  } catch (error) {
    console.error("Email send failed:", error);
    return false;
  }
}

export async function notifyNewLead(lead: { buyerName: string; buyerEmail: string; vehicleBrand: string; vehicleModel: string }, brokerEmail: string) {
  return sendEmail({
    to: brokerEmail,
    subject: `New inquiry about ${lead.vehicleBrand} ${lead.vehicleModel}`,
    text: `You have received a new inquiry from ${lead.buyerName} (${lead.buyerEmail}) about your ${lead.vehicleBrand} ${lead.vehicleModel}.`,
  });
}

export async function notifyListingApproved(vehicleBrand: string, vehicleModel: string, brokerEmail: string) {
  return sendEmail({
    to: brokerEmail,
    subject: `Your listing has been approved`,
    text: `Your ${vehicleBrand} ${vehicleModel} listing has been approved and is now live on the marketplace.`,
  });
}

export async function notifyListingRejected(vehicleBrand: string, vehicleModel: string, reason: string, brokerEmail: string) {
  return sendEmail({
    to: brokerEmail,
    subject: `Your listing requires attention`,
    text: `Your ${vehicleBrand} ${vehicleModel} listing was rejected.\nReason: ${reason}\nPlease update the listing and resubmit.`,
  });
}
