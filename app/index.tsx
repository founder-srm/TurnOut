import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { Button, YStack, Text, Image, View, styled, XStack } from 'tamagui';
import { AnimatePresence } from '@tamagui/animate-presence';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  runOnJS
} from 'react-native-reanimated';

// Custom animated component for the QR code
const AnimatedQRCode = styled(View, {
  zIndex: 1,
  scale: 1,
  opacity: 1,
  variants: {
    state: {
      ':number': (state) => ({
        enterStyle: {
          scale: 0.5,
          opacity: 0,
        },
      }),
    },
  } as const,
});

export default function Home() {
  const router = useRouter();
  const [showButton, setShowButton] = useState(false);
  const isVisible = true;

  const dragY = useSharedValue(0);
  const dragOpacity = useSharedValue(1);
  const orangeHeight = useSharedValue(0);

  const resetStates = () => {
    dragY.value = 0;
    dragOpacity.value = 1;
    orangeHeight.value = 0;
  };

  const navigateToTabs = () => {
    runOnJS(resetStates)();
    router.push('/(tabs)');
  };

  const gesture = Gesture.Pan()
    .onUpdate((e) => {
      dragY.value = e.translationY;
      dragOpacity.value = Math.max(0, 1 - Math.abs(e.translationY) / 300);
    })
    .onEnd((e) => {
      if (e.translationY < -100) {
        dragY.value = withSpring(-300, {}, (finished) => {
          if (finished) {
            runOnJS(navigateToTabs)();
          }
        });
      } else {
        dragY.value = withSpring(0);
        dragOpacity.value = withSpring(1);
      }
    });

  // Animate the entry height of the orange section
  React.useEffect(() => {
    orangeHeight.value = withSpring(300); // Target height
  }, []);

  const animatedStyles = useAnimatedStyle(() => ({
    transform: [{ translateY: dragY.value }],
    opacity: dragOpacity.value,
  }));

  const animatedOrangeStyles = useAnimatedStyle(() => ({
    height: orangeHeight.value, // Animate height
  }));

  return (
    <YStack flex={1} backgroundColor="#333" justifyContent="center" alignItems="center">
      <AnimatePresence>
        {isVisible && (
          <AnimatedQRCode
            flex={1.75}
            justifyContent="center"
            alignItems="center"
            animation="bouncy"
            state={1}>
            <Image
              source={require('../assets/Group 10.png')}
              width={200}
              height={200}
              resizeMode="contain"
            />
          </AnimatedQRCode>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isVisible && (
          <Animated.View
            style={[
              animatedOrangeStyles, // Apply animated height styles
              {
                backgroundColor: 'orange',
                justifyContent: 'flex-start',
                alignItems: 'center',
                borderTopLeftRadius: 50,
                borderTopRightRadius: 50,
                shadowColor: '#000',
                shadowOffset: { width: 10, height: -4 },
                shadowOpacity: 0.7,
                shadowRadius: 10,
                elevation: 10,
                paddingTop: 20,
                paddingBottom: 20,
                width: '100%',
              },
            ]}>
            <GestureDetector gesture={gesture}>
              <Animated.View style={[{
                backgroundColor: "white",
                width: 100,
                height: 5,
                borderRadius: 10,
                marginBottom: 30,
                borderWidth: 2,
                borderColor: "#fff",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
                elevation: 5,
              }, animatedStyles]} />
            </GestureDetector>

            <Text color="white" fontWeight={700}  textAlign="center" fontSize={18} opacity={0.8} marginTop="$8" width={300}>
              Go and enjoy our features for free and make your life easy with us.
            </Text>

            <AnimatePresence>
              {showButton && (
                <Button
                  size="$5"
                  width={300}
                  backgroundColor="#333"
                  color="white"
                  marginTop="$5"
                  iconAfter={
                    <Text color="white" fontSize={20}>
                      →
                    </Text>
                  }
                  onPress={() => router.push('/(tabs)')}
                  animation="bouncy"
                  enterStyle={{ opacity: 0, scale: 0.9 }}>
                  Let's Start
                </Button>
              )}
            </AnimatePresence>
          </Animated.View>
        )}
      </AnimatePresence>

      <XStack animation="fadeIn" animationDelay={1000} onLayout={() => setShowButton(true)} />
    </YStack>
  );
}
