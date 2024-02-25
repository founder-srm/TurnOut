import { useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, ToastAndroid, View } from "react-native";
import { supabase } from "../lib/supabase";
import { CameraView } from "expo-camera/next";

export default function Scanner({
   scanned,
   setScanned,
   cameraOn,
   setCameraOn, 
    isTorchon,
    setTorchon,
}) {

    const [isLoading, setIsLoading] = useState(false);
    
    
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
        ToastAndroid.showWithGravity('Ready to scan again', ToastAndroid.SHORT, ToastAndroid.BOTTOM);
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

          const { error, status } = await supabase
            .from('eventsregistration')
            .update({ attendance: true })
            .eq('qr_id', uuid)
          if (error && status !== 406) {
            alert( error)
          }
        }
        else if (attendance === true) {
          ToastAndroid.showWithGravity('Already Marked Present!!', ToastAndroid.LONG, ToastAndroid.BOTTOM);
          Alert.prompt('Already Marked Present');
        }
      }
    } catch (error) {
      Alert.prompt('error', error)
      ToastAndroid.showWithGravity(`error: ${error}`, ToastAndroid.LONG, ToastAndroid.BOTTOM);
    } finally {
      setIsLoading(false);
      setScanned(false)
      setCameraOn(true);
    }
  };


    return (
        <>
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
        </>
    )
}

const styles = StyleSheet.create({
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
    text: {
      fontSize: 18,
      color: 'white',
    },
  });