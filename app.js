import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, doc, getDoc, updateDoc, onSnapshot, collection, getDocs, setDoc, addDoc, query, orderBy, limit, increment } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCEYfwfZv2Ckpg-uFLRvJkMBRlXA2w_WpI",
    authDomain: "black-terminal-f2c91.firebaseapp.com",
    projectId: "black-terminal-f2c91",
    storageBucket: "black-terminal-f2c91.appspot.com",
    messagingSenderId: "552489994197",
    appId: "1:552489994197:web:7662331264c334ffbadf5c"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const student = localStorage.getItem("studentName");

// --- Initialization ---
export async function initApp() {
    if (!student) { window.location.href = "login.html"; return; }
    
    // Online Status
    const userRef = doc(db, "students", student);
    await updateDoc(userRef, { isOnline: true });
    window.addEventListener("beforeunload", () => updateDoc(userRef, { isOnline: false }));

    loadCache();
    loadStudentAvatars();
    syncData();
}

// --- UI Logic ---
window.togglePanel = () => {
    const panel = document.getElementById('activityPanel');
    panel.classList.toggle('open');
    document.getElementById('overlay-blur').style.display = panel.classList.contains('open') ? 'block' : 'none';
};

// --- Core Functionalities ---
export async function sendSignal() {
    const msg = document.getElementById("shoutInput").value.trim();
    if(!msg || student === "Guest") return;
    const userRef = doc(db, "students", student);
    const snap = await getDoc(userRef);
    if(snap.exists() && (snap.data().xp || 0) >= 50) {
        const data = { user: student, text: msg, avatar: snap.data().photo || `https://api.dicebear.com/7.x/bottts/svg?seed=${student}`, time: Date.now(), likes: 0 };
        await setDoc(doc(db, "interactions", "shoutout"), data);
        await addDoc(collection(db, "shoutouts"), data);
        await updateDoc(userRef, { xp: increment(-50) });
        document.getElementById("shoutInput").value = "";
    } else { alert("Insufficient XP! (Need 50)"); }
}

// ... Yahan par baki functions (triggerChallenge, buyFocusWall, etc.) add karein ...

async function loadStudentAvatars() {
    const scrollContainer = document.getElementById("studentScroll");
    onSnapshot(collection(db, "students"), (snapshot) => {
        scrollContainer.innerHTML = ""; 
        snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const name = docSnap.id;
            const photo = data.photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`;
            const card = document.createElement("div");
            card.className = "student-avatar-card";
            card.innerHTML = `<img src="${photo}" class="scroll-img ${data.isOnline ? 'online' : ''}" alt="${name}"><p class="scroll-name">${name}</p>`;
            scrollContainer.appendChild(card);
        });
    });
}

function loadCache() {
    document.getElementById("uName").innerText = student;
    // Baki cached data load logic...
}

function syncData() {
    // Firebase Listeners yahan rakhein...
    console.log("Terminal Syncing...");
}
