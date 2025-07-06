import { View, Text } from 'react-native'
import React from 'react'

export default function MembersTab({ userData }) {
  return (
    <View>
      <Text>MembersTab</Text>
      <Text>User Name: {userData?.name || 'Unknown'}</Text>
      <Text>User Role: {userData?.userType || 'Unknown'}</Text>
    </View>
  )
}