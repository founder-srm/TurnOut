import { StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

import { StatusBar } from 'expo-status-bar';
import { CameraType, CameraView, useCameraPermissions } from 'expo-camera/next';
import { Image } from 'expo-image';

import { useEffect, useState } from 'react';

const Flash_Off = require('./assets/flash_off.svg');
const Flash_On = require('./assets/flash_on.svg');
const Camera_Off = require('./assets/camera_off.svg');
const Camera_On = require('./assets/camera_on.svg');
const FCLogo = require('./assets/fc_logo.png');

export default function App() {

  const [facing, setFacing] = useState('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [isTorchon, setIsTorchon] = useState(false)
  const [cameraOn, setCameraOn] = useState(true);


  useEffect(() => {
    (async () => {
      if (!permission) {
        await requestPermission();
      }
    })();
  }, []);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      console.log('Connection type', state.type);
      console.log('Is connected?', state.isConnected);
      console.log('Is internet reachable?', state.isInternetReachable);

      if ( state.isInternetReachable === false ) {
        Alert.alert(
          'Network Error',
          'Bad Connectivity'
          )
        Alert.prompt(
          'Network Error',
          'Bad Connectivity'
          )
      }

      if (state.isConnected === false) {
        Alert.alert(
          'Network Error',
          'No internet connection'
          )
        Alert.prompt(
          'Network Error',
          'No internet connection'
          )
      }

    });
    

    return () => {
      unsubscribe();
    };
  }, []);

  if (!permission) {
    return <Text>No access to camera</Text>;
  }

  function isUUID(value: string): boolean {
    const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;
    return uuidRegex.test(value);
  }

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    setCameraOn(false);
    if (isUUID(data)) {

      Alert.alert(
        'Successful Scan!',
        `Team of UUID :${data} has been scanned!`,
        [
          {
            text: 'Give Attendance',
            onPress: () => giveAttendance(data),
            style: 'default',
          },
          {
            text: 'Cancel',
            onPress: () => handleCancel(),
            style: 'cancel',
          },
        ],
        
      );
      
      Alert.prompt(
        'Successful Scan!',
        `Team of UUID :${data} has been scanned!`,
        [
          {
            text: 'Cancel',
            onPress: () => handleCancel(),
            style: 'cancel',
          },
        ],
        
      );
    } else {
      Alert.alert(`invalid qr`);
      Alert.prompt(`invalid qr`);

      setScanned(false)
      setCameraOn(true);
      console.log('ready to scan again  ');
    }
    
  };

  const handleCancel = () => {
    setScanned(false)
    setCameraOn(true);
    Alert.alert('Attendance not given', 'Scan again');
    Alert.prompt('Attendance not given', 'Scan again');
    console.log('ready to scan again  ');
  }

  const giveAttendance = (uuid: string) => {
    console.log('Attendance given to team of UUID:', uuid);
    Alert.alert('Attendance given to team of UUID:', uuid);
    Alert.prompt('Attendance given to team of UUID:', uuid);

    setScanned(false)
    setCameraOn(true);
    console.log('ready to scan again  ');
  };

  return (
    <View style={styles.container}>

      <Image 
        source={FCLogo}
        style={styles.logo}
        contentFit="contain"
      />

      <View style={styles.cameraContainer}>
        {cameraOn ? (
          <CameraView 
            style={styles.camera} 
            barcodeScannerSettings={{
              barcodeTypes: ["qr"],
            }}
            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            enableTorch={isTorchon}
          />

        ) : (
          <View style={styles.cameraOff}>
            <Text style={styles.text}>Camera is off</Text>
          </View>
        )}
      </View>
      
      <View style={styles.buttonContainer}>
        
        <TouchableOpacity 
          style={styles.button} 
          onPress={() => setCameraOn(prev => !prev)}
        >
          <Image 
            style={styles.icon} 
            source={cameraOn ? Camera_Off : Camera_On}
            contentFit="cover"
          />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, isTorchon && styles.torchon, !cameraOn && styles.buttonDisabled ]} disabled={!cameraOn} onPress={() => setIsTorchon(!isTorchon)}>
          {isTorchon ? (
              <Image
                style={styles.icon}
                source={Flash_Off}
                contentFit="cover"            
              />
            ) : (
              <Image
                style={styles.icon}
                source={Flash_On}
                contentFit="cover"            
            />
          )}
        </TouchableOpacity>
      </View>        
      <StatusBar style="dark" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090909',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: '80%',
    width: '100%',
    gap: 5,
  },
  cameraContainer: {
    width: 300,
    height: 300,
    borderWidth: 1,
    borderColor: 'white',
    overflow: 'hidden',
    borderRadius: 10,
    margin: 30,
  },
  camera: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  cameraOff: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#151718',

  },
  buttonContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
    alignItems: 'center',
    margin: 0,
  },
  torchon :{
    backgroundColor: 'rgb(216,62,62)',
  },
  button: {
    width: 'auto',
    alignSelf: 'flex-end',
    alignItems: 'center',
    margin: 20,
    padding: 8,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderRadius: 8,
    borderColor: 'gray',
  },
  buttonDisabled: {
    backgroundColor: 'gray',
  },
  text: {
    fontSize: 18,
    color: 'white',
  },
  icon: {
    width: 30,
    height: 30,
    color: 'white',
  },
  logo:{
    width: 130,
    height: 130,
    resizeMode: 'contain',
    margin:0,
  }
});
