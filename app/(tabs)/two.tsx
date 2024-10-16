import React, { useState, useCallback } from 'react';
import { YStack, XStack, Button, Text, AnimatePresence } from 'tamagui';
import { useFocusEffect } from '@react-navigation/native'; // Hook to detect tab switch
import { History, Settings, Code, ScanQrCode, User } from 'lucide-react-native'; // lucide-react-native for icons
import { useRouter } from 'expo-router';

const options = [
  { name: 'History', icon: History, route: '/history' },
  { name: 'Attendance', icon: User, route: '/attendance' },
  { name: 'Settings', icon: Settings, route:' /options' },
  { name: 'Developers', icon: Code, route: '/developer' },
];

export default function QRGeneratorScreen() {
  const [isVisible, setIsVisible] = useState(false); // Start as hidden
  const router = useRouter();

  // Trigger animation when the screen is focused (tab switch)
  useFocusEffect(
    useCallback(() => {
      // Reset animation before showing to ensure re-animation on tab switch
      // setIsVisible(false);
      setTimeout(() => setIsVisible(true), 100); // Slight delay to trigger re-animation
    }, [])
  );
  const handleNavigation = (route:string) => {
    router.push(route); 
  };

  return (
    <YStack f={1} bg="#333" ai="center">
      {/* Header */}
      <XStack ai="flex-start" p="$7" mt="$5" w="100%">
        <Text color="#fff" fontSize="$9" fontWeight="bold">
          TurnOut
        </Text>
        <ScanQrCode color="#fff" size={24} style={{ alignItems: 'center', justifyContent: 'center', padding: 15, margin: 4 }} />
      </XStack>

      {/* Options Grid with Bounce Animation */}
      <YStack flexGrow={1} ai="center" mt='$10' gap="$4" maxWidth={400} w="100%" p={16}>
        <AnimatePresence>
          {isVisible && options.map(({ name, icon: Icon,route }, index) => (
            <YStack
              key={name}
              enterStyle={{
                scale: 1.5,
                y: -10,
                opacity: 0,
              }}
              animation="bouncy"
              elevation="$4"
              delay={index * 100}
            >
              <Button
                size="$8"
                w="100%"
                h={80}
                m="$2"
                bg="#333"
                borderRadius="$4"
                elevation={10} // Increase elevation for shadow
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 }, // Shadow for elevation
                  shadowOpacity: 0.7,
                  shadowRadius: 8,
                }}
                hoverStyle={{
                  bg: '#3c3c3e',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.4,
                  shadowRadius: 8,
                }} // Hover effect for button
                onPress={() => handleNavigation(route)}
              >
                <XStack ai="center" jc="space-between" px="$4" w="100%">
                  <Text color="#FDB623" fontSize="$5" ta="center">
                    {name}
                  </Text>
                  <YStack ai="center" jc="center">
                    <Icon color="#FDB623" size={24} />
                  </YStack>
                </XStack>
              </Button>
            </YStack>
          ))}
        </AnimatePresence>
      </YStack>
    </YStack>
  );
}
