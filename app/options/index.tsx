import React from 'react';
import { YStack, Text } from 'tamagui';

export default function Options() {
  return (
    <YStack f={1} bg="#333" ai="center" jc="center">
      <Text color="#FDB623" fontSize="$9" fontWeight="bold">
        Setting Screen
      </Text>
    </YStack>
  );
}
