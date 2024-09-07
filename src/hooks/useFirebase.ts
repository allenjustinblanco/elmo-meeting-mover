import { useState, useEffect, useCallback } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  increment,
  arrayUnion,
  getDoc,
} from "firebase/firestore";

export function useFirebase(roomId?: string) {
  const [elmoCount, setElmoCount] = useState(0);
  const [participants, setParticipants] = useState([]);
  const [agenda, setAgenda] = useState([]);
  const [summary, setSummary] = useState({
    startTime: null,
    endTime: null,
    duration: 0,
    decisions: [],
    actionItems: [],
    elmoTimestamps: [],
  });

  const [roomData, setRoomData] = useState({
    elmoCount: 0,
    participants: [],
    agenda: [],
    timer: 0,
    isActive: false,
    currentAgendaItemIndex: 0,
    summary: {
      startTime: null,
      endTime: null,
      duration: 0,
      decisions: [],
      actionItems: [],
      elmoTimestamps: [],
    },
  });

  useEffect(() => {
    if (roomId) {
      const roomRef = doc(db, "rooms", roomId);
      const unsubscribe = onSnapshot(roomRef, (doc) => {
        if (doc.exists()) {
          const data = doc.data() as any;
          setRoomData(data);
          setElmoCount(data.elmoCount || 0);
          setParticipants(data.participants || []);
          setAgenda(data.agenda || []);
          setSummary(
            data.summary || {
              startTime: null,
              endTime: null,
              duration: 0,
              decisions: [],
              actionItems: [],
              elmoTimestamps: [],
            },
          );
        }
      });

      return () => unsubscribe();
    }
  }, [roomId]);

  const getRooms = useCallback(async () => {
    const activeQuery = query(
      collection(db, "rooms"),
      where("status", "==", "active"),
    );
    const archivedQuery = query(
      collection(db, "rooms"),
      where("status", "==", "archived"),
    );

    const activeSnapshot = await getDocs(activeQuery);
    const archivedSnapshot = await getDocs(archivedQuery);

    return {
      active: activeSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
      archived: archivedSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })),
    };
  }, []);

  const createRoom = useCallback(async (name: string, createdBy: string) => {
    const docRef = await addDoc(collection(db, "rooms"), {
      name,
      createdBy,
      status: "active",
      createdAt: serverTimestamp(),
      elmoCount: 0,
      participants: [],
      agenda: [],
      summary: {
        startTime: null,
        endTime: null,
        duration: 0,
        decisions: [],
        actionItems: [],
        elmoTimestamps: [],
      },
    });
    return docRef.id;
  }, []);

  const archiveRoom = useCallback(async (roomId: string) => {
    const roomRef = doc(db, "rooms", roomId);
    await updateDoc(roomRef, {
      status: "archived",
      archivedAt: serverTimestamp(),
    });
  }, []);

  const deleteRoom = useCallback(async (roomId: string) => {
    await deleteDoc(doc(db, "rooms", roomId));
  }, []);

  const addDecision = useCallback(
    async (decision: string) => {
      if (roomId) {
        const roomRef = doc(db, "rooms", roomId);
        await updateDoc(roomRef, {
          "summary.decisions": arrayUnion(decision),
        });
      }
    },
    [roomId],
  );

  const addActionItem = useCallback(
    async (actionItem: string) => {
      if (roomId) {
        const roomRef = doc(db, "rooms", roomId);
        await updateDoc(roomRef, {
          "summary.actionItems": arrayUnion(actionItem),
        });
      }
    },
    [roomId],
  );

  const updateAgenda = useCallback(
    async (newAgenda: string[]) => {
      if (roomId) {
        const roomRef = doc(db, "rooms", roomId);
        await updateDoc(roomRef, {
          agenda: newAgenda,
        });
      }
    },
    [roomId],
  );

  const resetElmoCount = useCallback(async () => {
    if (roomId) {
      const roomRef = doc(db, "rooms", roomId);
      await updateDoc(roomRef, {
        elmoCount: 0,
      });
    }
  }, [roomId]);

  const getRoomData = useCallback(async () => {
    if (!roomId) {
      throw new Error("Room ID is undefined");
    }
    const roomRef = doc(db, "rooms", roomId);
    const roomSnap = await getDoc(roomRef);
    if (roomSnap.exists()) {
      return roomSnap.data();
    } else {
      throw new Error("Room not found");
    }
  }, [roomId]);

  const getNotes = useCallback(async () => {
    if (!roomId) return "";
    const roomRef = doc(db, "rooms", roomId);
    const roomSnap = await getDoc(roomRef);
    return roomSnap.data()?.notes || "";
  }, [roomId]);

  const updateNotes = useCallback(
    async (notes: string) => {
      if (!roomId) return;
      const roomRef = doc(db, "rooms", roomId);
      await updateDoc(roomRef, { notes });
    },
    [roomId],
  );

  const getMessages = useCallback(async () => {
    if (!roomId) return [];
    const messagesCollection = collection(db, "rooms", roomId, "messages");
    const messageSnapshot = await getDocs(messagesCollection);
    return messageSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate() || new Date(),
    })) as ChatMessage[];
  }, [roomId]);

  const sendMessage = useCallback(
    async (userId: string, message: string) => {
      if (!roomId) return;
      const messagesCollection = collection(db, "rooms", roomId, "messages");
      await addDoc(messagesCollection, {
        userId,
        message,
        timestamp: serverTimestamp(),
      });
    },
    [roomId],
  );

  const incrementElmo = useCallback(async () => {
    if (roomId) {
      const roomRef = doc(db, "rooms", roomId);
      const now = new Date().toISOString();

      await updateDoc(roomRef, {
        elmoCount: increment(1),
        "summary.elmoTimestamps": arrayUnion(now),
        lastElmoTimestamp: serverTimestamp(),
      });
    }
  }, [roomId]);

  const joinRoom = useCallback(
    async (userId: string, userName: string) => {
      if (roomId) {
        const roomRef = doc(db, "rooms", roomId);
        await updateDoc(roomRef, {
          participants: arrayUnion({ id: userId, name: userName }),
        });
      }
    },
    [roomId],
  );

  const updateRoomData = useCallback(
    async (data: Partial<typeof roomData>) => {
      if (roomId) {
        const roomRef = doc(db, "rooms", roomId);
        await updateDoc(roomRef, data);
      }
    },
    [roomId],
  );

  const leaveRoom = useCallback(
    async (userId: string) => {
      if (roomId) {
        const roomRef = doc(db, "rooms", roomId);
        await updateDoc(roomRef, {
          participants: roomData.participants.filter((p) => p.id !== userId),
        });
      }
    },
    [roomId, roomData.participants],
  );

  const startMeeting = useCallback(async () => {
    if (roomId) {
      const roomRef = doc(db, "rooms", roomId);
      await updateDoc(roomRef, {
        "summary.startTime": serverTimestamp(),
      });
    }
  }, [roomId]);

  const endMeeting = useCallback(async () => {
    if (roomId) {
      const roomRef = doc(db, "rooms", roomId);
      await updateDoc(roomRef, {
        "summary.endTime": serverTimestamp(),
      });
    }
  }, [roomId]);

  useEffect(() => {
    if (!roomId) return;

    const roomRef = doc(db, "rooms", roomId);
    const unsubscribe = onSnapshot(roomRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setElmoCount(data.elmoCount || 0);
        setParticipants(
          Object.entries(data.participants || {}).map(([id, name]) => ({
            id,
            name: name as string,
          })) as Array<{ id: string; name: string }>,
        );
        setAgenda(data.agenda || []);
      }
    });

    return () => unsubscribe();
  }, [roomId]);

  return {
    elmoCount,
    participants,
    agenda,
    getRooms,
    createRoom,
    archiveRoom,
    deleteRoom,
    incrementElmo,
    joinRoom,
    leaveRoom,
    updateAgenda,
    resetElmoCount,
    getRoomData,
    sendMessage,
    getMessages,
    getNotes,
    updateNotes,
    summary,
    startMeeting,
    endMeeting,
    addDecision,
    addActionItem,
    roomData,
    updateRoomData,
  };
}
