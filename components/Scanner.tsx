import React, { useState, useCallback, useEffect } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, ToastAndroid, View, TouchableOpacity } from "react-native";
import { supabase } from "../lib/supabase";
import { CameraView } from "expo-camera";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface ScannerProps {
  scanned: boolean;
  setScanned: (scanned: boolean) => void;
  cameraOn: boolean;
  setCameraOn: (cameraOn: boolean) => void;
  isTorchOn: boolean;
  setTorchOn: (isTorchOn: boolean) => void;
}


type ScanConfig = 'day1_fn' | 'day1_an' | 'day2_fn' | 'day2_an' | 'day3_fn' | 
                 'day3_an' | 'day4_fn' | 'day4_an' | 'day5_fn' | 'day5_an';
type GateType = 'in' | 'out';


export default function Scanner({
  scanned,
  setScanned,
  cameraOn,
  setCameraOn,
  isTorchOn,
  setTorchOn,
}: ScannerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [gate, setGate] = useState<GateType>('in');
  const [config, setConfig] = useState('day1_fn');
  useEffect(() => {
    async function getConfig(){
      const config = await AsyncStorage.getItem('currentScanConfig');
      setConfig(config);
    }

    getConfig();
  }, [config]);
  

  // const isUUID = useCallback((value: string): boolean => {
  //   const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;
  //   return uuidRegex.test(value);
  // }, []);

  const preprocessData = (data: string): string => {
    return data.replace(/\s+/g, '');
  };

  const handleBarCodeScanned = useCallback(({ data }) => {
    const cleanedData = preprocessData(data);
    setScanned(true);
    setCameraOn(false);
    console.log(cleanedData);
    if (cleanedData) {
      Alert.alert(
        'Successful Scan!',
        `Team of UUID: "${cleanedData}" has been scanned!`,
        [
          {
            text: 'Give Attendance',
            onPress: () => giveAttendance(cleanedData),
            style: 'default',
          },
          {
            text: 'Cancel',
            onPress: handleCancel,
            style: 'cancel',
          },
        ]
      );
    } else {
      console.log(cleanedData);
      ToastAndroid.show('Invalid QR code', ToastAndroid.SHORT);
      Alert.alert('Invalid QR Code', 'Please scan a valid QR code.');
      setTimeout(() => {
        setScanned(false);
        setCameraOn(true);
        ToastAndroid.show('Ready to scan again', ToastAndroid.SHORT);
      }, 3000);
    }
  }, [setScanned, setCameraOn]);

  const handleCancel = useCallback(() => {
    setScanned(false);
    setCameraOn(true);
    ToastAndroid.show('Attendance not given', ToastAndroid.SHORT);
    Alert.alert('Attendance Not Given', 'Scan again when ready.');
  }, [setScanned, setCameraOn]);

  const giveAttendance = useCallback(async (uuid: string) => {
    setIsLoading(true);
    try {
      // Get current scan configuration and gate type
      const scanConfig = await AsyncStorage.getItem('currentScanConfig');
      if (!scanConfig) {
        throw new Error('Please configure scan settings first');
      }

      // Column name will be in format: day1_fn_in, day1_fn_out, day2_an_in, etc.
      const columnName = `${scanConfig}`;
      console.log("col name: ",columnName);
      // First check if attendance is already marked
      const { data, error, status } = await supabase
        .from('bootcampregistration')
        .select(`${columnName}, Name`)
        .eq('id', uuid)
        .single();
      console.log("check data: ",data);

      if (error && status !== 406) {
        throw error;
      }

      // Check if attendance is already marked
      if (data && data[columnName] === true) {
        ToastAndroid.show('Already Marked Present!', ToastAndroid.LONG);
        Alert.alert('Already Present', 'This team has already been marked present.');
        return;
      }

      // Mark attendance
      const { data:updateData ,error: updateError, status: updateStatus } = await supabase
        .from('bootcampregistration')
        .update({ [columnName]: true })
        .eq('id', uuid);

      if (updateError && updateStatus !== 406) {
        throw updateError;
      }

      if (updateError) {
        throw new Error('Error marking attendance');
      }

      console.log("update data", updateData);
      // If gate is 'out', also mark the corresponding 'in' attendance if not already marked
      // if (gate === 'out') {
      //   const inColumnName = `${scanConfig}_in`;
      //   await supabase
      //     .from('bootcampregistration')
      //     .update({ [inColumnName]: true })
      //     .eq('id', uuid);
      // }

      ToastAndroid.show(
        `${gate.toUpperCase()} ${data['Name']} for attendance marked successfully!`, 
        ToastAndroid.SHORT
      );

    } catch (error) {
      Alert.alert('Error', error.message);
      ToastAndroid.show(`Error: ${error.message}`, ToastAndroid.LONG);
    } finally {
      setIsLoading(false);
      setScanned(false);
      setCameraOn(true);
    }
  }, [setIsLoading, setScanned, setCameraOn, gate]);

  const toggleCamera = useCallback(() => {
    setCameraOn(!cameraOn);
    setScanned(false);
  }, [cameraOn, setCameraOn, setScanned]);

  const toggleTorch = useCallback(() => {
    setTorchOn(!isTorchOn);
  }, [isTorchOn, setTorchOn]);

  return (
    <View style={styles.container}>
      <View style={styles.cameraContainer}>
        {cameraOn ? (
          <CameraView 
            style={styles.camera} 
            barcodeScannerSettings={{
              barcodeTypes: ["qr"],
            }}
            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            enableTorch={isTorchOn}
          />
        ) : (
          <View style={styles.cameraOff}>
            <Text style={styles.cameraOffText}>📷</Text>
            <Text style={styles.text}>Camera is off</Text>
          </View>
        )}
      </View>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.button} onPress={toggleCamera}>
          <Text style={styles.buttonText}>{cameraOn ? 'Turn Off Camera' : 'Turn On Camera'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={toggleTorch} disabled={!isTorchOn}>
          <Text style={styles.buttonText}>{isTorchOn ? 'Turn Off Torch' : 'Turn On Torch'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.sessionPanel}>
        <View style={styles.sessionRow}>
          <Text style={styles.sessionLabel}>Day & Session : </Text>
          <Text style={styles.sessionValue}>{config}</Text>
        </View>
      </View>
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <Text style={styles.text}>Marking Present for the Team...</Text>
          <ActivityIndicator size="large" color="#FFFFFF" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#121212',
  },
  cameraContainer: {
    width: 300,
    height: 300,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    overflow: 'hidden',
    borderRadius: 20,
    marginBottom: 20,
  },
  camera: {
    width: '100%',
    height: '100%',
  },
  cameraOff: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
  },
  cameraOffText: {
    fontSize: 48,
    marginBottom: 10,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 20,
  },
  sessionPanel: {
    width: '90%',
    backgroundColor: '#1E1E1E',
    borderRadius: 10,
    padding: 15,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#333333',
  },
  sessionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
  },
  sessionLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  sessionValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4da6ff', // Light blue color for values
  },
  button: {
    backgroundColor: '#808080 ',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
    color: '#FFFFFF',
    marginTop: 10,
  },
});