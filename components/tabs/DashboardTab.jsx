import { View, Text } from 'react-native'
import React from 'react'

export default function DashboardTab({ userData }) {
  return (
    <View>
      <Text>DashboardTab</Text>
      <Text>User Name: {userData?.name || 'Unknown'}</Text>
      <Text>User Role: {userData?.userType || 'Unknown'}</Text>
    </View>
  )
}