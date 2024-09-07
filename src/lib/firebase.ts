import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAVvZdTD_JjyqneL91a--Ysood3opl6D5o",
  authDomain: "elmo-meeting-mover.firebaseapp.com",
  projectId: "elmo-meeting-mover",
  storageBucket: "elmo-meeting-mover.appspot.com",
  messagingSenderId: "584748335536",
  appId: "1:584748335536:web:3be97a20d6efbe0357d675",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
