/**
 * Envoi d'emails - simule par defaut (log console), pret pour un vrai SMTP.
 *
 * Pour activer l'envoi reel, installez nodemailer (`npm install nodemailer`),
 * renseignez SMTP_HOST / SMTP_PORT / SMTP_USER / SMTP_PASS dans .env, puis
 * decommentez le bloc "ENVOI REEL" ci-dessous.
 */
async function sendMail({ to, subject, html }) {
  const isConfigured = Boolean(process.env.SMTP_HOST);

  if (!isConfigured) {
    console.log('--- [EMAIL SIMULE] ---------------------------------');
    console.log('A:', to);
    console.log('Sujet:', subject);
    console.log('Contenu:', html.replace(/<[^>]+>/g, ' ').slice(0, 300));
    console.log('------------------------------------------------------');
    return { simulated: true };
  }

  // --- ENVOI REEL (decommenter apres `npm install nodemailer`) ---------
  // const nodemailer = require('nodemailer');
  // const transporter = nodemailer.createTransport({
  //   host: process.env.SMTP_HOST,
  //   port: Number(process.env.SMTP_PORT || 587),
  //   auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  // });
  // return transporter.sendMail({ from: process.env.MAIL_FROM, to, subject, html });

  return { simulated: true };
}

function bookingConfirmationEmail(booking) {
  return {
    to: booking.client_email,
    subject: 'Confirmation de votre reservation - Cleanova Solutions',
    html: `<h2>Merci ${booking.client_first_name} !</h2>
      <p>Votre reservation pour <strong>${booking.service_name}</strong> le
      ${booking.scheduled_date} a ${booking.scheduled_time} est enregistree.</p>
      <p>Statut: ${booking.status}</p>`,
  };
}

module.exports = { sendMail, bookingConfirmationEmail };
