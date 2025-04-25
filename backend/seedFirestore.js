// File for testing the functionality of pattern Recognition by using firebase 

/*
// 🔧 File: seedFirestore.js
const admin = require('firebase-admin');

// 🔧 Force emulator connection & project ID
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';

admin.initializeApp({
  projectId: 'routinewise-2025'  // <== 🔐 Use your actual project ID here
});

const db = admin.firestore();

async function seedFirestore() {
  const users = ['demoUser1', 'demoUser2'];

  // Add users to profileData
  const profilePromises = users.map((userId) => {
    return db.collection('profileData').doc(userId).set({
      best_focus_times: ['09:00', '14:00']
    });
  });

  // Add completions for 2 dates per user
  const completionPromises = [];

  const completionsData = [
    {
      date: '2024-04-22',
      entries: [
        {
          task: 'Read research paper',
          startTime: new Date('2024-04-22T09:00:00'),
          completedAt: new Date('2024-04-22T09:45:00')
        },
        {
          task: 'complete assignment 5',
          startTime: new Date('2024-04-22T10:00:00'),
          completedAt: new Date('2024-04-22T11:10:00')
        }
      ]
    },
    {
      date: '2024-04-23',
      entries: [
        {
          task: 'Write a project report',
          startTime: new Date('2024-04-23T13:00:00'),
          completedAt: new Date('2024-04-23T13:40:00')
        },
        {
          task: 'Go to walmart and buy groceries',
          startTime: new Date('2024-04-23T14:00:00'),
          completedAt: new Date('2024-04-23T14:30:00')
        }
      ]
    }
  ];

  users.forEach((userId) => {
    completionsData.forEach(({ date, entries }) => {
      entries.forEach((entry, i) => {
        const docRef = db
          .collection('completions')
          .doc(userId)
          .collection(date)
          .doc(`task${i + 1}`);
        completionPromises.push(docRef.set(entry));
      });
    });
  });

  await Promise.all([...profilePromises, ...completionPromises]);
  console.log('✅ Seeded Firestore with sample data.');
}

seedFirestore();
*/
const admin = require('firebase-admin');

// 🔧 Force emulator connection & project ID
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';

admin.initializeApp({
  projectId: 'routinewise-2025'  // <== 🔐 Use your actual project ID here
});

const db = admin.firestore();
async function seedFirestore() {
    const users = ['demoUser1', 'demoUser2'];
  
    // Add users to profileData
    const profilePromises = users.map((userId) => {
      return db.collection('profileData').doc(userId).set({
        best_focus_times: ['09:00', '14:00']
      });
    });
  
    // User-specific completions data
    const userCompletionsData = {
      demoUser1: [
        {
          date: '2024-04-22',
          entries: [
            {
              task: 'Read research paper (User 1)',
              startTime: new Date('2024-04-22T09:00:00'),
              completedAt: new Date('2024-04-22T09:45:00')
            },
            {
              task: 'complete assignment 5 (User 1)',
              startTime: new Date('2024-04-22T10:00:00'),
              completedAt: new Date('2024-04-22T11:10:00')
            }
          ]
        },
        {
          date: '2024-04-23',
          entries: [
            {
              task: 'Write a project report (User 1)',
              startTime: new Date('2024-04-23T13:00:00'),
              completedAt: new Date('2024-04-23T13:40:00')
            },
            {
              task: 'Go to local market (User 1)',
              startTime: new Date('2024-04-23T14:00:00'),
              completedAt: new Date('2024-04-23T14:30:00')
            }
          ]
        }
      ],
      demoUser2: [
        {
          date: '2024-04-22',
          entries: [
            {
              task: 'Study for exam (User 2)',
              startTime: new Date('2024-04-22T15:00:00'),
              completedAt: new Date('2024-04-22T16:00:00')
            },
            {
              task: 'Code a small utility (User 2)',
              startTime: new Date('2024-04-22T16:30:00'),
              completedAt: new Date('2024-04-22T17:15:00')
            }
          ]
        },
        {
          date: '2024-04-23',
          entries: [
            {
              task: 'Review lecture notes (User 2)',
              startTime: new Date('2024-04-23T10:00:00'),
              completedAt: new Date('2024-04-23T10:30:00')
            },
            {
              task: 'Prepare presentation slides (User 2)',
              startTime: new Date('2024-04-23T11:00:00'),
              completedAt: new Date('2024-04-23T12:00:00')
            }
          ]
        }
      ]
    };
  
    const completionPromises = [];
  
    users.forEach((userId) => {
      const userData = userCompletionsData[userId] || [];
      userData.forEach(({ date, entries }) => {
        entries.forEach((entry, i) => {
          const docRef = db
            .collection('completions')
            .doc(userId)
            .collection(date)
            .doc(`task${i + 1}`);
          completionPromises.push(docRef.set(entry));
        });
      });
    });
  
    await Promise.all([...profilePromises, ...completionPromises]);
    console.log('Seeded Firestore with sample data.');
  }

  seedFirestore().catch(console.error);
