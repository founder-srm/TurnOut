import React, { useState, useCallback, DO_NOT_USE_OR_YOU_WILL_BE_FIRED_CALLBACK_REF_RETURN_VALUES } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, ToastAndroid, View, TouchableOpacity } from "react-native";
import { supabase } from "../lib/supabase";
import { CameraView } from "expo-camera";

interface ScannerProps {
  scanned: boolean;
  setScanned: (scanned: boolean) => void;
  cameraOn: boolean;
  setCameraOn: (cameraOn: boolean) => void;
  isTorchOn: boolean;
  setTorchOn: (isTorchOn: boolean) => void;
}

export default function Scanner({
  scanned,
  setScanned,
  cameraOn,
  setCameraOn,
  isTorchOn,
  setTorchOn,
}: ScannerProps) {
  const [isLoading, setIsLoading] = useState(false);

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
    if (cleanedData) {
      Alert.alert(
        'Successful Scan!',
        `Team of UUID: ${cleanedData} has been scanned!`,
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
      const { data, error, status } = await supabase
        .from('triumphtalkregistration')
        .select(`attendance`)
        .eq('qrID', uuid)
        .single();

      if (error && status !== 406) {
        throw error;
      } else {
        const { attendance } = data;
        if (attendance === false) {
          const { error, status } = await supabase
            .from('triumphtalkregistration')
            .update({ attendance: true })
            .eq('qrID', uuid);
          if (error && status !== 406) {
            Alert.alert('Error', error.message);
          } else {
            ToastAndroid.show('Attendance marked successfully!', ToastAndroid.SHORT);
          }
        } else if (attendance === true) {
          ToastAndroid.show('Already Marked Present!', ToastAndroid.LONG);
          Alert.alert('Already Present', 'This team has already been marked present.');
        }
      }
    } catch (error) {
      Alert.alert('Error', error.message);
      ToastAndroid.show(`Error: ${error.message}`, ToastAndroid.LONG);
    } finally {
      setIsLoading(false);
      setScanned(false);
      setCameraOn(true);
    }
  }, [setIsLoading, setScanned, setCameraOn]);

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
        <TouchableOpacity style={styles.button} onPress={toggleTorch}>
          <Text style={styles.buttonText}>{isTorchOn ? 'Turn Off Torch' : 'Turn On Torch'}</Text>
        </TouchableOpacity>
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