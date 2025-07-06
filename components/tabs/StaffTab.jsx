import { View, Text } from 'react-native'
import React from 'react'

export default function StaffTab({ userData }) {
  return (
    <View>
      <Text>StaffTab</Text>
      <Text>User Name: {userData?.name || 'Unknown'}</Text>
      <Text>User Role: {userData?.userType || 'Unknown'}</Text>
    </View>
  )
}