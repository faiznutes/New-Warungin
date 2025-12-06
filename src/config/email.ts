import nodemailer from 'nodemailer';
import env from './env';
import logger from '../utils/logger';

export const emailTransporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_PORT === 465,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

export const sendEmail = async (
  to: string,
  subject: string,
  html: string
): Promise<void> => {
  if (!env.SMTP_HOST || !env.SMTP_USER) {
    logger.warn('Email service not configured');
    return;
  }

  try {
    await emailTransporter.sendMail({
      from: env.SMTP_FROM || env.SMTP_USER,
      to,
      subject,
      html,
    });
    logger.info(`✅ Email sent to ${to}`);
  } catch (error) {
    logger.error('Email sending error:', { error: error.message, stack: error.stack });
    throw error;
  }
};

