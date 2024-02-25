import { useCallback, useEffect, useMemo, useState } from "react";
import { Text, View, StyleSheet, ScrollView, Alert, ToastAndroid, ActivityIndicator, RefreshControl, Touchable, TouchableOpacity } from "react-native";
import { supabase } from "../lib/supabase";
import { Image } from "expo-image";

interface Attendance {
    name_lead: string;
    registration_lead: string;
    attendance: boolean;
}

const Refresh = require('../assets/refresh.svg');
const Refresh_animated = require('../assets/refresh_animated.gif');

export default function List() {
    const [isLoading, setIsLoading] = useState(false);
    const [data, setData] = useState<Attendance[]>([])   

    const fetchData = async () => {
        setIsLoading(true);
        try {
            let { data: eventsregistration, error } = await supabase
                .from('eventsregistration')
                .select('name_lead,registration_lead,attendance')

            if (error) {
                console.log(error)
                Alert.prompt(error.message)
                ToastAndroid.showWithGravity(error.message, ToastAndroid.SHORT, ToastAndroid.BOTTOM);
            }
            else {
                setData(eventsregistration)
                Alert.prompt('Data fetched successfully')
                ToastAndroid.showWithGravity('Data fetched successfully', ToastAndroid.SHORT, ToastAndroid.BOTTOM);
            }
            
        } catch (error) {
            console.log(error)
            Alert.prompt(error.message)
            ToastAndroid.showWithGravity(error.message, ToastAndroid.SHORT, ToastAndroid.BOTTOM);
        } finally {
            setIsLoading(false);

        }
    }

    

    useEffect(() => {
        fetchData();
    }, [ ])

  return (
    <>
        <View style={{width:'100%', justifyContent:'flex-end', display:'flex', paddingHorizontal:12}}>
            <TouchableOpacity 
              style={styles.button} 
              onPress={fetchData}
              disabled={isLoading}
            >
              <Image
                style={styles.icon} 
                source={isLoading ?  Refresh_animated : Refresh }
                contentFit="cover"
              />
            </TouchableOpacity>  
        </View>
        <ScrollView 
            style={styles.scrollContainer}
            
        >
            { isLoading ? (
                <View style={isLoading ?  styles.box : styles.hidden }>
                    {isLoading && <Text style={styles.text}>Retrieving registration data... </Text>}
                    <ActivityIndicator animating={isLoading} size="large" color="#fff" />
                </View>
            ) : (
                <View style={styles.table}>
                    <View style={styles.row}>
                        <Text style={styles.cell}>S no.</Text>
                        <Text style={styles.cell}>Lead Name</Text>
                        <Text style={styles.cell}>Lead Registration</Text>
                        <Text style={styles.cell}>Attendance</Text>
                    </View>
                    {
                        data.map((item, index) => {
                            return (
                                <View style={styles.row} key={index}>
                                    <Text style={styles.cell}>{index+1}</Text>
                                    <Text style={styles.cell}>{item.name_lead}</Text>
                                    <Text style={styles.cell}>{item.registration_lead}</Text>
                                    <Text style={styles.cell}>{item.attendance ? 'Present' : 'Absent'}</Text>
                                </View>
                            )
                        })
                    }           
                </View>
            )}
        </ScrollView> 
    </>       
  );
}

const styles = StyleSheet.create({
    scrollContainer:{
    backgroundColor: '#090909',
    width: '80%',
    height: '100%',
    overflow: 'scroll',
    display:'flex',
    flex: 1,
    flexDirection: 'column',
    },
    table: {
        borderWidth: 1,
        borderColor: '#fff',
        display: 'flex',
        flexDirection: 'column',
    },
    row: {
        flexDirection: 'row',
    },
    cell: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
        borderWidth: 1,
        borderColor: '#fff',
        color: '#fff',
    },
    hidden: {
      display: 'none',
    },
    box:{
      width: '100%',
      height: 'auto',
      marginHorizontal: 15,
      display: 'flex',
      flexDirection:'row-reverse',
      justifyContent: 'space-around',
      alignItems: 'center',
      padding: 6,
      backgroundColor: 'rgba(25,25,20,0.5)',
      borderRadius: 10,
    },
    button: {
      width: 'auto',
      alignSelf: 'flex-end',
      alignItems: 'center',
      margin: 20,
      padding: 8,
      backgroundColor: '#fff',
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
  });