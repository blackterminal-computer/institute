
importScripts("https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyBNYjdOgZXnHLZ66-MSsfmzuVZ7Ex4m5Os",
  authDomain: "black-d0090.firebaseapp.com",
  databaseURL: "https://black-d0090-default-rtdb.firebaseio.com",
  projectId: "black-d0090",
  storageBucket: "black-d0090.firebasestorage.app",
  messagingSenderId: "262520728205",
  appId: "1:262520728205:web:c95151d5f88da2831890c4"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(payload => {
  const notification = payload.notification || {};
  const title = notification.title || "BlackTerminal Admin";
  const options = {
    body: notification.body || "You have a new notification.",
    icon: "/icon-192.png",
    data: { url: payload.data?.url || "/masterAdmin.html" }
  };

  self.registration.showNotification(title, options);
});

self.addEventListener("notificationclick", event => {
  event.notification.close();

  const target = new URL(
    event.notification.data?.url || "/masterAdmin.html",
    self.location.origin
  );

  if (target.origin !== self.location.origin) return;

  event.waitUntil(clients.openWindow(target.href));
});
