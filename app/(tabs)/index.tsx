import { Stack } from 'expo-router';

import { Container } from '~/components/Container';
import { ScreenContent } from '~/components/ScreenContent';

export default function Home() {
  return (
    <>
      <Stack.Screen options={{ title: 'Tab One' }} />
      <Container>
        <ScreenContent path="app/(tabs)/one.tsx" title="Tab One" />
      </Container>
    </>
  );
}
