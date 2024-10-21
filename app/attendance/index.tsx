import React, { useState, useEffect } from 'react';
import { YStack, Text, Button } from 'tamagui';
import { ChevronLeft } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { View, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function History() {
  const router = useRouter();
  const { qrLink } = useLocalSearchParams();

  const [students, setStudents] = useState([
    { regNo: 'RA2211003010663', color: 'red' },
    { regNo: 'RA2211003010686', color: 'red' },
    { regNo: 'RA2211003010660', color: 'red' },
    { regNo: 'RA2211003010661', color: 'red' },
  ]);

  useEffect(() => {
    const loadAttendance = async () => {
      try {
        const storedStudents = await AsyncStorage.getItem('students');
        if (storedStudents) {
          setStudents(JSON.parse(storedStudents));
        }
      } catch (error) {
        console.log('Error loading student data from AsyncStorage:', error);
      }
    };

    loadAttendance();
  }, []);

  useEffect(() => {
    if (qrLink) {
      handleQrScan(qrLink);
    }
  }, [qrLink]);

  const handleQrScan = async (scannedRegNo:any) => {
    const formattedScannedRegNo = scannedRegNo.trim().toUpperCase();

    const studentIndex = students.findIndex(
      (student) => student.regNo.toUpperCase() === formattedScannedRegNo
    );

    if (studentIndex !== -1) {
      if (students[studentIndex].color === 'green') {
        Alert.alert('Already marked as present', 'This student is already marked as present.');
      } else {
        const updatedStudents = students.map((student, i) =>
          i === studentIndex ? { ...student, color: 'green' } : student
        );
        setStudents(updatedStudents);
        await saveAttendance(updatedStudents);
      }
    } else {
      Alert.alert(
        'No Match',
        'The scanned QR code does not match any student registration number.'
      );
    }
  };

  const toggleAttendance = async (index:any) => {
    const updatedStudents = students.map((student, i) =>
      i === index ? { ...student, color: student.color === 'red' ? 'green' : 'red' } : student
    );
    setStudents(updatedStudents);
    await saveAttendance(updatedStudents);
  };

  const saveAttendance = async (updatedStudents:any) => {
    try {
      await AsyncStorage.setItem('students', JSON.stringify(updatedStudents));
    } catch (error) {
      console.log('Error saving student data to AsyncStorage:', error);
    }
  };

  return (
    <YStack f={1} bg="#333" ai="center" p="$6">
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
        display="flex">
        Attendance
      </Text>

      {students.map((student, index) => (
        <Button
          fontSize={17}
          color="#D9D9D9"
          fontWeight="900"
          key={student.regNo}
          backgroundColor={student.color}
          width={350}
          onPress={() => toggleAttendance(index)}
          marginBottom={10}>
          {student.regNo}
        </Button>
      ))}
    </YStack>
  );
}
