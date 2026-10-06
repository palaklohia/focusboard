import { useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { buildQuery } from '../lib/api';
import { useApiData } from '../lib/useApiData';
import { useDebounce } from '../lib/useDebounce';
import { formatDate } from '../lib/format';
import { PROJECT_STATUS_LABEL, projectStatusFilter } from '../lib/labels';
import { Card, EmptyState, ErrorState, FilterChips, HealthBadge, Loading, ProgressBar, SearchBar, StatusPill } from '../components/ui';
import { colors } from '../theme';
import type { RootStackParamList } from '../navigation/types';
import type { Paginated, Project, ProjectStatus } from '../types';

export default function ProjectsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'' | ProjectStatus>('');
  const debounced = useDebounce(search, 300);

  const { data, loading, refreshing, error, retry, refresh } = useApiData<Paginated<Project>>(
    '/projects' + buildQuery({ limit: '100', search: debounced || undefined, status: status || undefined }),
  );

  const filtering = !!debounced || !!status;

  return (
    <View style={{ flex: 1, backgroundColor: colors.cream }}>
      <View style={{ padding: 16, paddingBottom: 8, gap: 10 }}>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Search projects by name" />
        <FilterChips options={projectStatusFilter} value={status} onChange={setStatus} />
      </View>

      {loading ? (
        <Loading label="Loading projects…" />
      ) : error ? (
        <ErrorState message={error} onRetry={retry} />
      ) : (
        <FlatList
          data={data?.data ?? []}
          keyExtractor={(p) => p.id}
          contentContainerStyle={{ padding: 16, paddingTop: 8, gap: 14, paddingBottom: 32 }}
          keyboardShouldPersistTaps="handled"
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.brand600} colors={[colors.brand600]} />}
          ListEmptyComponent={
            filtering ? (
              <EmptyState title="No matching projects" text="Try a different search or clear the filter." />
            ) : (
              <EmptyState title="No projects yet" text="Create a project on the web and it will appear here." />
            )
          }
          renderItem={({ item: p }) => (
            <Pressable onPress={() => navigation.navigate('ProjectDetail', { projectId: p.id })}>
              <Card style={{ gap: 10 }}>
                <View style={s.badges}>
                  <HealthBadge health={p.health} />
                  <StatusPill label={PROJECT_STATUS_LABEL[p.status]} />
                </View>
                <Text style={s.name}>{p.name}</Text>
                <Text style={s.desc} numberOfLines={2}>{p.description || 'No description'}</Text>
                <View style={{ gap: 6, marginTop: 4 }}>
                  <View style={s.progressRow}>
                    <Text style={s.small}>{p.completedTaskCount} of {p.taskCount} tasks done</Text>
                    <Text style={s.small}>{p.progress}%</Text>
                  </View>
                  <ProgressBar value={p.progress} />
                </View>
                {(p.startDate || p.endDate) && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Ionicons name="calendar-outline" size={14} color={colors.inkFaint} />
                    <Text style={s.small}>
                      {p.startDate ? formatDate(p.startDate) : '…'} → {p.endDate ? formatDate(p.endDate) : '…'}
                    </Text>
                  </View>
                )}
              </Card>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  name: { fontSize: 20, fontWeight: '800', color: colors.ink },
  desc: { fontSize: 14, color: colors.inkSoft, lineHeight: 20 },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between' },
  small: { fontSize: 12, fontWeight: '600', color: colors.inkSoft },
});
