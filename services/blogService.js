const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../data/posts.json');

// Ensure data directory exists
if (!fs.existsSync(path.join(__dirname, '../data'))) {
  fs.mkdirSync(path.join(__dirname, '../data'));
}

// Initialize posts.json if not exists
if (!fs.existsSync(dataPath)) {
  const initialPosts = [
    {
      id: 1,
      title: "10 Digital Marketing Trends That Will Dominate 2025",
      excerpt: "From AI-powered personalization to voice search optimization, discover the key trends that will shape the future of digital marketing.",
      content: "<p>The digital marketing landscape is evolving faster than ever...</p>",
      category: "Trends",
      author: "Admin",
      date: "March 15, 2025",
      readTime: "8 min read",
      views: 1240,
      likes: 89,
      comments: 23,
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800",
      featured: true,
      tags: ["Digital Marketing", "Trends", "AI"],
      createdAt: new Date().toISOString()
    }
  ];
  fs.writeFileSync(dataPath, JSON.stringify(initialPosts, null, 2));
}

// Read posts from file
const readPosts = () => {
  const data = fs.readFileSync(dataPath);
  return JSON.parse(data);
};

// Write posts to file
const writePosts = (posts) => {
  fs.writeFileSync(dataPath, JSON.stringify(posts, null, 2));
};

// Get all posts
const getAllPosts = () => {
  const posts = readPosts();
  return posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

// Get single post
const getPostById = (id) => {
  const posts = readPosts();
  const post = posts.find(p => p.id === parseInt(id));
  if (post) {
    post.views += 1;
    writePosts(posts);
  }
  return post;
};

// Create new post
const createPost = (postData) => {
  const posts = readPosts();
  const newId = posts.length > 0 ? Math.max(...posts.map(p => p.id)) + 1 : 1;
  
  const newPost = {
    id: newId,
    ...postData,
    views: 0,
    likes: 0,
    comments: 0,
    createdAt: new Date().toISOString(),
    date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  };
  
  posts.push(newPost);
  writePosts(posts);
  return newPost;
};

// Update post
const updatePost = (id, postData) => {
  const posts = readPosts();
  const index = posts.findIndex(p => p.id === parseInt(id));
  
  if (index !== -1) {
    posts[index] = { ...posts[index], ...postData };
    writePosts(posts);
    return posts[index];
  }
  return null;
};

// Delete post
const deletePost = (id) => {
  const posts = readPosts();
  const index = posts.findIndex(p => p.id === parseInt(id));
  
  if (index !== -1) {
    posts.splice(index, 1);
    writePosts(posts);
    return true;
  }
  return false;
};

module.exports = { getAllPosts, getPostById, createPost, updatePost, deletePost };