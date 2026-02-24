// Firebase scripts load karein
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

// Firebase ko initialize karein (Same config use karein jo index.html mein hai)
firebase.initializeApp({
    apiKey: "AIzaSyCEYfwfZv2Ckpg-uFLRvJkMBRlXA2w_WpI",
    authDomain: "black-terminal-f2c91.firebaseapp.com",
    projectId: "black-terminal-f2c91",
    storageBucket: "black-terminal-f2c91.appspot.com",
    messagingSenderId: "552489994197",
    appId: "1:552489994197:web:7662331264c334ffbadf5c"
});

const messaging = firebase.messaging();

// Background Notification handle karne ke liye logic
messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Background message received: ', payload);

    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: 'https://cdn-icons-png.flaticon.com/512/3119/3119338.png', // Yahan apna logo link daal sakte hain
        badge: 'https://cdn-icons-png.flaticon.com/512/3119/3119338.png',
        data: {
            url: payload.data.url || '/index.html' // Click karne par kahan jaye
        }
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});

// Notification click hone par website open karne ka logic
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        clients.openWindow(event.notification.data.url)
    );
});
