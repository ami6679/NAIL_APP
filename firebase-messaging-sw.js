// Service Worker for Firebase Cloud Messaging
// Version: 2.0.0
// This file MUST be in the root directory (same level as index.html)

importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyCjM8Bc5XWERDbmgEKnzV4d89hBovpsH24",
    authDomain: "nail-app-6679.firebaseapp.com",
    projectId: "nail-app-6679",
    storageBucket: "nail-app-6679.firebasestorage.app",
    messagingSenderId: "726553069513",
    appId: "1:726553069513:web:29803b1047c81136c44a18"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase Messaging
const messaging = firebase.messaging();

// Handle background messages (when app is closed/in background)
messaging.onBackgroundMessage((payload) => {
    console.log('Background message received:', payload);

    const notificationTitle = payload.notification.title || 'סלון ציפורניים';
    const notificationOptions = {
        body: payload.notification.body || 'יש לך עדכון חדש',
        icon: '/icon-192.png', // נוסיף אייקון אחר כך
        badge: '/icon-192.png',
        tag: 'appointment-notification',
        requireInteraction: true, // ההתראה תישאר עד שילחצו עליה
        data: payload.data
    };

    return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
    console.log('Notification clicked:', event);
    
    event.notification.close();
    
    // פתיחת האפליקציה
    event.waitUntil(
        clients.openWindow('https://ami6679.github.io/')
    );
});
