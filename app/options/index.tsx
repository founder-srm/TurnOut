import React, { useState } from 'react';
import {
  YStack,
  XStack,
  Text,
  Switch,
  Separator,
  Button,
  Theme,
  AnimatePresence,
  View,
} from 'tamagui';
import { ChevronLeft, Bell, Star, Share, Shield, Vibrate } from 'lucide-react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { StatusBar } from 'react-native';
import { useRouter } from 'expo-router';

const SettingsScreen: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  const router = useRouter();

  return (
    <Theme name="dark">
      <AnimatePresence>
        {isVisible && (
          <YStack
            key="settings"
            f={1}
            bg="#333"
            px="$4"
            py="$6"
            space="$6"
            animation="bouncy"
            enterStyle={{ scale: 0.9 }}
            x={0}
            scale={1}>
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

            <Text color="#FDB623" fontSize="$8" fontWeight="bold">
              Settings
            </Text>

            <YStack space="$4" bg="#333">
              <SettingItem
                icon={<Vibrate size={24} color="#FDB623" />}
                title="Vibrate"
                description="Vibration when scan is done."
                controlElement={<CustomSwitch defaultChecked={true} />}
              />
              <SettingItem
                icon={<Bell size={24} color="#FDB623" />}
                title="Beep"
                description="Beep when scan is done."
                controlElement={<CustomSwitch defaultChecked={false} />}
              />
            </YStack>

            <Text color="#FDB623" fontSize="$6" fontWeight="bold" mt="$4">
              Support
            </Text>

            <YStack
              space="$4"
              bg="#444"
              borderRadius="$4"
              p="$2"
              elevation={5}
              shadowColor="#000"
              shadowOpacity={0.7}
              shadowRadius={5}
              shadowOffset={{ width: 0, height: 4 }}>
              <SupportItem
                icon={<Star size={24} color="#FDB623" />}
                title="Rate Us"
                description="Your best reward to us."
              />
              <Separator />
              <SupportItem
                icon={<Share size={24} color="#FDB623" />}
                title="Share"
                description="Share app with others."
              />
              <Separator />
              <SupportItem
                icon={<Shield size={24} color="#FDB623" />}
                title="Privacy Policy"
                description="Follow our policies that benefits you."
              />
            </YStack>
          </YStack>
        )}
      </AnimatePresence>
    </Theme>
  );
};

interface ItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface SettingItemProps extends ItemProps {
  controlElement: React.ReactNode;
}

const SettingItem: React.FC<SettingItemProps> = ({ icon, title, description, controlElement }) => {
  return (
    <XStack
      bg="#444"
      p="$3"
      borderRadius="$4"
      alignItems="center"
      elevation={5}
      shadowColor="#000"
      shadowOpacity={0.3}
      shadowRadius={5}
      shadowOffset={{ width: 0, height: 2 }}>
      {icon}
      <YStack ml="$3" f={1}>
        <Text color="white" fontSize="$5" fontWeight="bold">
          {title}
        </Text>
        <Text color="#999" fontSize="$3">
          {description}
        </Text>
      </YStack>
      {controlElement}
    </XStack>
  );
};

const SupportItem: React.FC<ItemProps> = ({ icon, title, description }) => {
  return (
    <XStack
      p="$2"
      alignItems="center"
      elevation={3}
      shadowColor="#000"
      shadowOpacity={0.2}
      shadowRadius={3}
      shadowOffset={{ width: 0, height: 1 }}>
      {icon}
      <YStack ml="$3">
        <Text color="white" fontSize="$5" fontWeight="bold">
          {title}
        </Text>
        <Text color="#999" fontSize="$3">
          {description}
        </Text>
      </YStack>
    </XStack>
  );
};

const CustomSwitch: React.FC<{ defaultChecked?: boolean }> = ({ defaultChecked = true }) => {
  const [isChecked, setIsChecked] = useState(defaultChecked);

  return (
    <Switch
      size="$4"
      borderRadius={10}
      checked={isChecked}
      onCheckedChange={(checked) => setIsChecked(checked)}
      backgroundColor={isChecked ? '#FDB623' : '$gray8'}
      borderColor={isChecked ? '#FDB623' : '$gray6'}
      animation="bouncy"
      unstyled={true}
      h={28}
      w={52}
      px={2}
      py={2}>
      <Switch.Thumb
        animation={[
          'bouncy',
          {
            transform: {
              overshootClamping: true,
            },
          },
        ]}
        unstyled={true}
        h={24}
        w={24}
        bg={isChecked ? 'white' : '$gray4'}
        elevation={2}
        borderRadius={12}
      />
    </Switch>
  );
};

export default SettingsScreen;
