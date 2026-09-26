import { memo, useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { LevelDifficulty } from '@/game/engine/types';
import { devLevelIndex, filterDevLevels, type DevLevelFilter, type DevLevelRow } from '@/game/levels/devLevelIndex';
import { AV, AV_FONT } from '@/theme/arcadiaV2';

interface DevLevelBrowserScreenProps {
  onPlay: (levelId: number) => void;
  onClose: () => void;
}

/**
 * DEV-ONLY Level Browser. Lists every authored level with metadata derived
 * from the runtime definitions and launches any of them in dev test mode.
 * Only ever reached through the `__DEV__`-gated `/dev/levels` route.
 */
export function DevLevelBrowserScreen({ onPlay, onClose }: DevLevelBrowserScreenProps) {
  const rows = useMemo(() => devLevelIndex(), []);
  const worlds = useMemo(() => {
    const seen = new Map<number, string>();
    for (const row of rows) if (row.world > 0 && !seen.has(row.world)) seen.set(row.world, row.worldTitle);
    return [...seen.entries()].sort((a, b) => a[0] - b[0]);
  }, [rows]);
  const difficulties = useMemo(
    () => [...new Set(rows.map((r) => r.difficulty))],
    [rows],
  );

  const [filter, setFilter] = useState<DevLevelFilter>({ world: 0, difficulty: 'all', query: '' });
  const visible = useMemo(() => filterDevLevels(rows, filter), [rows, filter]);

  const renderItem = useCallback(
    ({ item }: { item: DevLevelRow }) => <LevelRow row={item} onPlay={onPlay} />,
    [onPlay],
  );

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={onClose} hitSlop={10} accessibilityRole="button" accessibilityLabel="Close level browser">
          <Text style={styles.close}>‹ HOME</Text>
        </Pressable>
        <Text style={styles.title}>DEV LEVELS</Text>
        <Text style={styles.count}>{visible.length}/{rows.length}</Text>
      </View>
      <Text style={styles.notice}>Dev test mode — no progress, rewards or item use is saved.</Text>

      <TextInput
        style={styles.search}
        placeholder="Level # or title"
        placeholderTextColor={AV.textSecondary}
        value={filter.query}
        onChangeText={(query) => setFilter((f) => ({ ...f, query }))}
        autoCorrect={false}
        autoCapitalize="none"
        clearButtonMode="while-editing"
      />

      <ChipRow>
        <Chip label="ALL" on={filter.world === 0} onPress={() => setFilter((f) => ({ ...f, world: 0 }))} />
        {worlds.map(([n, title]) => (
          <Chip
            key={n}
            label={`W${n}`}
            hint={title}
            on={filter.world === n}
            onPress={() => setFilter((f) => ({ ...f, world: n }))}
          />
        ))}
      </ChipRow>
      <ChipRow>
        <Chip label="ALL" on={filter.difficulty === 'all'} onPress={() => setFilter((f) => ({ ...f, difficulty: 'all' }))} />
        {difficulties.map((d) => (
          <Chip
            key={d}
            label={d.toUpperCase()}
            on={filter.difficulty === d}
            onPress={() => setFilter((f) => ({ ...f, difficulty: d as LevelDifficulty }))}
          />
        ))}
      </ChipRow>

      <FlatList
        data={visible}
        keyExtractor={(row) => String(row.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        initialNumToRender={20}
        ListEmptyComponent={<Text style={styles.empty}>No levels match.</Text>}
      />
    </SafeAreaView>
  );
}

function ChipRow({ children }: { children: React.ReactNode }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll} contentContainerStyle={styles.chips}>
      {children}
    </ScrollView>
  );
}

function Chip({ label, hint, on, onPress }: { label: string; hint?: string; on: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: on }}
      accessibilityLabel={hint ? `${label} ${hint}` : label}
      style={[styles.chip, on && styles.chipOn]}
    >
      <Text style={[styles.chipText, on && styles.chipTextOn]}>{label}</Text>
    </Pressable>
  );
}

const LevelRow = memo(function LevelRow({ row, onPlay }: { row: DevLevelRow; onPlay: (id: number) => void }) {
  const extras = [
    `${row.pals} pals`,
    `hold ${row.holdingCapacity}`,
    row.witness !== undefined ? `witness ${row.witness}` : null,
    row.ruleset,
  ].filter(Boolean).join(' · ');
  return (
    <Pressable
      onPress={() => onPlay(row.id)}
      accessibilityRole="button"
      accessibilityLabel={`Play level ${row.id}, ${row.title}`}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
    >
      <Text style={styles.rowId}>{row.id}</Text>
      <View style={styles.rowBody}>
        <Text style={styles.rowTitle} numberOfLines={1}>{row.title}</Text>
        <Text style={styles.rowMeta} numberOfLines={1}>
          W{row.world} {row.worldTitle} · <Text style={styles.rowDifficulty}>{row.difficulty}</Text>
        </Text>
        <Text style={styles.rowMeta} numberOfLines={1}>
          {row.width}×{row.height} · {row.pixels} px · {row.colors} colors
        </Text>
        <Text style={styles.rowExtra} numberOfLines={1}>{extras}</Text>
      </View>
      <View style={styles.play}>
        <Text style={styles.playText}>PLAY</Text>
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: AV.shellBottom },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  close: { fontFamily: AV_FONT.extraBold, fontSize: 14, color: AV.textSecondary },
  title: { fontFamily: AV_FONT.black, fontSize: 18, color: AV.gold, letterSpacing: 1 },
  count: { fontFamily: AV_FONT.extraBold, fontSize: 13, color: AV.textSecondary, fontVariant: ['tabular-nums'] },
  notice: {
    marginTop: 6,
    marginHorizontal: 16,
    fontFamily: AV_FONT.semibold,
    fontSize: 11,
    color: AV.gold,
    textAlign: 'center',
  },
  search: {
    marginTop: 10,
    marginHorizontal: 16,
    height: 38,
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: AV.glassDeep,
    borderWidth: 1,
    borderColor: AV.glassBorder,
    color: AV.white,
    fontFamily: AV_FONT.semibold,
    fontSize: 14,
  },
  chipScroll: { flexGrow: 0, marginTop: 8 },
  chips: { paddingHorizontal: 16, gap: 6 },
  chip: {
    height: 28,
    paddingHorizontal: 10,
    borderRadius: 14,
    justifyContent: 'center',
    backgroundColor: AV.glassSoft,
    borderWidth: 1,
    borderColor: AV.glassBorder,
  },
  chipOn: { backgroundColor: AV.gold, borderColor: AV.gold },
  chipText: { fontFamily: AV_FONT.extraBold, fontSize: 12, color: AV.textSecondary },
  chipTextOn: { color: AV.goldInk },
  list: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 24, gap: 8 },
  empty: { textAlign: 'center', marginTop: 40, color: AV.textSecondary, fontFamily: AV_FONT.semibold },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: AV.glass,
    borderWidth: 1,
    borderColor: AV.glassBorder,
  },
  rowPressed: { opacity: 0.7 },
  rowId: {
    width: 44,
    textAlign: 'center',
    fontFamily: AV_FONT.black,
    fontSize: 22,
    color: AV.white,
    fontVariant: ['tabular-nums'],
  },
  rowBody: { flex: 1, gap: 1 },
  rowTitle: { fontFamily: AV_FONT.extraBold, fontSize: 15, color: AV.white },
  rowMeta: { fontFamily: AV_FONT.semibold, fontSize: 12, color: AV.textSecondary },
  rowDifficulty: { color: AV.gold },
  rowExtra: { fontFamily: AV_FONT.medium, fontSize: 11, color: AV.textSecondary, opacity: 0.8 },
  play: {
    height: 34,
    paddingHorizontal: 12,
    borderRadius: 10,
    justifyContent: 'center',
    backgroundColor: AV.gold,
  },
  playText: { fontFamily: AV_FONT.black, fontSize: 13, color: AV.goldInk },
});
