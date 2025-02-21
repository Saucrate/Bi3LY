import nodemailer from 'nodemailer';

export async function sendVerificationEmail(to) {
  // Ethereal test hesabı oluştur
  let testAccount = await nodemailer.createTestAccount();

  // SMTP ayarları
  let transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: testAccount.user, // Ethereal kullanıcı adı
      pass: testAccount.pass, // Ethereal şifre
    },
  });

  // Doğrulama kodu oluştur
  const verificationCode = generateVerificationCode();

  // E-posta gönderme
  let info = await transporter.sendMail({
    from: '"Verification Service" <verify@example.com>', // Gönderen adresi
    to, // Alıcı
    subject: 'Your Verification Code', // Konu
    text: `Your verification code is: ${verificationCode}`, // Düz metin içeriği
    html: `<b>Your verification code is: ${verificationCode}</b>`, // HTML içeriği
  });

  console.log('Message sent: %s', info.messageId);
  console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

  // Doğrulama kodunu döndür (veritabanında saklamak için)
  return verificationCode;
}

function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Örnek kullanım
sendVerificationEmail('recipient@example.com').catch(console.error);
