const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const { getAllPosts, getPostById, createPost, updatePost, deletePost } = require('../services/blogService');
const { verifyPassword, generateToken, verifyToken } = require('../services/authService');

dotenv.config();

const app = express();

// ✅ CORS - Pehle
app.use(cors({
  origin: ['https://fast-marketing-app.vercel.app', 'http://localhost:5173'],
  credentials: true
}));

// ✅ Body Parser - CORS ke baad, routes se pehle
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Debug middleware - Check if body is received
app.use((req, res, next) => {
  console.log(`📡 ${req.method} ${req.url}`);
  if (req.method === 'POST') {
    console.log('📦 Request body:', req.body);
  }
  next();
});


// ============ ADMIN AUTH MIDDLEWARE (DEFINE PEHLE) ============
const authenticateAdmin = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }
  
  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
  
  next();
};

// ============ CONTACT FORM API ============
app.post('/api/contact', async (req, res) => {
  console.log('📬 Contact API called');
  console.log('📦 Received body:', req.body);
  
  // ✅ Check if body exists
  if (!req.body) {
    return res.status(400).json({ 
      success: false, 
      message: 'Request body is missing' 
    });
  }
  
  const { name, email, phone, service, message } = req.body;
  
  console.log('📬 Contact Form Submission:', { name, email, phone, service, message });
  
  if (!name || !email || !service || !message) {
    return res.status(400).json({ 
      success: false, 
      message: 'Please fill all required fields' 
    });
  }
  
  try {
    const transporter = createTransporter();
    
    const adminMailOptions = {
      from: `"Fast Marketing" <${process.env.EMAIL_USER}>`,
      to: process.env.RECIPIENT_EMAIL,
      subject: `📬 New Contact Form Submission from ${name}`,
      html: `<h2>New Contact Form Submission</h2>
             <p><strong>Name:</strong> ${name}</p>
             <p><strong>Email:</strong> ${email}</p>
             <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
             <p><strong>Service:</strong> ${service}</p>
             <p><strong>Message:</strong> ${message}</p>`
    };
    
    const userMailOptions = {
      from: `"Fast Marketing" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Thank you for contacting Fast Marketing, ${name}!`,
      html: `<h2>Thank you for reaching out!</h2>
             <p>Dear ${name},</p>
             <p>We have received your inquiry and will get back to you within 24 hours.</p>`
    };
    
    await transporter.sendMail(adminMailOptions);
    await transporter.sendMail(userMailOptions);
    
    console.log('✅ Emails sent successfully!');
    res.json({ success: true, message: 'Message sent successfully!' });
    
  } catch (error) {
    console.error('❌ Email error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to send message' });
  }
});

// ============ ADMIN LOGIN API ============
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  
  if (username === process.env.ADMIN_USERNAME && verifyPassword(password)) {
    const token = generateToken();
    res.json({ success: true, token, message: 'Login successful' });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});
// ============ VERIFY TOKEN API ============
app.get('/api/admin/verify', authenticateAdmin, (req, res) => {
  res.json({ success: true, message: 'Token is valid' });
});
// ============ BLOG APIs ============
app.get('/api/blog/posts', async (req, res) => {
  try {
    const posts = await getAllPosts();
    res.json({ success: true, posts });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch posts' });
  }
});

app.get('/api/blog/posts/:id', async (req, res) => {
  try {
    const post = await getPostById(req.params.id);
    if (post) {
      res.json({ success: true, post });
    } else {
      res.status(404).json({ success: false, message: 'Post not found' });
    }
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch post' });
  }
});

// Protected routes (authenticateAdmin ab define ho chuka hai)
app.post('/api/blog/posts', authenticateAdmin, async (req, res) => {
  try {
    const newPost = await createPost(req.body);
    res.json({ success: true, post: newPost });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ success: false, message: 'Failed to create post' });
  }
});

app.delete('/api/blog/posts/:id', authenticateAdmin, async (req, res) => {
  try {
    const deleted = await deletePost(req.params.id);
    if (deleted) {
      res.json({ success: true, message: 'Post deleted successfully' });
    } else {
      res.status(404).json({ success: false, message: 'Post not found' });
    }
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ success: false, message: 'Failed to delete post' });
  }
});

// ============ HEALTH CHECK API ============
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// ============ START SERVER (Local) ============
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  });
}

// ============ VERCEL EXPORT ============
module.exports = app;