import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  StatusBar,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';

import SuvanImage from '../../assets/suvan.jpeg';
import VijayImage from '../../assets/vijay.jpeg';
import SumanImage from '../../assets/suman.jpeg';

import Github from '../../assets/github.png';
import Linkedin from '../../assets/linkedin.png';

interface DeveloperDetails {
  name: string;
  status: string;
  image: any; // Change to 'any' type for local asset
  details: string;
  gitHub: string;
  linkDin: string;
}

const DeveloperCard: React.FC<DeveloperDetails> = ({
  name,
  status,
  image,
  details,
  gitHub,
  linkDin,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <TouchableOpacity style={styles.card} onPress={() => setIsFlipped(!isFlipped)}>
      {!isFlipped ? (
        <View style={styles.cardFront}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.status}>{status}</Text>
          <Image source={image} style={styles.image} resizeMode="cover" />
          <TouchableOpacity style={styles.button} onPress={() => setIsFlipped(true)}>
            <Text style={styles.buttonText}>Details</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.cardBack}>
          <Text style={styles.name}>Details</Text>
          <Text style={styles.details}>{details}</Text>
          <View style={styles.iconContainer}>
            <TouchableOpacity onPress={() => Linking.openURL(gitHub)}>
              <Image source={Github} style={styles.icon} resizeMode="contain" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => Linking.openURL(linkDin)}>
              <Image source={Linkedin} style={styles.icon} resizeMode="contain" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.button} onPress={() => setIsFlipped(false)}>
            <Text style={styles.buttonText}>Back</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
};

const DeveloperScreen: React.FC = () => {
  const router = useRouter();

  const developers: DeveloperDetails[] = [
    {
      name: 'Suvan GS',
      status: 'Geek',
      image: SuvanImage,
      details: 'Technical Lead',
      linkDin: 'https://www.linkedin.com/in/suman-s-7b1313211/',
      gitHub: 'https://github.com/greeenboi/',
    },
    {
      name: 'Vijay Makkad',
      status: 'Geek',
      image: VijayImage,
      details: 'Associate Technical Lead',
      linkDin: 'https://www.linkedin.com/in/vijay-makkad-1573681b3/',
      gitHub: 'https://github.com/VijayMakkad',
    },
    {
      name: 'Suman S Harshvardhan',
      status: 'Geek',
      image: SumanImage,
      details: 'Technical Member',
      linkDin: 'https://www.linkedin.com/in/suman-s-7b1313211/',
      gitHub: 'https://github.com/snugtroller',
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#333" />
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

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Our Developers</Text>
        <View style={styles.cardContainer}>
          {developers.map((dev, index) => (
            <DeveloperCard
              key={index}
              name={dev.name}
              status={dev.status}
              image={dev.image}
              details={dev.details}
              gitHub={dev.gitHub}
              linkDin={dev.linkDin}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#333',
  },
  scrollContainer: {
    flexGrow: 1,
    alignItems: 'center',
    paddingTop: 80, // Increased padding to avoid blending with the status bar
    paddingBottom: 20,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 10,
  },
  title: {
    color: '#FDB623',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  cardContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 8,
    padding: 30,
  },
  card: {
    width: 280,
    height: 380,
    margin: 10,
    backgroundColor: '#333',
    borderRadius: 10,
    padding: 15,
    overflow: 'hidden',
  },
  cardFront: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  cardBack: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  status: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 10,
  },
  image: {
    width: 220,
    height: 220,
    borderRadius: 15,
    resizeMode: 'cover',
  },
  details: {
    fontSize: 14,
    textAlign: 'center',
    color: '#fff',
    paddingHorizontal: 10,
    // marginBottom: 10,
  },
  button: {
    backgroundColor: '#FDB623',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 5,
    marginTop: 15,
  },
  buttonText: {
    color: '#000',
    fontSize: 14,
  },
  iconContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  icon: {
    width: 50,
    height: 50,
    marginHorizontal: 12,
  },
});

export default DeveloperScreen;
