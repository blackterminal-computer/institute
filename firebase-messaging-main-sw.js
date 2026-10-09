
importScripts("https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyCEYfwfZv2Ckpg-uFLRvJkMBRlXA2w_WpI",
  authDomain: "black-terminal-f2c91.firebaseapp.com",
  databaseURL: "https://black-terminal-f2c91-default-rtdb.firebaseio.com",
  projectId: "black-terminal-f2c91",
  storageBucket: "black-terminal-f2c91.firebasestorage.app",
  messagingSenderId: "552489994197",
  appId: "1:552489994197:web:7662331264c334ffbadf5c"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(payload => {
  const notification = payload.notification || {};
  const title = notification.title || "BlackTerminal";
  const options = {
    body: notification.body || "You have a new message.",
    icon: "/main-icon-192.png",
    data: {
      url: payload.data?.url || "/index.html"
    }
  };

  self.registration.showNotification(title, options);
});

self.addEventListener("notificationclick", event => {
  event.notification.close();

  const target = new URL(
    event.notification.data?.url || "/index.html",
    self.location.origin
  );

  if (target.origin !== self.location.origin) return;

  event.waitUntil(clients.openWindow(target.href));
});

