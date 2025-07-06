import { View, Text } from 'react-native'
import React from 'react'

export default function MaintenanceTab({ userData }) {
  return (
    <View>
      <Text>MaintenanceTab</Text>
      <Text>User Name: {userData?.name || 'Unknown'}</Text>
      <Text>User Role: {userData?.userType || 'Unknown'}</Text>
    </View>
  )
}