import { Stack } from 'expo-router';

export default function BookingStack() {
  return (
    <Stack>
      <Stack.Screen
        name="index" // This corresponds to the BookingList screen
        options={{ headerShown: false, title: 'Bookings'}}
      />

      {/* <Stack.Screen
        name="[date]" // This corresponds to the BookingDetail screen
        getId={({ params }) => String(Date.now())}
        options={{ title: 'Booking Details', headerShown: false }}
      /> */}

    </Stack>
  );
}