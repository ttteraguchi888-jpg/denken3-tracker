// ============================================================================
// 電験三種 機械 過去問トレーニング オフライン動作対応 Service Worker
// ============================================================================

const cacheStorageName = 'denken3-kikai-overcome-v2'; // キャッシュストレージの識別名
const cachedAssetUrls = [
  './',
  './kakomon.html',
  './index.html',
  './manifest.json'
]; // オフラインキャッシュ対象のファイルURL配列

// インストール時に全ファイルをキャッシュへ保存
self.addEventListener('install', (installEvent) => { // installEvent: インストールイベント
  installEvent.waitUntil(
    caches.open(cacheStorageName).then((cacheInstance) => { // cacheInstance: キャッシュ本体
      return cacheInstance.addAll(cachedAssetUrls);
    })
  );
  self.skipWaiting();
});

// アクティベート時に古いキャッシュを削除
self.addEventListener('activate', (activateEvent) => { // activateEvent: アクティベートイベント
  activateEvent.waitUntil(
    caches.keys().then((keyList) => { // keyList: 保存されている全キャッシュキー配列
      return Promise.all(
        keyList.map((keyName) => { // keyName: 各キャッシュキー名
          if (keyName !== cacheStorageName) {
            return caches.delete(keyName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 通信リクエスト時にネットワーク優先＋オフライン時はキャッシュ応答（外出先でも常に最新＆圏外動作）
self.addEventListener('fetch', (fetchEvent) => { // fetchEvent: 通信フェッチイベント
  fetchEvent.respondWith(
    fetch(fetchEvent.request)
      .then((networkResponse) => { // networkResponse: ネットワークからのレスポンス
        const clonedResponse = networkResponse.clone(); // clonedResponse: キャッシュ保存用の複製
        caches.open(cacheStorageName).then((cacheInstance) => {
          cacheInstance.put(fetchEvent.request, clonedResponse);
        });
        return networkResponse;
      })
      .catch(() => {
        return caches.match(fetchEvent.request);
      })
  );
});
