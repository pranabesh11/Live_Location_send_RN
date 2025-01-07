import { Image, StyleSheet, Text, View } from 'react-native'
import React from 'react';
import logo from '../assets/logo.jpg';

const Sendcard = ({ latitude, longitude, time }) => {
    return (
      <View style={styles.container}>
        <Image source={logo} style={styles.image_logo} />
        <View style={styles.textContainer}>
          <Text style={styles.latitude}>Latitude: {latitude}</Text>
          <Text style={styles.longitude}>Longitude: {longitude}</Text>
            <Text style={styles.time_val}>Time: {time}</Text>
            <Text style={styles.status}>Successful</Text>
        </View>
      </View>
    );
  };
  
  export default Sendcard;
  
  const styles = StyleSheet.create({
    container: {
      backgroundColor: '#1d1d25',
      flexDirection: 'row',
      alignItems: 'center',
      height: 140,
      width: '100%',
      marginVertical: 5,
      borderRadius: 15,
      borderColor:'#4287f5',
      borderWidth:1,
      borderLeftColor: '#4287f5',
      borderLeftWidth: 8,
      padding: 10,
      overflow: 'hidden',
    },
    image_logo: {
      height: 80,
      width: 80,
      borderRadius: 40,
      marginRight: 10,
    },
    textContainer: {
      flex: 1,
      justifyContent: 'center',
      gap: 5,
    },
    latitude: {
      fontSize: 14,
      color: '#ffffff',
      marginBottom: 0,
      fontWeight: 'bold',
    },
    longitude: {
      fontSize: 14,
      color: '#ffffff',
      marginBottom: 8,
      fontWeight: 'bold',
    },
    time_val: {
      backgroundColor: '#ffffff',
      color: '#000000',
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 5,
      paddingHorizontal: 8,
      paddingVertical: 4,
      marginBottom: 5,
      fontWeight: '600',
      fontSize: 12,
      width:180
    },
    status: {
      backgroundColor: '#bbeafe',
      color: '#000000',
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 5,
      paddingHorizontal: 8,
      paddingVertical: 4,
      fontWeight: '600',
      fontSize: 12,
      width:80
    },
  });
  