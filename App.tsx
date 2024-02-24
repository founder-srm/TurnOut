import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CameraType, CameraView, useCameraPermissions } from 'expo-camera/next';
import { useEffect, useState } from 'react';
import { Image } from 'expo-image';

const Flash_Off = require('./assets/flash_off.svg');
const Flash_On = require('./assets/flash_on.svg');

export default function App() {

  const [facing, setFacing] = useState('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [isTorchon, setIsTorchon] = useState(false)

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

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    alert(`Bar code with type ${type} and data ${data} has been scanned!`);
  };

  return (
    <View style={styles.container}>
      <View style={styles.cameraContainer}>
        <CameraView 
          style={styles.camera} 
          barcodeScannerSettings={{
            barcodeTypes: ["qr"],
          }}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          enableTorch={isTorchon}
        />
      </View>
      <View style={styles.buttonContainer}>
        
        <TouchableOpacity style={[styles.button, isTorchon && styles.torchon ]} onPress={() => setIsTorchon(!isTorchon)}>
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
      <StatusBar style="auto" />
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
  text: {
    fontSize: 18,
    color: 'white',
  },
  icon: {
    width: 30,
    height: 30,
    color: 'white',
  },
});
