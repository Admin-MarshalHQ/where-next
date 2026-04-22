// ============================================
// "Where Next?" — Firebase Integration
// ============================================
// Uses Firebase Firestore for cross-device multiplayer.
// To enable: create a Firebase project, enable Firestore,
// and paste your config below.

const FirebaseService = {
  db: null,
  enabled: false,
  _syncErrorShown: false,

  _notifyUser(msg, type = 'error') {
    if (typeof App !== 'undefined' && typeof App.showToast === 'function') {
      App.showToast(msg, type);
    }
  },

  // Initialize Firebase — replace with your own config
  init() {
    // Check if Firebase SDK is loaded
    if (typeof firebase === 'undefined') return;

    try {
      // =============================================
      // PASTE YOUR FIREBASE CONFIG HERE
      // =============================================
      const firebaseConfig = {
        apiKey: "AIzaSyDvJZ4wsvz7gPpzE_yanQAUtkm0-fa9y4s",
        authDomain: "travelapp-a6b9d.firebaseapp.com",
        projectId: "travelapp-a6b9d",
        storageBucket: "travelapp-a6b9d.firebasestorage.app",
        messagingSenderId: "298828942886",
        appId: "1:298828942886:web:250fe7c5dcac9eed48e0e7",
        measurementId: "G-RF3K74RTL8"
      };
      // =============================================

      if (firebaseConfig.apiKey === "YOUR_API_KEY") return;

      firebase.initializeApp(firebaseConfig);
      this.db = firebase.firestore();
      this.enabled = true;
    } catch (e) {
      console.warn('Firebase init failed:', e);
    }
  },

  // Save player data to Firestore
  async savePlayer(gameId, playerNumber, data) {
    if (!this.enabled) return;

    try {
      const docRef = this.db.collection('games').doc(gameId);
      const playerKey = `player_${playerNumber}`;

      await docRef.set({
        [playerKey]: data,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });

      this._syncErrorShown = false;
    } catch (e) {
      console.warn('Firestore save failed:', e);
      if (!this._syncErrorShown) {
        this._syncErrorShown = true;
        this._notifyUser("Couldn't sync — your progress is saved on this device.");
      }
    }
  },

  // Load game data from Firestore
  async loadGame(gameId) {
    if (!this.enabled) return null;

    try {
      const doc = await this.db.collection('games').doc(gameId).get();
      if (doc.exists) {
        return doc.data();
      }
      return null;
    } catch (e) {
      console.warn('Firestore load failed:', e);
      this._notifyUser("Couldn't reach the game server. You can still play offline.");
      return null;
    }
  },

  // Listen for real-time updates (for comparison view)
  onGameUpdate(gameId, callback) {
    if (!this.enabled) return null;

    return this.db.collection('games').doc(gameId)
      .onSnapshot(doc => {
        if (doc.exists) {
          callback(doc.data());
        }
      }, error => {
        console.warn('Firestore listener error:', error);
        this._notifyUser('Lost connection to the server — refresh to reconnect.');
      });
  }
};
