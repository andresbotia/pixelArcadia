import { LinearGradient } from 'expo-linear-gradient';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BombGlyph, SlotGlyph, UndoGlyph } from '@/components/gameplay/glyphs';
import { HomeBottomNav } from '@/components/home/HomeBottomNav';
import { CoinMedallion } from '@/components/v2/primitives';
import { productsInSection, type StoreProduct } from '@/game/economy/catalog';
import type { GameplayItemId } from '@/game/economy/config';
import { feedback } from '@/game/feedback';
import { useEconomy } from '@/hooks/useEconomy';
import { AV, AV_FONT } from '@/theme/arcadiaV2';

interface StoreScreenProps {
  onHome: () => void;
  onLeaderboard: () => void;
}

/** TUNABLE — how long a card's "+1 …" / "Not enough coins" line holds. */
const NOTICE_MS = 1400;

/**
 * STORE V1 — coin-only item shop. Renders the catalog's `items` section; every
 * buy goes through `purchaseItem` (one atomic, persisted economy operation).
 * The Coins / Bundles sections exist in the catalog type but have no
 * products yet, so they are not drawn.
 */
export function StoreScreen({ onHome, onLeaderboard }: StoreScreenProps) {
  const { economy, loading, purchaseItem } = useEconomy();
  const items = productsInSection('items');

  return (
    <View style={styles.root}>
      <LinearGradient colors={[AV.shellTop, AV.shellBottom]} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title} accessibilityRole="header">STORE</Text>
          <View style={styles.balance} accessible accessibilityLabel={`${economy.coins} coins`}>
            <CoinMedallion size={24} />
            <Text style={styles.balanceText}>{loading ? '—' : economy.coins}</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.section}>ITEMS</Text>
          {items.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              coins={economy.coins}
              owned={product.icon.kind === 'item' ? economy.inventory[product.icon.itemId] : 0}
              disabled={loading}
              onBuy={purchaseItem}
            />
          ))}
        </ScrollView>
      </SafeAreaView>
      <HomeBottomNav active="shop" onShop={noop} onHome={onHome} onLeaderboard={onLeaderboard} />
    </View>
  );
}

const noop = () => {};

type Notice = { kind: 'ok' | 'error'; text: string } | null;

const ProductCard = memo(function ProductCard({
  product, coins, owned, disabled, onBuy,
}: {
  product: StoreProduct;
  coins: number;
  owned: number;
  disabled: boolean;
  onBuy: (itemId: GameplayItemId) => Promise<{ status: 'success' | 'insufficientFunds' | 'invalidItem' }>;
}) {
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const price = product.price.kind === 'coins' ? product.price.amount : 0;
  const affordable = coins >= price;
  const itemId = product.icon.itemId;

  const show = useCallback((next: Notice) => {
    if (timer.current) clearTimeout(timer.current);
    setNotice(next);
    timer.current = setTimeout(() => setNotice(null), NOTICE_MS);
  }, []);

  const buy = useCallback(async () => {
    if (busy || disabled) return;
    setBusy(true);
    const res = await onBuy(itemId);
    setBusy(false);
    if (res.status === 'success') {
      feedback.emit('reward');
      show({ kind: 'ok', text: `+1 ${product.title}` });
    } else {
      feedback.emit('denied');
      show({ kind: 'error', text: res.status === 'insufficientFunds' ? 'Not enough coins' : 'Unavailable' });
    }
  }, [busy, disabled, onBuy, itemId, product.title, show]);

  return (
    <View style={styles.card}>
      <View style={styles.plate}>
        {itemId === 'undo' ? <UndoGlyph size={30} /> : null}
        {itemId === 'extraSlot' ? <SlotGlyph size={30} /> : null}
        {itemId === 'bomb' ? <BombGlyph size={30} /> : null}
      </View>

      <View style={styles.body}>
        <Text style={styles.name}>{product.title.toUpperCase()}</Text>
        <Text style={styles.description}>{product.description}</Text>
        {notice ? (
          <Text style={[styles.owned, notice.kind === 'ok' ? styles.noticeOk : styles.noticeError]}>{notice.text}</Text>
        ) : (
          <Text style={styles.owned}>OWNED <Text style={styles.ownedCount}>{owned}</Text></Text>
        )}
      </View>

      <View style={styles.buyCol}>
        <View style={styles.price}>
          <CoinMedallion size={16} />
          <Text style={[styles.priceText, !affordable && styles.priceShort]}>{price}</Text>
        </View>
        <Pressable
          onPress={buy}
          disabled={busy || disabled}
          accessibilityRole="button"
          accessibilityLabel={`Buy ${product.title} for ${price} coins. You own ${owned}.`}
          accessibilityHint={affordable ? undefined : 'Not enough coins'}
          style={({ pressed }) => [
            styles.buy,
            !affordable && styles.buyShort,
            pressed && styles.buyPressed,
          ]}
        >
          <Text style={[styles.buyText, !affordable && styles.buyTextShort]}>BUY</Text>
        </Pressable>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: AV.shellBottom },
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 6,
  },
  title: { fontFamily: AV_FONT.black, fontSize: 26, color: AV.white, letterSpacing: 1.5 },
  balance: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingLeft: 5,
    paddingRight: 12,
    height: 36,
    borderRadius: 18,
    backgroundColor: AV.glassDeep,
    borderWidth: 1,
    borderColor: AV.glassBorder,
  },
  balanceText: {
    fontFamily: AV_FONT.black,
    fontSize: 17,
    color: AV.white,
    fontVariant: ['tabular-nums'],
    minWidth: 36,
  },
  content: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 24, gap: 10 },
  section: {
    fontFamily: AV_FONT.extraBold,
    fontSize: 12,
    letterSpacing: 2,
    color: AV.textSecondary,
    marginLeft: 4,
    marginBottom: 2,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 14,
    borderRadius: 20,
    backgroundColor: AV.glass,
    borderWidth: 1,
    borderColor: AV.glassBorder,
  },
  plate: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: AV.plate,
    borderBottomWidth: 4,
    borderBottomColor: AV.plateLip,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1, gap: 3 },
  name: { fontFamily: AV_FONT.black, fontSize: 16, color: AV.white, letterSpacing: 0.8 },
  description: { fontFamily: AV_FONT.medium, fontSize: 13, lineHeight: 17, color: AV.textSecondary },
  owned: { fontFamily: AV_FONT.extraBold, fontSize: 12, letterSpacing: 1, color: AV.textSecondary, marginTop: 2 },
  ownedCount: { color: AV.white, fontVariant: ['tabular-nums'] },
  noticeOk: { color: AV.mint },
  noticeError: { color: AV.coral },
  buyCol: { alignItems: 'center', gap: 6 },
  price: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  priceText: { fontFamily: AV_FONT.black, fontSize: 15, color: AV.gold, fontVariant: ['tabular-nums'] },
  priceShort: { color: AV.textSecondary },
  buy: {
    minWidth: 72,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AV.gold,
    borderBottomWidth: 3,
    borderBottomColor: AV.goldLip,
  },
  buyShort: { backgroundColor: AV.glassDeep, borderBottomColor: 'transparent' },
  buyPressed: { transform: [{ translateY: 2 }], borderBottomWidth: 1 },
  buyText: { fontFamily: AV_FONT.black, fontSize: 14, color: AV.goldInk, letterSpacing: 1 },
  buyTextShort: { color: AV.textSecondary },
});
