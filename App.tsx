import { StyleSheet, Text, TouchableOpacity, View, Alert, ScrollView, ToastAndroid } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

import { StatusBar } from 'expo-status-bar';
import { useCameraPermissions } from 'expo-camera';
import { Image } from 'expo-image';

import { PaperProvider } from 'react-native-paper';
import {  useEffect, useState } from 'react';

import Scanner from './components/Scanner';
import List from './components/List';

const Flash_Off = require('./assets/flash_off.svg');
const Flash_On = require('./assets/flash_on.svg');
const Camera_Off = require('./assets/camera_off.svg');
const Camera_On = require('./assets/camera_on.svg');
const FCLogo = require('./assets/fc_logo.png');
const AppLogo = require('./assets/turnout.png');
const ListLogo = require('./assets/list_icon.svg');
const ScannerLogo = require('./assets/scan_icon.svg');

export default function App() {

  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [isTorchon, setIsTorchon] = useState(false)
  const [cameraOn, setCameraOn] = useState(true);
  const [pageState, setPageState] = useState(true);

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

  

 


  return (
    <PaperProvider>
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.container}>
          <View style={{display:'flex', flexDirection:'row', width:'100%', height:'auto', gap:2, justifyContent:'space-around', alignItems:'center'}}>
            <Image 
              source={FCLogo}
              style={styles.logo}
              contentFit="contain"
            />
            <Image 
              source={AppLogo}
              style={styles.appLogo}
              contentFit="contain"
            />
            <Text style={[styles.text , ]}>TurnOut by FC</Text>
          </View>
          {
            pageState ? (            
              <Scanner 
                scanned={scanned}
                cameraOn={cameraOn}
                setCameraOn={setCameraOn}
                setScanned={setScanned}
                isTorchOn={isTorchon}
                setTorchOn={setIsTorchon}
              />
            ) : (
              <List />
            )
          }
          
          <View style={styles.buttonContainer}>  
            <View style={{width:30, height:2, backgroundColor:'white' }}></View>
            <View style={{width:'100%',height:'auto', display:'flex', flexDirection:'row', justifyContent:'center', alignItems:'center'}}>
              <TouchableOpacity 
                style={[styles.button, !pageState && styles.buttonDisabled]} 
                onPress={() => setCameraOn(prev => !prev)}
                disabled={!pageState}
              >
                <Image 
                  style={styles.icon} 
                  source={cameraOn ? Camera_Off : Camera_On}
                  contentFit="cover"
                />
              </TouchableOpacity>            
              <TouchableOpacity style={[styles.button, isTorchon && styles.torchon, !cameraOn && styles.buttonDisabled ]} disabled={!cameraOn || !pageState} onPress={() => setIsTorchon(!isTorchon)}>
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
              <TouchableOpacity 
                style={styles.button} 
                onPress={() => setPageState(prev => !prev)}
              >
                <Image 
                  style={styles.icon} 
                  source={pageState ? ListLogo : ScannerLogo}
                  contentFit="cover"
                />
              </TouchableOpacity>
            </View>
          </View>    
        </View>
        <StatusBar style="dark" />
      </ScrollView>
    </PaperProvider>
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
    marginTop: 170,
    padding: 10,
    borderWidth: 1,
    borderColor: 'gray',
    borderTopRightRadius: 8,
    borderTopLeftRadius: 8,
    zIndex: 10,
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
  },
  appLogo:{
    width: 70,
    height: 70,
    resizeMode: 'contain',
    margin:0,
  }
});
