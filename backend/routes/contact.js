// backend/routes/contact.js
router.post('/', async (req, res) => {
  const { name, email, message } = req.body;
  
  // Validate
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'All fields required' });
  }
  
  // Send email (using Nodemailer)
  await sendEmail({
    to: 'info@resort.com',
    subject: `Contact from ${name}`,
    text: message,
    replyTo: email
  });
  
  res.json({ success: true });
});