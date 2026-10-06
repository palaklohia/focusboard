import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useApiData } from '../lib/useApiData';
import { timeAgo } from '../lib/format';
import { Card, EmptyState, ErrorState, IconName, Loading, PriorityBadge } from '../components/ui';
import { colors, shadow } from '../theme';
import type { DashboardData } from '../types';

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function DashboardScreen() {
  const { user } = useAuth();
  const { data, loading, refreshing, error, retry, refresh } = useApiData<DashboardData>('/dashboard');

  if (loading) return <Loading label="Loading your dashboard…" />;
  if (error || !data) return <ErrorState message={error || 'Could not load the dashboard'} onRetry={retry} />;

  const { stats, upNext, recentActivity } = data;
  const pct = stats.totalTasks ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0;

  const cards: { label: string; value: number; icon: IconName; bg: string; fg: string }[] = [
    { label: 'Total projects', value: stats.totalProjects, icon: 'folder-outline', bg: colors.brand50, fg: colors.brand600 },
    { label: 'Total tasks', value: stats.totalTasks, icon: 'list-outline', bg: colors.sun100, fg: colors.sun500 },
    { label: 'Completed tasks', value: stats.completedTasks, icon: 'checkmark-circle-outline', bg: colors.mint100, fg: colors.mint500 },
    { label: 'Pending tasks', value: stats.pendingTasks, icon: 'time-outline', bg: colors.coral100, fg: colors.coral500 },
    { label: 'Projects in progress', value: stats.projectsInProgress, icon: 'rocket-outline', bg: colors.brand50, fg: colors.brand600 },
  ];

  return (
    <ScrollView
      contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 32 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.brand600} colors={[colors.brand600]} />}
    >
      <LinearGradient colors={[colors.brand600, colors.brand500, '#c58bff']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.hero}>
        <Text style={s.heroSmall}>{greeting()}</Text>
        <Text style={s.heroName}>{user?.fullName.split(' ')[0]}</Text>
        {stats.overdueTasks > 0 ? (
          <View style={s.pill}>
            <Ionicons name="warning-outline" size={15} color="#fff" />
            <Text style={s.pillText}>
              {stats.overdueTasks} overdue {stats.overdueTasks === 1 ? 'task needs' : 'tasks need'} attention
            </Text>
          </View>
        ) : (
          <Text style={s.heroSmall}>Nothing overdue. Nice work.</Text>
        )}
        <View style={{ marginTop: 18 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text style={s.progressText}>Overall progress</Text>
            <Text style={s.progressText}>{pct}%</Text>
          </View>
          <View style={s.progressTrack}>
            <View style={[s.progressFill, { width: `${pct}%` }]} />
          </View>
        </View>
      </LinearGradient>

      <View style={s.grid}>
        {cards.map((c) => (
          <View key={c.label} style={s.stat}>
            <View style={[s.statIcon, { backgroundColor: c.bg }]}>
              <Ionicons name={c.icon} size={20} color={c.fg} />
            </View>
            <Text style={s.statValue}>{c.value}</Text>
            <Text style={s.statLabel}>{c.label}</Text>
          </View>
        ))}
      </View>

      <Card style={{ gap: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Ionicons name="sparkles" size={20} color={colors.brand600} />
          <Text style={s.sectionTitle}>Up next</Text>
        </View>
        {upNext.length === 0 ? (
          <EmptyState title="Nothing to focus on yet" text="Create a project on the web and add tasks to see your top priorities here." />
        ) : (
          upNext.map((t, i) => (
            <View key={t.id} style={s.upNextRow}>
              <View style={s.rank}>
                <Text style={s.rankText}>{i + 1}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.upNextName} numberOfLines={1}>{t.name}</Text>
                <Text style={s.upNextSub} numberOfLines={1}>
                  {t.project?.name} · {t.focus.reason}
                </Text>
              </View>
              <PriorityBadge priority={t.priority} />
            </View>
          ))
        )}
      </Card>

      <Card style={{ gap: 14 }}>
        <Text style={s.sectionTitle}>Recent activity</Text>
        {recentActivity.length === 0 ? (
          <Text style={s.upNextSub}>Your activity will show up here.</Text>
        ) : (
          recentActivity.map((a) => (
            <View key={a.id} style={{ flexDirection: 'row', gap: 10 }}>
              <View style={s.dot} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.ink }}>{a.message}</Text>
                <Text style={s.upNextSub}>{timeAgo(a.createdAt)}</Text>
              </View>
            </View>
          ))
        )}
      </Card>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  hero: { borderRadius: 28, padding: 22, ...shadow },
  heroSmall: { color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: '600' },
  heroName: { color: '#fff', fontSize: 34, fontWeight: '800', marginBottom: 10 },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.22)', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7 },
  pillText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  progressText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  progressTrack: { height: 10, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.28)', overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 999, backgroundColor: '#fff' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  stat: { width: '47.8%', flexGrow: 1, backgroundColor: colors.white, borderRadius: 22, padding: 16, ...shadow },
  statIcon: { width: 38, height: 38, borderRadius: 13, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  statValue: { fontSize: 30, fontWeight: '800', color: colors.ink },
  statLabel: { fontSize: 13, fontWeight: '600', color: colors.inkSoft, marginTop: 2 },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: colors.ink },
  upNextRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.cream, borderRadius: 18, padding: 12 },
  rank: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  rankText: { fontWeight: '800', color: colors.brand600 },
  upNextName: { fontSize: 15, fontWeight: '700', color: colors.ink },
  upNextSub: { fontSize: 12, color: colors.inkSoft, marginTop: 2 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.brand500, marginTop: 5 },
});
