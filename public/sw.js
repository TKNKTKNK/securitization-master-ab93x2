// sw.js : 一時的にSWを完全解除（キャッシュ削除 + 登録解除 + 画面リロード）
self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    try {
      const keys = await caches.keys();
      await Promise.all(keys.map(k => caches.delete(k))); // 全キャッシュ削除
      await self.registration.unregister();               // SW登録解除
      const clients = await self.clients.matchAll({ type:'window' });
      clients.forEach(c => c.navigate(c.url));           // すべてのタブを再読込
    } catch (e) {}
  })());
});
