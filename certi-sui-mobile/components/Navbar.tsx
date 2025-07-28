import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Constants from 'expo-constants';

export default function Navbar() {
  return (
    <View style={styles.navbar}>
      <Text style={styles.navbarText}>CertiSui</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  navbar: {
    backgroundColor: '#2563eb',
    paddingTop: Constants.statusBarHeight,
    padding: 16,
    alignItems: 'center',
  },
  navbarText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
});