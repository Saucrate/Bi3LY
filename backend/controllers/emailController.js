export const sendEmail = async (req, res) => {
  try {
    // E-posta gönderme işlemi burada yapılacak
    res.json({ message: 'Email sent successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Email sending failed', error: error.message });
  }
};