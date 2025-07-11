import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where
} from 'firebase/firestore';
import { db } from '../config/firebase';

export const visitorsService = {
  // Add a new visitor
  async addVisitor(visitorData) {
    try {
      const visitorWithTimestamp = {
        ...visitorData,
        status: 'checked_in',
        checkInTime: serverTimestamp(),
        checkOutTime: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, 'visitors'), visitorWithTimestamp);
      
      // Log activity
      await this.logVisitorActivity(docRef.id, 'check_in', visitorData);
      
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('Error adding visitor:', error);
      return { success: false, error: error.message };
    }
  },

  // Get all visitors
  async getAllVisitors() {
    try {
      const q = query(
        collection(db, 'visitors'),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const visitors = [];
      
      querySnapshot.forEach((doc) => {
        visitors.push({ id: doc.id, ...doc.data() });
      });
      
      return { success: true, data: visitors };
    } catch (error) {
      console.error('Error getting all visitors:', error);
      return { success: false, error: error.message };
    }
  },

  // Get checked-in visitors
  async getCheckedInVisitors() {
    try {
      const q = query(
        collection(db, 'visitors'),
        where('status', '==', 'checked_in'),
        orderBy('checkInTime', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const visitors = [];
      
      querySnapshot.forEach((doc) => {
        visitors.push({ id: doc.id, ...doc.data() });
      });
      
      return { success: true, data: visitors };
    } catch (error) {
      console.error('Error getting checked-in visitors:', error);
      return { success: false, error: error.message };
    }
  },

  // Get visitors history
  async getVisitorsHistory() {
    try {
      const q = query(
        collection(db, 'visitors'),
        orderBy('createdAt', 'desc'),
        limit(100)
      );
      
      const querySnapshot = await getDocs(q);
      const visitors = [];
      
      querySnapshot.forEach((doc) => {
        visitors.push({ id: doc.id, ...doc.data() });
      });
      
      return { success: true, data: visitors };
    } catch (error) {
      console.error('Error getting visitors history:', error);
      return { success: false, error: error.message };
    }
  },

  // Check out visitor
  async checkOutVisitor(visitorId, checkOutData) {
    try {
      const visitorRef = doc(db, 'visitors', visitorId);
      
      // Get visitor data before updating
      const visitorDoc = await getDoc(visitorRef);
      if (!visitorDoc.exists()) {
        return { success: false, error: 'Visitor not found' };
      }
      
      const visitorData = visitorDoc.data();
      
      await updateDoc(visitorRef, {
        status: 'checked_out',
        checkOutTime: serverTimestamp(),
        checkOutBy: checkOutData.checkOutBy,
        updatedAt: serverTimestamp()
      });

      // Log activity with full visitor data
      const logData = {
        ...visitorData,
        checkOutBy: checkOutData.checkOutBy
      };
      await this.logVisitorActivity(visitorId, 'check_out', logData);
      
      return { success: true };
    } catch (error) {
      console.error('Error checking out visitor:', error);
      return { success: false, error: error.message };
    }
  },

  // Search visitors
  async searchVisitors(searchTerm) {
    try {
      const allVisitorsResult = await this.getAllVisitors();
      
      if (!allVisitorsResult.success) {
        return allVisitorsResult;
      }
      
      const filteredVisitors = allVisitorsResult.data.filter(visitor => 
        visitor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        visitor.phone?.includes(searchTerm) ||
        visitor.flatNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        visitor.tower?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        visitor.purpose?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      return { success: true, data: filteredVisitors };
    } catch (error) {
      console.error('Error searching visitors:', error);
      return { success: false, error: error.message };
    }
  },

  // Get visitor by ID
  async getVisitorById(visitorId) {
    try {
      const visitorRef = doc(db, 'visitors', visitorId);
      const visitorSnap = await getDoc(visitorRef);
      
      if (visitorSnap.exists()) {
        return { success: true, data: { id: visitorSnap.id, ...visitorSnap.data() } };
      } else {
        return { success: false, error: 'Visitor not found' };
      }
    } catch (error) {
      console.error('Error getting visitor by ID:', error);
      return { success: false, error: error.message };
    }
  },

  // Get flats by tower for selection
  async getFlatsByTower(tower) {
    try {
      // Import membersService to get member flats
      const { membersService } = await import('./membersService');
      const membersResult = await membersService.getAllMembers();
      
      if (!membersResult.success) {
        return { success: false, error: 'Could not fetch member data' };
      }
      
      const flats = membersResult.data
        .filter(member => member.tower?.toLowerCase() === tower.toLowerCase())
        .map(member => ({
          flatNumber: member.flatNumber,
          tower: member.tower,
          ownerName: member.name,
          phone: member.phone,
          status: member.status
        }));
      
      return { success: true, data: flats };
    } catch (error) {
      console.error('Error getting flats by tower:', error);
      return { success: false, error: error.message };
    }
  },

  // Get all towers
  async getAllTowers() {
    try {
      const { membersService } = await import('./membersService');
      const membersResult = await membersService.getAllMembers();
      
      if (!membersResult.success) {
        return { success: false, error: 'Could not fetch member data' };
      }
      
      const towers = [...new Set(membersResult.data.map(member => member.tower).filter(tower => tower))];
      
      return { success: true, data: towers.sort() };
    } catch (error) {
      console.error('Error getting all towers:', error);
      return { success: false, error: error.message };
    }
  },

  // Get all flats for selection
  async getAllFlats() {
    try {
      // Import membersService to get member flats
      const { membersService } = await import('./membersService');
      const membersResult = await membersService.getAllMembers();
      
      if (!membersResult.success) {
        return { success: false, error: 'Could not fetch member data' };
      }
      
      const flats = membersResult.data
        .map(member => ({
          flatNumber: member.flatNumber,
          tower: member.tower,
          ownerName: member.name,
          phone: member.phone,
          status: member.status
        }))
        .sort((a, b) => {
          // Sort by tower first, then by flat number
          if (a.tower !== b.tower) {
            return a.tower.localeCompare(b.tower);
          }
          return a.flatNumber.localeCompare(b.flatNumber);
        });
      
      return { success: true, data: flats };
    } catch (error) {
      console.error('Error getting all flats:', error);
      return { success: false, error: error.message };
    }
  },

  // Log visitor activity
  async logVisitorActivity(visitorId, activityType, data) {
    try {
      const activityData = {
        visitorId,
        activityType,
        timestamp: serverTimestamp(),
        data,
        createdAt: serverTimestamp()
      };
      
      await addDoc(collection(db, 'visitorActivities'), activityData);
      return { success: true };
    } catch (error) {
      console.error('Error logging visitor activity:', error);
      return { success: false, error: error.message };
    }
  },

  // Get visitor activities/logs
  async getVisitorLogs(visitorId = null) {
    try {
      let q;
      
      if (visitorId) {
        q = query(
          collection(db, 'visitorActivities'),
          where('visitorId', '==', visitorId),
          orderBy('timestamp', 'desc')
        );
      } else {
        q = query(
          collection(db, 'visitorActivities'),
          orderBy('timestamp', 'desc'),
          limit(100)
        );
      }
      
      const querySnapshot = await getDocs(q);
      const activities = [];
      
      querySnapshot.forEach((doc) => {
        activities.push({ id: doc.id, ...doc.data() });
      });
      
      return { success: true, data: activities };
    } catch (error) {
      console.error('Error getting visitor logs:', error);
      return { success: false, error: error.message };
    }
  },

  // Get visitor statistics
  async getVisitorStats() {
    try {
      const [allVisitors, checkedInVisitors] = await Promise.all([
        this.getAllVisitors(),
        this.getCheckedInVisitors()
      ]);

      const stats = {
        totalVisitors: allVisitors.success ? allVisitors.data.length : 0,
        currentlyCheckedIn: checkedInVisitors.success ? checkedInVisitors.data.length : 0,
        todayVisitors: 0,
        thisWeekVisitors: 0
      };

      if (allVisitors.success) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        oneWeekAgo.setHours(0, 0, 0, 0);

        stats.todayVisitors = allVisitors.data.filter(visitor => {
          if (!visitor.checkInTime) return false;
          const checkInDate = new Date(visitor.checkInTime.seconds * 1000);
          return checkInDate >= today;
        }).length;

        stats.thisWeekVisitors = allVisitors.data.filter(visitor => {
          if (!visitor.checkInTime) return false;
          const checkInDate = new Date(visitor.checkInTime.seconds * 1000);
          return checkInDate >= oneWeekAgo;
        }).length;
      }

      return { success: true, data: stats };
    } catch (error) {
      console.error('Error getting visitor stats:', error);
      return { success: false, error: error.message };
    }
  }
};
