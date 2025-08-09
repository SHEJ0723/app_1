// Service Worker for offline support
const CACHE_NAME = 'parking-system-v1.0.0'
const STATIC_CACHE = 'static-v1.0.0'
const DYNAMIC_CACHE = 'dynamic-v1.0.0'

// 需要缓存的静态资源
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/favicon.ico'
]

// 需要缓存的API路径
const API_CACHE_PATTERNS = [
  '/api/parking-spots',
  '/api/users',
  '/api/orders',
  '/api/bills',
  '/api/messages'
]

// 安装事件
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...')
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Caching static assets')
        return cache.addAll(STATIC_ASSETS)
      })
      .then(() => {
        console.log('Service Worker installed')
        return self.skipWaiting()
      })
  )
})

// 激活事件
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...')
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => {
        console.log('Service Worker activated')
        return self.clients.claim()
      })
  )
})

// 拦截网络请求
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // 处理API请求
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request))
    return
  }

  // 处理静态资源请求
  if (request.method === 'GET') {
    event.respondWith(handleStaticRequest(request))
    return
  }
})

// 处理API请求
async function handleApiRequest(request) {
  try {
    // 优先尝试网络请求
    const networkResponse = await fetch(request)
    
    // 如果请求成功，缓存响应
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.log('Network failed, trying cache:', request.url)
    
    // 网络失败时，尝试从缓存获取
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    
    // 缓存也没有，返回离线页面
    return getOfflineResponse(request)
  }
}

// 处理静态资源请求
async function handleStaticRequest(request) {
  const cachedResponse = await caches.match(request)
  
  if (cachedResponse) {
    return cachedResponse
  }
  
  try {
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.log('Static resource not found:', request.url)
    return new Response('Resource not found', { status: 404 })
  }
}

// 获取离线响应
async function getOfflineResponse(request) {
  const url = new URL(request.url)
  
  // 对于API请求，返回离线数据
  if (url.pathname.startsWith('/api/')) {
    return new Response(JSON.stringify({
      success: false,
      message: '网络连接失败，请检查网络设置',
      offline: true,
      data: getOfflineData(url.pathname)
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }
  
  // 对于页面请求，返回离线页面
  const offlinePage = await caches.match('/offline.html')
  if (offlinePage) {
    return offlinePage
  }
  
  return new Response('离线模式', {
    status: 200,
    headers: {
      'Content-Type': 'text/html'
    }
  })
}

// 获取离线数据
function getOfflineData(pathname) {
  const offlineData = {
    '/api/parking-spots': {
      data: [
        { id: 1, spot_number: 'A001', zone: 'A', status: '空闲', type: '普通车位' },
        { id: 2, spot_number: 'A002', zone: 'A', status: '空闲', type: '普通车位' },
        { id: 3, spot_number: 'B001', zone: 'B', status: '空闲', type: '普通车位' }
      ],
      total: 3
    },
    '/api/users': {
      data: [],
      total: 0
    },
    '/api/orders': {
      data: [],
      total: 0
    },
    '/api/bills': {
      data: [],
      total: 0
    },
    '/api/messages': {
      data: [],
      total: 0
    }
  }
  
  return offlineData[pathname] || { data: [], total: 0 }
}

// 消息处理
self.addEventListener('message', (event) => {
  const { type, data } = event.data
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting()
      break
    case 'CACHE_DATA':
      cacheData(data)
      break
    case 'CLEAR_CACHE':
      clearCache()
      break
  }
})

// 缓存数据
async function cacheData(data) {
  const cache = await caches.open(DYNAMIC_CACHE)
  const { key, value } = data
  
  const response = new Response(JSON.stringify(value), {
    headers: {
      'Content-Type': 'application/json'
    }
  })
  
  const request = new Request(`/api/cache/${key}`)
  await cache.put(request, response)
}

// 清理缓存
async function clearCache() {
  const cacheNames = await caches.keys()
  await Promise.all(
    cacheNames.map(cacheName => caches.delete(cacheName))
  )
}

// 后台同步
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync())
  }
})

// 执行后台同步
async function doBackgroundSync() {
  try {
    // 这里可以执行需要同步的操作
    console.log('Background sync completed')
  } catch (error) {
    console.error('Background sync failed:', error)
  }
}

// 推送通知
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : '您有新的消息',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: '查看详情',
        icon: '/favicon.ico'
      },
      {
        action: 'close',
        title: '关闭',
        icon: '/favicon.ico'
      }
    ]
  }

  event.waitUntil(
    self.registration.showNotification('智慧停车系统', options)
  )
})

// 通知点击
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    )
  }
}) 