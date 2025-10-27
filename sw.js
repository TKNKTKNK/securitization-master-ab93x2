// sw.js  : 一時的にSWを解除＆全キャッシュ削除して自己破棄
self.addEventListener('install', (e) => self.skipWaiting());
self.addEventListener('activate', (e) => {
  e.waitUntil(
    (async () => {
      try {
        // すべてのキャッシュ削除
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
        // このSWの登録解除
        await self.registration.unregister();
        // すべてのクライアントをリロード（真っ白解消）
        const clientsList = await self.clients.matchAll({ type: 'window' });
        clientsList.forEach((c) => c.navigate(c.url));
      } catch (e) {}
    })()
  );
});
