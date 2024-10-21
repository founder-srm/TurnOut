import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, Linking, Alert } from 'react-native';
import { XStack, Text, Image } from 'tamagui';
import qr_logo from '../../assets/qr_logo.png';
import dlt from '../../assets/delete.png';
import { useLocalSearchParams } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface QRData {
  link: string;
  scanTime: string;
}

export default function Two() {
  const [qrDataList, setQrDataList] = useState<QRData[]>([]);
  const { qrLink, scanTime } = useLocalSearchParams();
  const router = useRouter();

  const loadQrData = async () => {
    try {
      const storedData = await AsyncStorage.getItem('qrDataList');
      if (storedData) {
        setQrDataList(JSON.parse(storedData));
      }
    } catch (error) {
      console.error('Failed to load QR data:', error);
    }
  };

  const saveQrData = async (data: QRData[]) => {
    try {
      await AsyncStorage.setItem('qrDataList', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save QR data:', error);
    }
  };

  useEffect(() => {
    loadQrData();
  }, []);

  useEffect(() => {
    if (qrLink && scanTime && !qrDataList.some((item) => item.link === qrLink)) {
      const updatedData = [...qrDataList, { link: qrLink as string, scanTime: scanTime as string }];
      setQrDataList(updatedData);
      saveQrData(updatedData);
    }
  }, [qrLink, scanTime, qrDataList]);

  const handleDelete = (indexToDelete: number) => {
    const updatedData = qrDataList.filter((_, index) => index !== indexToDelete);
    setQrDataList(updatedData);
    saveQrData(updatedData);
  };

  const handleOpenLink = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Something went wrong. Unable to open the link.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open the link.');
    }
  };

  return (
    <View style={{ flex: 1, padding: 30, backgroundColor: '#333' }}>
      <View
        style={{
          backgroundColor: '#333',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 1,
          shadowRadius: 8,
          padding: 10,
          borderRadius: 5,
          position: 'absolute',
          top: 50,
          left: 20,
          zIndex: 10,
        }}>
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft color="#FDB623" size={24} />
        </TouchableOpacity>
      </View>
      <Text
        marginTop={50}
        color="#FDB623"
        fontSize={24}
        fontWeight="bold"
        marginBottom={20}
        textAlign="center"
        display="flex"
        alignContent="center"
        justifyContent="center">
        History
      </Text>

      <ScrollView style={{ padding: 5, backgroundColor: '#333' }}>
        {qrDataList.length === 0 ? (
          <Text color="#D9D9D9" marginTop={20} textAlign="center">
            No QR codes scanned yet.
          </Text>
        ) : (
          qrDataList.map((item, index) => (
            <XStack
              key={index}
              marginTop={30}
              backgroundColor="#303030"
              borderRadius={5}
              shadowColor="black"
              shadowOffset={{ width: 1, height: 1 }}
              shadowOpacity={0.5}
              shadowRadius={5}
              height={60}
              width={336}
              justifyContent="space-between"
              alignItems="center"
              paddingHorizontal={10}>
              <Image source={qr_logo} style={{ height: 33, width: 33 }} />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <TouchableOpacity onPress={() => handleOpenLink(item.link)}>
                  <Text color="#D9D9D9" fontSize={17} numberOfLines={1}>
                    {item.link}
                  </Text>
                  <Text color="#A4A4A4" fontSize={11} marginTop={5}>
                    Scanned At: {item.scanTime}
                  </Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity onPress={() => handleDelete(index)}>
                <Image source={dlt} style={{ height: 24, width: 24 }} />
              </TouchableOpacity>
            </XStack>
          ))
        )}
      </ScrollView>
    </View>
  );
}
