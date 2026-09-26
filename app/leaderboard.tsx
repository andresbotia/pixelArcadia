import { router, type Href } from 'expo-router';

import { LeaderboardScreen } from '@/screens/LeaderboardScreen';

export default function LeaderboardRoute() {
  return (
    <LeaderboardScreen
      onShop={() => router.replace('/shop' as Href)}
      onHome={() => router.replace('/')}
    />
  );
}
