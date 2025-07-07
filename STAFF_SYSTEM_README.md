# Staff Management System Documentation

## Overview
The Staff Management System is a comprehensive solution for managing society staff including maids, cooks, security guards, maintenance workers, and other service personnel. The system provides complete CRUD operations, attendance tracking, history logging, and assignment management.

## Features

### 1. Staff Management
- **Add Staff**: Complete staff registration with personal details, emergency contacts, and work information
- **View Staff**: Detailed staff profiles with assigned flats and system information
- **Edit Staff**: Update staff details, assignments, and active/inactive status
- **Delete/Deactivate**: Manage staff status (active/inactive)

### 2. Flat Assignment
- **Multi-Flat Assignment**: Staff can be assigned to multiple flats/owners
- **Member Integration**: Fetches flat owners from the members collection
- **Dynamic Assignment**: Add/remove flat assignments with real-time updates
- **Assignment History**: Track all assignment changes

### 3. Attendance Management
- **Check-In/Check-Out**: Gate-level attendance tracking
- **Real-time Status**: View current duty status of all staff
- **Attendance Logs**: Complete log of all check-ins and check-outs
- **Statistics**: Track working hours, attendance patterns, and performance

### 4. Search & Filtering
- **Global Search**: Search staff by name, phone, type, or assigned flats
- **Filter Options**: Filter by staff type, status (active/inactive), duty status
- **Real-time Filtering**: Instant results as you type

### 5. History & Audit Trail
- **Staff History**: Complete log of all changes made to staff records
- **Activity Tracking**: Track additions, updates, status changes, and assignments
- **Change Details**: View before/after values for all modifications
- **User Attribution**: Track who made each change and when

### 6. Statistics & Analytics
- **Staff Statistics**: Total staff count, active/inactive breakdowns
- **Type Distribution**: Staff count by type (maid, cook, security, etc.)
- **Attendance Analytics**: Today's check-ins, currently on duty
- **Performance Metrics**: Average working hours, attendance patterns

## File Structure

```
components/
├── staff/
│   ├── AddStaffModal.jsx          # Add new staff members
│   ├── EditStaffModal.jsx         # Edit existing staff details
│   ├── StaffDetailsModal.jsx      # View staff information
│   ├── StaffHistoryModal.jsx      # View staff change history
│   ├── StaffAttendanceModal.jsx   # View attendance logs
│   └── CheckInOutModal.jsx        # Manage check-in/out
├── tabs/primary/StaffTab/
│   └── StaffTab.jsx               # Main staff management interface
services/
├── staffService.js                # Staff-related database operations
└── membersService.js              # Member/flat owner operations
```

## Database Collections

### 1. `staff` Collection
Primary staff information:
```javascript
{
  id: "auto-generated",
  name: "String",
  phoneNumber: "String",
  alternatePhoneNumber: "String", 
  address: "String",
  emergencyContact: "String",
  emergencyPhone: "String",
  staffType: "String", // Housekeeping, Security, Maintenance, etc.
  salary: "Number",
  notes: "String",
  assignedFlats: [{
    memberId: "String",
    memberName: "String", 
    flatNumber: "String",
    assignedAt: "ISO Date"
  }],
  isActive: "Boolean",
  createdAt: "Timestamp",
  updatedAt: "Timestamp"
}
```

### 2. `staff_history` Collection
Audit trail for all staff changes:
```javascript
{
  id: "auto-generated",
  staffId: "String",
  activityType: "String", // STAFF_ADDED, STAFF_UPDATED, STATUS_CHANGED, etc.
  details: "String",
  changes: {
    oldData: "Object",
    newData: "Object"
  },
  performedBy: "String",
  performedById: "String",
  createdAt: "Timestamp"
}
```

### 3. `staff_attendance` Collection
Check-in/check-out records:
```javascript
{
  id: "auto-generated",
  staffId: "String",
  staffName: "String",
  action: "String", // CHECK_IN, CHECK_OUT
  timestamp: "Timestamp",
  location: "String",
  notes: "String",
  recordedBy: "String",
  recordedById: "String"
}
```

## Key Functions

### Staff Service (`staffService.js`)

#### CRUD Operations
- `addStaff(staffData)` - Add new staff member
- `getAllStaff()` - Get all staff members
- `getActiveStaff()` - Get only active staff
- `getInactiveStaff()` - Get only inactive staff
- `updateStaff(staffId, updateData, updatedBy)` - Update staff details

#### Attendance Management
- `checkInStaff(staffId, checkInData)` - Record check-in
- `checkOutStaff(staffId, checkOutData)` - Record check-out
- `getStaffAttendance(staffId)` - Get attendance records
- `getTodayAttendance()` - Get today's attendance

#### Search & Analytics
- `searchStaff(searchTerm)` - Search staff by various criteria
- `getStaffStats()` - Get comprehensive statistics
- `getStaffHistory(staffId)` - Get change history

#### Utility Functions
- `logStaffActivity(staffId, action, data, updatedBy)` - Log activities

## Component Usage

### StaffTab (Main Interface)
```javascript
<StaffTab userData={currentUser} />
```

### Add Staff Modal
```javascript
<AddStaffModal
  visible={modalVisible}
  onClose={() => setModalVisible(false)}
  onStaffAdded={refreshStaffList}
  userData={currentUser}
/>
```

### Edit Staff Modal
```javascript
<EditStaffModal
  visible={modalVisible}
  onClose={() => setModalVisible(false)}
  staff={selectedStaff}
  onStaffUpdated={refreshStaffList}
  userData={currentUser}
/>
```

### Staff Details Modal
```javascript
<StaffDetailsModal
  visible={modalVisible}
  onClose={() => setModalVisible(false)}
  staff={selectedStaff}
  onEdit={openEditModal}
/>
```

### Staff History Modal
```javascript
<StaffHistoryModal
  visible={modalVisible}
  onClose={() => setModalVisible(false)}
  staff={selectedStaff}
/>
```

### Staff Attendance Modal
```javascript
<StaffAttendanceModal
  visible={modalVisible}
  onClose={() => setModalVisible(false)}
  staff={selectedStaff}
/>
```

### Check-In/Out Modal
```javascript
<CheckInOutModal
  visible={modalVisible}
  onClose={() => setModalVisible(false)}
  onAttendanceRecorded={refreshData}
  userData={currentUser}
/>
```

## User Flows

### 1. Adding New Staff
1. Click "Add Staff" button in StaffTab
2. Fill in staff details in AddStaffModal
3. Select staff type from predefined options
4. Search and assign flats from member list
5. Submit to create staff record
6. Automatic logging in staff_history

### 2. Editing Staff
1. Click on staff card in list or search results
2. View details in StaffDetailsModal
3. Click "Edit" to open EditStaffModal
4. Modify details, assignments, or status
5. Submit changes with automatic history logging

### 3. Managing Attendance
1. Click "Check In/Out" in StaffTab
2. Search for staff in CheckInOutModal
3. Perform check-in or check-out action
4. Add optional notes and location
5. Record saved in staff_attendance collection

### 4. Viewing History & Analytics
1. Select staff and view attendance logs
2. Access change history for audit trail
3. View statistics on dashboard
4. Filter and search historical data

## Security Features

- **Input Validation**: All forms include comprehensive validation
- **Error Handling**: Graceful error handling with user-friendly messages
- **Data Integrity**: Referential integrity between staff and member assignments
- **Audit Trail**: Complete logging of all changes with user attribution
- **Access Control**: User-based permissions (userData parameter)

## Responsive Design

- **Scrollable Interfaces**: All lists and modals are fully scrollable
- **Search Integration**: Real-time search in all components
- **Mobile Optimized**: Touch-friendly interface with proper spacing
- **Loading States**: Visual feedback during data operations
- **Empty States**: Informative messages when no data is available

## Extension Points

The system is designed to be easily extensible:

1. **Additional Staff Types**: Easily add new staff categories
2. **Custom Fields**: Extend staff data model as needed
3. **Reporting**: Add advanced reporting and analytics
4. **Notifications**: Integration with notification systems
5. **Photo Management**: Add staff photo upload capabilities
6. **Document Management**: Attach documents to staff records
7. **Shift Management**: Add shift scheduling features
8. **Payroll Integration**: Connect with payroll systems

## Best Practices

1. **Always validate user input** before database operations
2. **Use loading states** for better user experience  
3. **Implement proper error handling** with user-friendly messages
4. **Log all significant actions** for audit purposes
5. **Keep UI consistent** across all modals and screens
6. **Ensure data synchronization** between related collections
7. **Test thoroughly** with various data scenarios

This comprehensive staff management system provides all the essential features needed for efficient society staff management while maintaining flexibility for future enhancements.
