import { StyleSheet, Text, TouchableOpacity, View, Alert, ActivityIndicator, ScrollView, ToastAndroid } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

import { StatusBar } from 'expo-status-bar';
import { CameraType, CameraView, useCameraPermissions } from 'expo-camera/next';
import { Image } from 'expo-image';

import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';

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
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    (async () => {
      if (!permission) {
        await requestPermission();
      }
    })();
  }, []);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      
      if ( state.isInternetReachable === false ) {
        ToastAndroid.showWithGravity('Bad Connectivity', ToastAndroid.SHORT, ToastAndroid.BOTTOM);
        Alert.prompt(
          'Network Error',
          'Bad Connectivity'
          )
      }

      if (state.isConnected === false) {
        ToastAndroid.showWithGravity('No internet connection', ToastAndroid.SHORT, ToastAndroid.BOTTOM);
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
    } else {
      ToastAndroid.showWithGravity('invalid qr', ToastAndroid.SHORT, ToastAndroid.BOTTOM);
      Alert.prompt(`invalid qr`);

      setTimeout(() => {
        setScanned(false)
        setCameraOn(true);
        console.log('ready to scan again  ');

      }, 3000)
    }
    
  };

  const handleCancel = () => {
    setScanned(false)
    setCameraOn(true);
    ToastAndroid.showWithGravity('Attendance not given', ToastAndroid.SHORT, ToastAndroid.BOTTOM);
    Alert.prompt('Attendance not given', 'Scan again');
  }

  
  const giveAttendance = async(uuid: string) => {
    setIsLoading(true);
    try{
      const { data, error, status } = await supabase
        .from('eventsregistration')
        .select(`attendance`)
        .eq('qr_id', uuid)
        .single()
      if (error && status !== 406) {
        throw error
      }

      else {
        const { attendance } = data;
        if (attendance === false ) {
          console.log('attendance', attendance);

          const { error, status } = await supabase
            .from('eventsregistration')
            .update({ attendance: true })
            .eq('qr_id', uuid)
          if (error && status !== 406) {
            alert( error)
          }
        }
        else if (attendance === true) {
          console.log('attendance', attendance);
          ToastAndroid.showWithGravity('Already Marked Present!!', ToastAndroid.LONG, ToastAndroid.BOTTOM);
          Alert.prompt('Already Marked Present');
        }
      }
    } catch (error) {
      console.log('error', error)
      Alert.prompt('error', error)
      ToastAndroid.showWithGravity(`error: ${error}`, ToastAndroid.LONG, ToastAndroid.BOTTOM);
    } finally {
      setIsLoading(false);
      setScanned(false)
      setCameraOn(true);
    }
  };



  return (
    <ScrollView style={styles.scrollContainer} >
      <View style={styles.container}>
        <View style={{display:'flex', flexDirection:'row', width:'100%', height:'auto', gap:2, justifyContent:'space-around', alignItems:'center'}}>
          <Image 
            source={FCLogo}
            style={styles.logo}
            contentFit="contain"
          />
          <Text style={[styles.text , ]}>TurnOut by FC</Text>
        </View>

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

        <View style={isLoading ?  styles.box : styles.hidden }>
          {isLoading && <Text style={styles.text}>Marking Present for the Team...</Text>}
          <ActivityIndicator animating={isLoading} size="large" color="#fff" />
        </View>
        
        <View style={styles.buttonContainer}>  
          <View style={{width:30, height:2, backgroundColor:'white' }}></View>
          <View style={{width:'100%',height:'auto', display:'flex', flexDirection:'row', justifyContent:'center', alignItems:'center'}}>
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
        </View>    
      </View>
      <StatusBar style="dark" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer:{
    backgroundColor: '#090909',
    width: '100%',
    height: 'auto',
  },
  container: {
    backgroundColor: '#090909',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    height: '100%',
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
  hidden: {
    display: 'none',
  },
  box:{
    width: '100%',
    height: 'auto',
    marginHorizontal: 15,
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 6,
    backgroundColor: 'rgba(25,25,20,0.5)',
    borderRadius: 10,
  },
  buttonContainer: {
    flex: 1,
    backgroundColor: 'rgba(25,25,20,0.5)',
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    height: 'auto',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 160,
    padding: 10,
    borderWidth: 1,
    borderColor: 'gray',
    borderTopRightRadius: 8,
    borderTopLeftRadius: 8,
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
