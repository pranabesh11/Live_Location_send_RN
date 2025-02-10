import { StyleSheet, Text, View, Button, Alert,FlatList, SafeAreaView,TouchableOpacity } from 'react-native';
import BackgroundService from 'react-native-background-actions';
import Geolocation from 'react-native-geolocation-service';
import { PermissionsAndroid, Platform } from 'react-native';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Linking } from 'react-native';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import Sendcard from './Sendcard';





const Background = () => {

    const [location, setLocation] = useState({ latitude: null, longitude: null });
    const [locationHistory, setLocationHistory] = useState([]);
    const [hitCount,setHitCount] = useState(0);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        const loadHistory = async () => {
            try {
                const savedHistory = await AsyncStorage.getItem('locationHistory');
                if (savedHistory) {
                    setLocationHistory(JSON.parse(savedHistory));
                    console.log(savedHistory);
                }
            } catch (error) {
                console.error('Error loading location history:', error);
            }
        };
        const checkPermissions = async () => {
            const foregroundGranted = await requestForegroundLocationPermission();
            if (foregroundGranted) {
                const backgroundGranted = await requestBackgroundLocationPermission();
                if (!backgroundGranted) {
                    console.log('Background location permission not granted');
                }
            }
        };
        loadHistory();
        checkPermissions();
    }, []);
    
    const checkBackgroundLocationPermission = async () => {
        const granted = await PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION
        );
    
        if (!granted) {
            showLocationPermissionAlert();
        }
    };
    const refreshLocationHistory = async () => {
        setRefreshing(true);
        try {
            const savedHistory = await AsyncStorage.getItem('locationHistory');
            if (savedHistory) {
                setLocationHistory(JSON.parse(savedHistory));
                console.log('Location history refreshed successfully');
            } else {
                console.log('No location history found in AsyncStorage');
            }
        } catch (error) {
            console.error('Error refreshing location history:', error);
        } finally {
            setRefreshing(false);
        }
    };
    
    const requestForegroundLocationPermission = async () => {
        try {
            if (Platform.OS === 'android') {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                    {
                        title: 'Location Permission',
                        message: 'This app needs access to your location to track your position in real time.',
                        buttonNeutral: 'Ask Me Later',
                        buttonNegative: 'Cancel',
                        buttonPositive: 'OK',
                    }
                );
    
                if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                    console.log('Foreground location permission granted');
                    return true;
                } else {
                    console.log('Foreground location permission denied');
                    return false;
                }
            } else if (Platform.OS === 'ios') {
                const status = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
                if (status === RESULTS.GRANTED) {
                    console.log('Foreground location permission granted');
                    return true;
                } else if (status === RESULTS.BLOCKED) {
                    showLocationPermissionAlert();
                    return false;
                } else {
                    console.log('Foreground location permission denied');
                    return false;
                }
            }
        } catch (err) {
            console.warn(err);
            return false;
        }
    };
    const requestBackgroundLocationPermission = async () => {
        try {
            if (Platform.OS === 'android') {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
                    {
                        title: 'Background Location Permission',
                        message: 'Please enable background location access for continuous tracking.',
                        buttonNeutral: 'Ask Me Later',
                        buttonNegative: 'Cancel',
                        buttonPositive: 'OK',
                    }
                );
    
                if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                    console.log('Background location permission granted');
                    return true;
                } else {
                    console.log('Background location permission denied');
                    return false;
                }
            } else if (Platform.OS === 'ios') {
                const status = await request(PERMISSIONS.IOS.LOCATION_ALWAYS);
                if (status === RESULTS.GRANTED) {
                    console.log('Background location permission granted');
                    return true;
                } else if (status === RESULTS.BLOCKED) {
                    showLocationPermissionAlert();
                    return false;
                } else {
                    console.log('Background location permission denied');
                    return false;
                }
            }
        } catch (err) {
            console.warn(err);
            return false;
        }
    };
    const showLocationPermissionAlert = () => {
        Alert.alert(
            'Allow All the Time',
            'Please enable "Allow all the time" in the location settings to ensure accurate tracking.',
            [
                {
                    text: 'Go to Settings',
                    onPress: () => {
                        Linking.openSettings().catch(() => {
                            Alert.alert('Error', 'Unable to open settings');
                        });
                    },
                },
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
            ]
        );
    };
            
    
    
    
    const sleep = (time) => new Promise((resolve) => setTimeout(() => resolve(), time));
    const veryIntensiveTask = async (taskDataArguments) => {
        const { delay } = taskDataArguments;
    
        await new Promise(async (resolve) => {
            for (let i = 0; BackgroundService.isRunning(); i++) {
                console.log(`Loop iteration: ${i}`);
                setHitCount(i);
    
                try {
                    const location = await new Promise((resolve, reject) => {
                        Geolocation.getCurrentPosition(
                            (position) => {
                                const { latitude, longitude } = position.coords;
                                resolve({ latitude, longitude });
                            },
                            (error) => {
                                reject(error);
                            },
                            {
                                enableHighAccuracy: true,
                                timeout: 15000,
                                maximumAge: 10000,
                            }
                        );
                    });
                    const currentTime = new Date().toLocaleString();
                    console.log(
                        `Current Location - Latitude: ${location.latitude}, Longitude: ${location.longitude}, Time: ${currentTime}`
                    );
                    setLocation(location);
                    setLocationHistory((prev) => {
                        const updatedHistory = [
                            ...prev,
                            { id: i.toString(), latitude: location.latitude, longitude: location.longitude, time: currentTime },
                        ];
                        AsyncStorage.setItem('locationHistory', JSON.stringify(updatedHistory))
                            .then(() => console.log('Location history saved successfully'))
                            .catch((error) => console.error('Error saving location history:', error));
                        return updatedHistory;
                    });
                
                    const payload = {
                        email: 'deb@gmail.com',
                        lat: location.latitude,
                        long: location.longitude,
                    };
                    const url = 'https://codeofdolphins.com/cloud-kitchen/api/addLocation';
    
                    try {
                        const response = await axios.post(url, payload);
    
                        if (response.status === 200) {
                            console.log('Location sent successfully to the API.');
                        } else {
                            console.error(`Unexpected API response: ${response.status}`);
                        }
                    } catch (apiError) {
                        console.error(`API Error: ${apiError.message || 'Unknown error'}`);
                    }
                } catch (locationError) {
                    console.error(`Location Error: ${locationError.message || 'Unknown location error'}`);
                }
                await BackgroundService.updateNotification({
                    taskDesc: `My Background Task Is Running. Loop: ${i}`,
                });
                await sleep(delay);
            }
        });
    };
    
    
    const options = {
        taskName: 'Example',
        taskTitle: 'ExampleTask title',
        taskDesc: 'ExampleTask description',
        taskIcon: {
            name: 'ic_launcher',
            type: 'mipmap',
        },
        color: '#ff00ff',
        linkingURI: 'yourSchemeHere://chat/jane',
        parameters: {
            delay: 5000,
        },
    };


    const getLocation = () => {
        Geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            setLocation({ latitude, longitude });
            console.log("this is my current location ****************************",latitude,longitude)
            Alert.alert('Location Retrieved', `Lat: ${latitude}, Lon: ${longitude}`);
        },
        (error) => {
            Alert.alert('Error', error.message);
        },
        {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 10000,
        }
        );
    };

    const startbackgroundservice = async () => {
        const foregroundGranted = await requestForegroundLocationPermission();
        if (foregroundGranted) {
            const backgroundGranted = await requestBackgroundLocationPermission();
            if (backgroundGranted) {
                console.log("You clicked the button to run the background task");
                await BackgroundService.start(veryIntensiveTask, options);
                await BackgroundService.updateNotification({ taskDesc: 'New ExampleTask description' });
            } else {
                console.log('Background location permission denied');
            }
        } else {
            console.log('Foreground location permission denied');
        }
    };
    

  const stopbackgroundservice = async() => {
    await BackgroundService.stop();
  };

  return (
    <SafeAreaView style={styles.container}>
        

        <Text style={styles.title}>Start Sending Your Current Location In Every 5 Seconds</Text>
        <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.start_btn} onPress={startbackgroundservice}>
                <Text style={styles.buttonText}>Start</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.pause_btn} onPress={stopbackgroundservice}>
                <Text style={styles.buttonText}>Pause</Text>
            </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.location_btn} onPress={showLocationPermissionAlert}>
            <Text style={styles.buttonText}>Check Location Permission</Text>
        </TouchableOpacity>

        <View style={styles.my_data}>
            <View style={styles.textContainer}>
                <Text style={styles.text}>Latitude: {location.latitude || '00.00'}</Text>
                <Text style={styles.text}>Longitude: {location.longitude || '00.00'}</Text>
            </View>
            <TouchableOpacity style={styles.button} onPress={getLocation}>
                <Text style={styles.buttonText}>Get My Location</Text>
            </TouchableOpacity>
        </View>
        <View style={styles.history_container}>
            <Text style={styles.history_txt}>History Of Location Sharing</Text>
        </View>

        <FlatList
            data={locationHistory}
            style={{height:270}}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
                <Sendcard latitude={item.latitude} longitude={item.longitude} time={item.time}/>
            )}
            refreshing={refreshing}
            onRefresh={refreshLocationHistory}
        />
    </SafeAreaView>
  );
};

export default Background;

const styles = StyleSheet.create({
    container: {
        // flex: 1,
        padding: 10,
        backgroundColor:'#1d1d25',
        
    },
    title: {
        fontSize: 24,
        fontWeight: 900,
        marginBottom: 20,
        textAlign:'center',
        padding:10,
        borderRadius:10,
        color:'white',
    },
    location_btn: {
        backgroundColor: '#007BFF',
        borderRadius: 25,
        paddingVertical: 15,
        paddingHorizontal: 30,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    my_data:{
        marginTop:60,
        marginBottom:30
    },
    text: {
        fontSize: 18,
        marginVertical: 10,
        color:'white'
    },
    buttonContainer: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        marginBottom: 20,
        height: 100,
    },
    start_btn: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#00b9a0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    pause_btn: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'red',
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    
    locationContainer: {
        marginBottom: 20,
    },
    flatListContainer: {
        height: 200,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        overflow: 'hidden',
    },
    listItem: {
        marginVertical: 10,
        padding: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        backgroundColor: '#f9f9f9',
    },
   
    textContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    text: {
        fontSize: 14,
        color: '#333',
        fontWeight: 'bold',
        marginHorizontal: 10,
        color:'white'
    },
    button: {
        backgroundColor: '#007BFF',
        borderRadius: 25,
        paddingVertical: 10,
        paddingHorizontal: 20,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    history_container: {
        
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#C2FFC7',
        borderRadius:5,
        borderColor:'#62825D',
        borderWidth:3
    },
    history_txt: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
    },
    
});

