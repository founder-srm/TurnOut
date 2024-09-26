import React, { useCallback, useEffect, useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  Alert,
  ToastAndroid,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  Switch,
} from "react-native";
import { supabase } from "../lib/supabase";
import { Image } from "expo-image";

interface Attendance {
  Student_Name: string;
  Student_Registration_No: string;
  attendance: boolean;
  qrID: string;
}

const Refresh = require('../assets/refresh.svg');
const Refresh_animated = require('../assets/refresh_animated.gif');

export default function List() {
    const [isLoading, setIsLoading] = useState(false);
    const [data, setData] = useState<Attendance[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
  
    const fetchData = async () => {
      setIsLoading(true);
      try {
        let { data: eventsregistration, error } = await supabase
          .from('triumphtalkregistration')
          .select('Student_Name,Student_Registration_No,attendance,qrID');
  
        if (error) {
          console.log(error);
          Alert.alert("Error", error.message);
          ToastAndroid.showWithGravity(error.message, ToastAndroid.SHORT, ToastAndroid.BOTTOM);
        } else {
          setData(eventsregistration);
          ToastAndroid.showWithGravity('Data fetched successfully', ToastAndroid.SHORT, ToastAndroid.BOTTOM);
        }
      } catch (error) {
        console.log(error);
        Alert.alert("Error", error.message);
        ToastAndroid.showWithGravity(error.message, ToastAndroid.SHORT, ToastAndroid.BOTTOM);
      } finally {
        setIsLoading(false);
      }
    };
  
    const toggleAttendance = useCallback(async (qrID: string) => {
        // Find the item with the matching qrID
        const item = data.find(item => item.qrID === qrID);
        if (!item) return;
      
        const newAttendanceValue = !item.attendance;
      
        setIsLoading(true);
        try {
          const { error, status } = await supabase
            .from('triumphtalkregistration')
            .update({ attendance: newAttendanceValue })
            .eq('qrID', qrID);
      
          if (error) {
            console.log(error);
            Alert.alert("Error", "Failed to update attendance. Please try again.");
            ToastAndroid.showWithGravity("Failed to update attendance", ToastAndroid.SHORT, ToastAndroid.BOTTOM);
          } else {
            // Update the local data array
            setData(prevData =>
              prevData.map(prevItem =>
                prevItem.qrID === qrID ? { ...prevItem, attendance: newAttendanceValue } : prevItem
              )
            );
            ToastAndroid.showWithGravity("Attendance updated successfully", ToastAndroid.SHORT, ToastAndroid.BOTTOM);
          }
        } catch (error) {
          console.log(error);
          Alert.alert("Error", "An unexpected error occurred. Please try again.");
          ToastAndroid.showWithGravity("An unexpected error occurred", ToastAndroid.SHORT, ToastAndroid.BOTTOM);
        } finally {
          setIsLoading(false);
          fetchData();  // Refresh the data after updating
        }
      }, [data]);
  
    useEffect(() => {
      fetchData();
    }, []);
  
    const filteredAndSortedData = React.useMemo(() => {
      return data
        .filter(item =>
          item.Student_Name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.Student_Registration_No.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .sort((a, b) => {
          if (a.attendance === b.attendance) {
            return a.Student_Name.localeCompare(b.Student_Name);
          }
          return a.attendance ? -1 : 1;
        });
    }, [data, searchQuery]);
  
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Attendance List</Text>
          <TouchableOpacity 
            style={[styles.button, isLoading && styles.buttonDisabled]} 
            onPress={fetchData}
            disabled={isLoading}
          >
            <Image
              style={styles.icon} 
              source={isLoading ? Refresh_animated : Refresh}
              contentFit="cover"
            />
          </TouchableOpacity>  
        </View>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or registration number"
          placeholderTextColor="#888"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Processing... </Text>
            <ActivityIndicator animating={true} size="large" color="#6200EE" />
          </View>
        ) : (
          <ScrollView style={styles.scrollContainer} horizontal={true}>
            <View>
              <View style={styles.row}>
                <Text style={[styles.cell, styles.headerCell, styles.indexCell]}>S no.</Text>
                <Text style={[styles.cell, styles.headerCell, styles.nameCell]}>Name</Text>
                <Text style={[styles.cell, styles.headerCell, styles.regCell]}>Reg No.</Text>
                <Text style={[styles.cell, styles.headerCell, styles.attendanceCell]}>Present</Text>
              </View>
              <ScrollView>
                {filteredAndSortedData.map((item, index) => (
                  <View style={styles.row} key={index}>
                    <Text style={[styles.cell, styles.indexCell]}>{index + 1}</Text>
                    <Text style={[styles.cell, styles.nameCell]}>{item.Student_Name}</Text>
                    <Text style={[styles.cell, styles.regCell]}>{item.Student_Registration_No}</Text>
                    <View style={[styles.cell, styles.attendanceCell]}>
                    <Switch
                        value={item.attendance}
                        onValueChange={() => toggleAttendance(item.qrID)}
                        trackColor={{ false: "#767577", true: "#81b0ff" }}
                        thumbColor={item.attendance ? "#f5dd4b" : "#f4f3f4"}
                        disabled={isLoading}
                    />
                    </View>
                  </View>
                ))}
              </ScrollView>
            </View>
          </ScrollView>
        )}
      </View>       
    );
  }

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  searchInput: {
    height: 40,
    borderColor: '#444',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 16,
    color: '#FFFFFF',
    backgroundColor: '#1E1E1E',
  },
  scrollContainer: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  cell: {
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
    color: '#E0E0E0',
  },
  headerCell: {
    backgroundColor: '#1E1E1E',
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  indexCell: {
    width: 60,
  },
  nameCell: {
    width: 200,
  },
  regCell: {
    width: 150,
  },
  attendanceCell: {
    width: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#E0E0E0',
    marginBottom: 16,
  },
  button: {
    padding: 8,
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  icon: {
    width: 24,
    height: 24,
    tintColor: '#FFFFFF',
  },
});