import { useState } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { buildQuery } from '../lib/api';
import { useApiData } from '../lib/useApiData';
import { useDebounce } from '../lib/useDebounce';
import { toggleTask } from '../lib/tasks';
import { formatDate } from '../lib/format';
import { PROJECT_STATUS_LABEL } from '../lib/labels';
import { Button, Card, EmptyState, ErrorState, HealthBadge, Loading, ProgressBar, StatusPill } from '../components/ui';
import { TaskFilters, TaskRow } from '../components/TaskParts';
import { colors } from '../theme';
import type { RootStackParamList } from '../navigation/types';
import type { Paginated, Priority, Project, Task, TaskStatus } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'ProjectDetail'>;

export default function ProjectDetailScreen({ route, navigation }: Props) {
  const { projectId } = route.params;
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'' | TaskStatus>('');
  const [priority, setPriority] = useState<'' | Priority>('');
  const debounced = useDebounce(search, 300);

  const project = useApiData<{ project: Project }>('/projects/' + projectId);
  const tasks = useApiData<Paginated<Task>>(
    '/tasks' +
      buildQuery({
        projectId,
        limit: '100',
        sortBy: 'createdAt',
        order: 'asc',
        search: debounced || undefined,
        status: status || undefined,
        priority: priority || undefined,
      }),
  );

  if (project.loading) return <Loading label="Loading project…" />;
  if (project.error || !project.data) {
    return <ErrorState message={project.error || 'Could not load the project'} onRetry={() => { project.retry(); tasks.retry(); }} />;
  }

  const p = project.data.project;
  const filtering = !!debounced || !!status || !!priority;

  async function onToggle(t: Task) {
    try {
      await toggleTask(t);
      project.reload();
      tasks.reload();
    } catch (e) {
      Alert.alert('Could not update the task', e instanceof Error ? e.message : 'Something went wrong');
    }
  }

  const openForm = (task?: Task) => navigation.navigate('TaskForm', { projectId: p.id, task });

  return (
    <ScrollView
      contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 40 }}
      keyboardShouldPersistTaps="handled"
      refreshControl={
        <RefreshControl
          refreshing={project.refreshing || tasks.refreshing}
          onRefresh={() => { project.refresh(); tasks.refresh(); }}
          tintColor={colors.brand600}
          colors={[colors.brand600]}
        />
      }
    >
      <Card style={{ gap: 10 }}>
        <View style={s.badges}>
          <HealthBadge health={p.health} />
          <StatusPill label={PROJECT_STATUS_LABEL[p.status]} />
        </View>
        <Text style={s.title}>{p.name}</Text>
        {!!p.description && <Text style={s.desc}>{p.description}</Text>}
        {(p.startDate || p.endDate) && (
          <Text style={s.small}>
            {p.startDate ? formatDate(p.startDate) : '…'} → {p.endDate ? formatDate(p.endDate) : '…'}
          </Text>
        )}
        <View style={{ gap: 6, marginTop: 6 }}>
          <View style={s.progressRow}>
            <Text style={s.small}>{p.completedTaskCount} of {p.taskCount} tasks completed</Text>
            <Text style={s.small}>{p.progress}%</Text>
          </View>
          <ProgressBar value={p.progress} />
        </View>
      </Card>

      <View style={s.headerRow}>
        <Text style={s.section}>Tasks</Text>
        <Button title="Add task" icon="add" onPress={() => openForm()} style={{ paddingVertical: 10, minHeight: 42 }} />
      </View>

      <TaskFilters search={search} onSearch={setSearch} status={status} onStatus={setStatus} priority={priority} onPriority={setPriority} />

      {tasks.error ? (
        <ErrorState message={tasks.error} onRetry={tasks.retry} />
      ) : (tasks.data?.data.length ?? 0) === 0 ? (
        tasks.loading ? (
          <Loading label="Loading tasks…" />
        ) : filtering ? (
          <EmptyState title="No matching tasks" text="Try a different search or clear the filters." />
        ) : (
          <EmptyState title="No tasks yet" text="Tap “Add task” to create the first one." />
        )
      ) : (
        <View style={{ gap: 12 }}>
          {tasks.data?.data.map((t) => (
            <TaskRow key={t.id} task={t} onPress={() => openForm(t)} onToggle={() => onToggle(t)} />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  title: { fontSize: 26, fontWeight: '800', color: colors.ink },
  desc: { fontSize: 15, color: colors.inkSoft, lineHeight: 21 },
  small: { fontSize: 12, fontWeight: '600', color: colors.inkSoft },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between' },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  section: { fontSize: 22, fontWeight: '800', color: colors.ink },
});
