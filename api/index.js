const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const { getAllPosts, getPostById, createPost, updatePost, deletePost } = require('../services/blogService');
const { verifyPassword, generateToken, verifyToken } = require('../services/authService');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Vercel ke liye CORS update karo
app.use(cors({
  origin: ['https://fast-marketing-app.vercel.app', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json());

// ============ EMAIL TRANSPORTER CONFIGURATION ============
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// ============ CONTACT FORM API ============
app.post('/api/contact', async (req, res) => {
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

// ============ BLOG APIs ============
app.get('/api/blog/posts', (req, res) => {
  try {
    const posts = getAllPosts();
    res.json({ success: true, posts });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch posts' });
  }
});

app.get('/api/blog/posts/:id', (req, res) => {
  try {
    const post = getPostById(req.params.id);
    if (post) {
      res.json({ success: true, post });
    } else {
      res.status(404).json({ success: false, message: 'Post not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch post' });
  }
});

// ============ ADMIN AUTH MIDDLEWARE ============
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

app.post('/api/blog/posts', authenticateAdmin, (req, res) => {
  try {
    const newPost = createPost(req.body);
    res.json({ success: true, post: newPost });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create post' });
  }
});

app.delete('/api/blog/posts/:id', authenticateAdmin, (req, res) => {
  try {
    const deleted = deletePost(req.params.id);
    if (deleted) {
      res.json({ success: true, message: 'Post deleted successfully' });
    } else {
      res.status(404).json({ success: false, message: 'Post not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete post' });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// ✅ Vercel Serverless ke liye export
module.exports = app;