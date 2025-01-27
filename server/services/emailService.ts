import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

export const sendEmail = async (to: string, subject: string, text: string) => {
  try {
    const info = await transporter.sendMail({
      from: `"Stream Platform" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text
    });
    return info;
  } catch (error) {
    console.error('Email send failed:', { to, subject, error });
    throw error;
  }
};
