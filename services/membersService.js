import {
    addDoc,
    collection,
    doc,
    getDoc,
    getDocs,
    orderBy,
    query,
    serverTimestamp,
    updateDoc,
    where
} from 'firebase/firestore';
import { db } from '../config/firebase';

export const membersService = {
  // Add a new member
  async addMember(memberData) {
    try {
      const memberWithTimestamp = {
        ...memberData,
        status: 'active',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, 'members'), memberWithTimestamp);
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('Error adding member:', error);
      return { success: false, error: error.message };
    }
  },

  // Get all members
  async getAllMembers() {
    try {
      const q = query(collection(db, 'members'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const members = [];
      
      querySnapshot.forEach((doc) => {
        members.push({ id: doc.id, ...doc.data() });
      });
      
      return { success: true, data: members };
    } catch (error) {
      console.error('Error getting members:', error);
      return { success: false, error: error.message };
    }
  },

  // Get active members
  async getActiveMembers() {
    try {
      const q = query(
        collection(db, 'members'), 
        where('status', '==', 'active'),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const members = [];
      
      querySnapshot.forEach((doc) => {
        members.push({ id: doc.id, ...doc.data() });
      });
      
      return { success: true, data: members };
    } catch (error) {
      console.error('Error getting active members:', error);
      return { success: false, error: error.message };
    }
  },

  // Get inactive members
  async getInactiveMembers() {
    try {
      const q = query(
        collection(db, 'members'), 
        where('status', '==', 'inactive'),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const members = [];
      
      querySnapshot.forEach((doc) => {
        members.push({ id: doc.id, ...doc.data() });
      });
      
      return { success: true, data: members };
    } catch (error) {
      console.error('Error getting inactive members:', error);
      return { success: false, error: error.message };
    }
  },

  // Update member
  async updateMember(memberId, updates) {
    try {
      // First get the current member data for history
      const memberRef = doc(db, 'members', memberId);
      const memberDoc = await getDoc(memberRef);
      
      if (memberDoc.exists()) {
        const currentData = memberDoc.data();
        
        // Save to history
        await this.addToHistory(memberId, currentData, updates);
      }
      
      // Update the member
      const updatedData = {
        ...updates,
        updatedAt: serverTimestamp()
      };
      
      await updateDoc(memberRef, updatedData);
      return { success: true };
    } catch (error) {
      console.error('Error updating member:', error);
      return { success: false, error: error.message };
    }
  },

  // Add to members history
  async addToHistory(memberId, previousData, newData) {
    try {
      const historyData = {
        memberId,
        previousData,
        newData,
        editedAt: serverTimestamp(),
        action: 'update'
      };
      
      await addDoc(collection(db, 'membersHistory'), historyData);
      return { success: true };
    } catch (error) {
      console.error('Error adding to history:', error);
      return { success: false, error: error.message };
    }
  },

  // Get member history
  async getMemberHistory(memberId = null) {
    try {
      let q;
      if (memberId) {
        q = query(
          collection(db, 'membersHistory'),
          where('memberId', '==', memberId),
          orderBy('editedAt', 'desc')
        );
      } else {
        q = query(collection(db, 'membersHistory'), orderBy('editedAt', 'desc'));
      }
      
      const querySnapshot = await getDocs(q);
      const history = [];
      
      querySnapshot.forEach((doc) => {
        history.push({ id: doc.id, ...doc.data() });
      });
      
      return { success: true, data: history };
    } catch (error) {
      console.error('Error getting member history:', error);
      return { success: false, error: error.message };
    }
  }
};
