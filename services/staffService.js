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

export const staffService = {
  // Add new staff member
  async addStaff(staffData) {
    try {
      const staffWithTimestamp = {
        ...staffData,
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, 'staff'), staffWithTimestamp);
      
      // Log the addition in staff history
      await this.logStaffActivity(docRef.id, 'STAFF_ADDED', { newData: staffData }, staffData.addedBy, staffData.name);
      
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('Error adding staff:', error);
      return { success: false, error: error.message };
    }
  },

  // Get all staff members
  async getAllStaff() {
    try {
      const q = query(
        collection(db, 'staff'),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const staff = [];
      
      querySnapshot.forEach((doc) => {
        staff.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return { success: true, data: staff };
    } catch (error) {
      console.error('Error getting staff:', error);
      return { success: false, error: error.message };
    }
  },

  // Get active staff members
  async getActiveStaff() {
    try {
      const q = query(
        collection(db, 'staff'),
        where('isActive', '==', true),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const staff = [];
      
      querySnapshot.forEach((doc) => {
        staff.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return { success: true, data: staff };
    } catch (error) {
      console.error('Error getting active staff:', error);
      return { success: false, error: error.message };
    }
  },

  // Get inactive staff members
  async getInactiveStaff() {
    try {
      const q = query(
        collection(db, 'staff'),
        where('isActive', '==', false),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const staff = [];
      
      querySnapshot.forEach((doc) => {
        staff.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return { success: true, data: staff };
    } catch (error) {
      console.error('Error getting inactive staff:', error);
      return { success: false, error: error.message };
    }
  },

  // Update staff member
  async updateStaff(staffId, updateData, updatedBy) {
    try {
      const staffRef = doc(db, 'staff', staffId);
      
      // Get current data for history
      const currentDoc = await getDoc(staffRef);
      const currentData = currentDoc.data();
      
      // Find only the fields that actually changed
      const changedFields = {};
      const oldChangedFields = {};
      
      Object.keys(updateData).forEach(key => {
        if (key !== 'updatedAt' && key !== 'updatedBy') {
          // Compare values, handling arrays and objects properly
          const oldValue = currentData[key];
          const newValue = updateData[key];
          
          // Convert to strings for comparison to handle different data types
          const oldStr = JSON.stringify(oldValue);
          const newStr = JSON.stringify(newValue);
          
          if (oldStr !== newStr) {
            changedFields[key] = newValue;
            oldChangedFields[key] = oldValue;
          }
        }
      });
      
      await updateDoc(staffRef, {
        ...updateData,
        updatedAt: serverTimestamp()
      });

      // Only log if there are actual changes
      if (Object.keys(changedFields).length > 0) {
        await this.logStaffActivity(staffId, 'STAFF_UPDATED', {
          oldData: oldChangedFields,
          newData: changedFields
        }, updatedBy, updateData.name || currentData.name);
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error updating staff:', error);
      return { success: false, error: error.message };
    }
  },

  // Check in staff member
  async checkInStaff(staffId, checkInData) {
    try {
      const checkInRecord = {
        staffId,
        action: 'CHECK_IN',
        timestamp: serverTimestamp(),
        ...checkInData
      };
      
      await addDoc(collection(db, 'staff_attendance'), checkInRecord);
      
      return { success: true };
    } catch (error) {
      console.error('Error checking in staff:', error);
      return { success: false, error: error.message };
    }
  },

  // Check out staff member
  async checkOutStaff(staffId, checkOutData) {
    try {
      const checkOutRecord = {
        staffId,
        action: 'CHECK_OUT',
        timestamp: serverTimestamp(),
        ...checkOutData
      };
      
      await addDoc(collection(db, 'staff_attendance'), checkOutRecord);
      
      return { success: true };
    } catch (error) {
      console.error('Error checking out staff:', error);
      return { success: false, error: error.message };
    }
  },

  // Get staff attendance logs
  async getStaffAttendance(staffId = null) {
    try {
      let q;
      
      if (staffId) {
        q = query(
          collection(db, 'staff_attendance'),
          where('staffId', '==', staffId),
          orderBy('timestamp', 'desc')
        );
      } else {
        q = query(
          collection(db, 'staff_attendance'),
          orderBy('timestamp', 'desc')
        );
      }
      
      const querySnapshot = await getDocs(q);
      const attendance = [];
      
      querySnapshot.forEach((doc) => {
        attendance.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return { success: true, data: attendance };
    } catch (error) {
      console.error('Error getting staff attendance:', error);
      return { success: false, error: error.message };
    }
  },

  // Get staff history
  async getStaffHistory(staffId = null) {
    try {
      let q;
      
      if (staffId) {
        q = query(
          collection(db, 'staff_history'),
          where('staffId', '==', staffId),
          orderBy('timestamp', 'desc')
        );
      } else {
        q = query(
          collection(db, 'staff_history'),
          orderBy('timestamp', 'desc')
        );
      }
      
      const querySnapshot = await getDocs(q);
      const history = [];
      
      querySnapshot.forEach((doc) => {
        history.push({
          id: doc.id,
          ...doc.data()
        });
      });

      // If getting all history, fetch staff names for records that don't have them
      if (!staffId) {
        const staffMap = new Map();
        const staffIds = [...new Set(history.filter(h => !h.staffName).map(h => h.staffId))];
        
        if (staffIds.length > 0) {
          const staffPromises = staffIds.map(id => getDoc(doc(db, 'staff', id)));
          const staffDocs = await Promise.all(staffPromises);
          
          staffDocs.forEach((staffDoc, index) => {
            if (staffDoc.exists()) {
              staffMap.set(staffIds[index], staffDoc.data().name);
            }
          });
        }

        // Add staff names to history records
        history.forEach(record => {
          if (!record.staffName && staffMap.has(record.staffId)) {
            record.staffName = staffMap.get(record.staffId);
          }
        });
      }
      
      return { success: true, data: history };
    } catch (error) {
      console.error('Error getting staff history:', error);
      return { success: false, error: error.message };
    }
  },

  // Search staff members
  async searchStaff(searchTerm) {
    try {
      const allStaffResult = await this.getAllStaff();
      
      if (!allStaffResult.success) {
        return allStaffResult;
      }
      
      const filteredStaff = allStaffResult.data.filter(staff =>
        staff.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        staff.phone?.includes(searchTerm) ||
        staff.staffType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        staff.assignedFlats?.some(flat => 
          flat.flatNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          flat.ownerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          flat.tower?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
      
      return { success: true, data: filteredStaff };
    } catch (error) {
      console.error('Error searching staff:', error);
      return { success: false, error: error.message };
    }
  },

  // Get staff statistics
  async getStaffStats() {
    try {
      const [allStaff, activeStaff, todayAttendance] = await Promise.all([
        this.getAllStaff(),
        this.getActiveStaff(),
        this.getTodayAttendance()
      ]);

      if (!allStaff.success || !activeStaff.success) {
        throw new Error('Failed to fetch staff data');
      }

      const stats = {
        totalStaff: allStaff.data.length,
        activeStaff: activeStaff.data.length,
        inactiveStaff: allStaff.data.length - activeStaff.data.length,
        todayCheckIns: todayAttendance.success ? todayAttendance.data.filter(a => a.action === 'CHECK_IN').length : 0,
        currentlyOnDuty: todayAttendance.success ? this.calculateCurrentlyOnDuty(todayAttendance.data) : 0
      };

      // Staff by type
      const staffByType = {};
      allStaff.data.forEach(staff => {
        const type = staff.staffType || 'Other';
        staffByType[type] = (staffByType[type] || 0) + 1;
      });

      return { 
        success: true, 
        data: {
          ...stats,
          staffByType
        }
      };
    } catch (error) {
      console.error('Error getting staff stats:', error);
      return { success: false, error: error.message };
    }
  },

  // Get today's attendance
  async getTodayAttendance() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const q = query(
        collection(db, 'staff_attendance'),
        where('timestamp', '>=', today),
        orderBy('timestamp', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const attendance = [];
      
      querySnapshot.forEach((doc) => {
        attendance.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return { success: true, data: attendance };
    } catch (error) {
      console.error('Error getting today attendance:', error);
      return { success: false, error: error.message };
    }
  },

  // Calculate currently on duty staff
  calculateCurrentlyOnDuty(attendanceData) {
    const staffStatus = {};
    
    attendanceData.forEach(record => {
      if (!staffStatus[record.staffId]) {
        staffStatus[record.staffId] = record.action;
      }
    });
    
    return Object.values(staffStatus).filter(status => status === 'CHECK_IN').length;
  },

  // Log staff activity
  async logStaffActivity(staffId, activityType, changes, performedBy, staffName = null) {
    try {
      await addDoc(collection(db, 'staff_history'), {
        staffId,
        activityType,
        changes,
        staffName,
        performedBy: performedBy || 'System',
        createdAt: serverTimestamp(),
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error('Error logging staff activity:', error);
    }
  },

  // Get all attendance records for all staff
  async getAllAttendanceRecords() {
    try {
      const q = query(
        collection(db, 'staff_attendance'),
        orderBy('timestamp', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const attendance = [];
      
      querySnapshot.forEach((doc) => {
        attendance.push({
          id: doc.id,
          ...doc.data()
        });
      });

      // Fetch staff names for attendance records
      const staffMap = new Map();
      const staffIds = [...new Set(attendance.map(a => a.staffId))];
      
      if (staffIds.length > 0) {
        const staffPromises = staffIds.map(id => getDoc(doc(db, 'staff', id)));
        const staffDocs = await Promise.all(staffPromises);
        
        staffDocs.forEach((staffDoc, index) => {
          if (staffDoc.exists()) {
            staffMap.set(staffIds[index], staffDoc.data().name);
          }
        });
      }

      // Add staff names to attendance records
      attendance.forEach(record => {
        if (staffMap.has(record.staffId)) {
          record.staffName = staffMap.get(record.staffId);
        }
      });
      
      return { success: true, data: attendance };
    } catch (error) {
      console.error('Error getting all attendance records:', error);
      return { success: false, error: error.message };
    }
  }
};
