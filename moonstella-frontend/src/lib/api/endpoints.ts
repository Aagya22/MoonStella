export const ENDPOINTS = {
  auth: {
    register: '/api/auth/register',
    login: '/api/auth/login',
    me: '/api/auth/me',
    profile: '/api/auth/profile',
    checkUnique: '/api/auth/check-unique',
  },
  upload: {
    image: '/api/upload/image',
  },
  feed: {
    posts: '/api/feed/posts',
    feed: '/api/feed',
  },
  messages: {
    threads: '/api/messages/threads',
  },
  orders: {
    list: '/api/orders',
  },
}