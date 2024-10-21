import { StyleSheet, Text, TouchableOpacity, View, ScrollView, ToastAndroid } from 'react-native';

import { StatusBar } from 'expo-status-bar';
import { useCameraPermissions } from 'expo-camera';
import { Image } from 'expo-image';

import {  useEffect, useState } from 'react';

import Scanner from './components/Scanner';
import List from './components/List';
import Settings from './components/Settings';
import AsyncStorage from '@react-native-async-storage/async-storage';

// const Flash_Off = require('./assets/flash_off.svg');
// const Flash_On = require('./assets/flash_on.svg');
const Return = require('./assets/return_logo.svg');
const Info = require('./assets/info_logo.svg');
const Camera_Off = require('./assets/camera_off.svg');
const Camera_On = require('./assets/camera_on.svg');
const FCLogo = require('./assets/fc_logo.png');
const AppLogo = require('./assets/turnout.png');
const ListLogo = require('./assets/list_icon.svg');
const ScannerLogo = require('./assets/scan_icon.svg');
const SettingsLogo = require('./assets/settings_logo.svg');

export default function App() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [isTorchon, setIsTorchon] = useState(false);
  const [cameraOn, setCameraOn] = useState(true);
  const [pageState, setPageState] = useState('scanner'); // Changed to string for multiple states

  useEffect(() => {
    (async () => {
      if (!permission) {
        await requestPermission();
      }
    })();
  }, []);

  if (!permission) {
    return <Text>No access to camera</Text>;
  }

  const getCurrentConfig = async () => {
    try {
      const config = await AsyncStorage.getItem('currentScanConfig');
      // return config; 
      ToastAndroid.show('Current Config for date: ' + config, ToastAndroid.SHORT);
    } catch (error) {
      console.error('Error loading config:', error);
      return null;
    }
  };

  const renderCurrentPage = () => {
    switch (pageState) {
      case 'scanner':
        return (
          <Scanner 
            scanned={scanned}
            cameraOn={cameraOn}
            setCameraOn={setCameraOn}
            setScanned={setScanned}
            isTorchOn={isTorchon}
            setTorchOn={setIsTorchon}
          />
        );
      case 'list':
        return <List />;
      case 'settings':
        return <Settings />;
      default:
        return <Scanner
                  scanned={scanned}
                  cameraOn={cameraOn}
                  setCameraOn={setCameraOn}
                  setScanned={setScanned}
                  isTorchOn={isTorchon}
                  setTorchOn={setIsTorchon}
                />;
    }
  };

  return (
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
          <Text style={[styles.text]}>TurnOut by FC</Text>
        </View>
        
        {renderCurrentPage()}
        
        <View style={styles.buttonContainer}>  
          <View style={{width:30, height:2, backgroundColor:'white' }}></View>
          <View style={{width:'100%',height:'auto', display:'flex', flexDirection:'row', justifyContent:'center', alignItems:'center'}}>
            <TouchableOpacity 
              style={[styles.button, pageState !== 'scanner' && styles.buttonDisabled]} 
              onPress={() => setCameraOn(prev => !prev)}
              disabled={pageState !== 'scanner'}
            >
              <Image 
                style={styles.icon} 
                source={cameraOn ? Camera_Off : Camera_On}
                contentFit="cover"
              />
            </TouchableOpacity>            
            <TouchableOpacity 
              style={[
                styles.button, 
                isTorchon && styles.torchon, 
                // (!cameraOn || pageState !== 'scanner') && styles.buttonDisabled
              ]} 
              // disabled={!cameraOn || pageState !== 'scanner'} 
              onPress={() => getCurrentConfig()}
            >
              <Image
                style={styles.icon}
                source={Info}
                contentFit="cover"            
              />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.button, pageState === 'list' && styles.activeButton]} 
              onPress={() => setPageState(pageState === 'list' ? 'scanner' : 'list')}
            >
              <Image 
                style={styles.icon} 
                source={pageState === 'list' ? Return : ListLogo}
                contentFit="cover"
              />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.button, pageState === 'settings' && styles.activeButton]} 
              onPress={() => setPageState(pageState === 'settings' ? 'scanner' : 'settings')}
            >
              <Image 
                style={styles.icon} 
                source={pageState === 'settings' ? Return : SettingsLogo}
                contentFit="cover"
              />
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
  activeButton: {
    backgroundColor: '#3498db', // or any color you prefer for active state
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
    marginTop: 100,
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
