// Firebase Configuration for CareerGuess Multiplayer
// You need to replace these with your actual Firebase project configuration
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    databaseURL: "https://your-project-id.firebaseio.com", // Example format
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

let db = null;

// Initialize Firebase safely
if (typeof firebase !== 'undefined') {
    try {
        // Only initialize if keys are not placeholders
        if (firebaseConfig.apiKey !== "YOUR_API_KEY") {
            firebase.initializeApp(firebaseConfig);
            db = firebase.database();
        } else {
            console.log("Firebase placeholder keys detected. Multiplayer will run in Simulation Mode.");
        }
    } catch (error) {
        console.error("Firebase initialization failed:", error);
    }
} else {
    console.warn("Firebase SDK not loaded.");
}
