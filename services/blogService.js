const { put, list, del, head } = require('@vercel/blob');

const BLOB_KEY = 'blog-posts.json';

// Get all posts
const getAllPosts = async () => {
  try {
    const { blobs } = await list({
      prefix: BLOB_KEY,
    });
    
    if (blobs.length === 0) {
      return [];
    }
    
    const blob = blobs[0];
    const response = await fetch(blob.url);
    const posts = await response.json();
    
    return posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } catch (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
};

// Get single post by ID
const getPostById = async (id) => {
  const posts = await getAllPosts();
  const post = posts.find(p => p.id === parseInt(id));
  
  if (post) {
    post.views = (post.views || 0) + 1;
    await savePosts(posts);
  }
  
  return post;
};

// Save all posts to blob
const savePosts = async (posts) => {
  try {
    await put(BLOB_KEY, JSON.stringify(posts, null, 2), {
      access: 'public',
      addRandomSuffix: false,
    });
    return true;
  } catch (error) {
    console.error('Error saving posts:', error);
    return false;
  }
};

// Create new post
const createPost = async (postData) => {
  const posts = await getAllPosts();
  
  const newId = posts.length > 0 ? Math.max(...posts.map(p => p.id)) + 1 : 1;
  
  const newPost = {
    id: newId,
    ...postData,
    views: 0,
    likes: 0,
    comments: 0,
    createdAt: new Date().toISOString(),
    date: new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  };
  
  posts.push(newPost);
  await savePosts(posts);
  return newPost;
};

// Update existing post
const updatePost = async (id, postData) => {
  const posts = await getAllPosts();
  const index = posts.findIndex(p => p.id === parseInt(id));
  
  if (index !== -1) {
    posts[index] = { ...posts[index], ...postData };
    await savePosts(posts);
    return posts[index];
  }
  
  return null;
};

// Delete post
const deletePost = async (id) => {
  let posts = await getAllPosts();
  const filteredPosts = posts.filter(p => p.id !== parseInt(id));
  
  if (filteredPosts.length !== posts.length) {
    await savePosts(filteredPosts);
    return true;
  }
  
  return false;
};

module.exports = {
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost
};