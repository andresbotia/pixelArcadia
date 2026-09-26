import { router, type Href } from 'expo-router';

import { StoreScreen } from '@/screens/StoreScreen';

export default function ShopRoute() {
  return (
    <StoreScreen
      onHome={() => router.replace('/')}
      onLeaderboard={() => router.replace('/leaderboard' as Href)}
    />
  );
}
