import { useState } from 'react';
import { Alert, FlatList, RefreshControl, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { buildQuery } from '../lib/api';
import { useApiData } from '../lib/useApiData';
import { useDebounce } from '../lib/useDebounce';
import { toggleTask } from '../lib/tasks';
import { EmptyState, ErrorState, Loading } from '../components/ui';
import { TaskFilters, TaskRow } from '../components/TaskParts';
import { colors } from '../theme';
import type { RootStackParamList } from '../navigation/types';
import type { Paginated, Priority, Task, TaskStatus } from '../types';

export default function TasksScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'' | TaskStatus>('');
  const [priority, setPriority] = useState<'' | Priority>('');
  const debounced = useDebounce(search, 300);

  const { data, loading, refreshing, error, retry, refresh, reload } = useApiData<Paginated<Task>>(
    '/tasks' +
      buildQuery({
        limit: '100',
        sortBy: 'dueDate',
        order: 'asc',
        search: debounced || undefined,
        status: status || undefined,
        priority: priority || undefined,
      }),
  );

  const filtering = !!debounced || !!status || !!priority;

  async function onToggle(t: Task) {
    try {
      await toggleTask(t);
      reload();
    } catch (e) {
      Alert.alert('Could not update the task', e instanceof Error ? e.message : 'Something went wrong');
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.cream }}>
      <View style={{ padding: 16, paddingBottom: 8 }}>
        <TaskFilters search={search} onSearch={setSearch} status={status} onStatus={setStatus} priority={priority} onPriority={setPriority} />
      </View>

      {loading ? (
        <Loading label="Loading tasks…" />
      ) : error ? (
        <ErrorState message={error} onRetry={retry} />
      ) : (
        <FlatList
          data={data?.data ?? []}
          keyExtractor={(t) => t.id}
          contentContainerStyle={{ padding: 16, paddingTop: 8, gap: 12, paddingBottom: 32 }}
          keyboardShouldPersistTaps="handled"
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.brand600} colors={[colors.brand600]} />}
          ListEmptyComponent={
            filtering ? (
              <EmptyState title="No matching tasks" text="Try a different search or clear the filters." />
            ) : (
              <EmptyState title="No tasks yet" text="Open a project and tap “Add task” to create one." />
            )
          }
          renderItem={({ item: t }) => (
            <TaskRow
              task={t}
              showProject
              onPress={() => navigation.navigate('TaskForm', { projectId: t.projectId, task: t })}
              onToggle={() => onToggle(t)}
            />
          )}
        />
      )}
    </View>
  );
}
