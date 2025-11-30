import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} /> {/* Login screen */}
      <Stack.Screen name="signup" options={{ title: 'Sign Up' }} />
      {/* Add other authentication screens here */}
    </Stack>
  );
}