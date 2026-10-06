import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadow } from '../theme';
import { formatDate, isPastDue } from '../lib/format';
import { priorityFilter, TASK_STATUS_LABEL, taskStatusFilter } from '../lib/labels';
import { FilterChips, PriorityBadge, SearchBar, StatusPill } from './ui';
import type { Priority, Task, TaskStatus } from '../types';

export function TaskRow({
  task,
  onPress,
  onToggle,
  showProject,
}: {
  task: Task;
  onPress: () => void;
  onToggle: () => void;
  showProject?: boolean;
}) {
  const done = task.status === 'COMPLETED';
  const overdue = !done && isPastDue(task.dueDate);

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [s.row, pressed && { opacity: 0.9 }]}>
      <Pressable
        onPress={onToggle}
        hitSlop={10}
        accessibilityLabel={done ? 'Mark as pending' : 'Mark as completed'}
        style={[s.check, done && s.checkDone]}
      >
        {done && <Ionicons name="checkmark" size={16} color="#fff" />}
      </Pressable>

      <View style={{ flex: 1, gap: 6 }}>
        <Text style={[s.name, done && s.nameDone]} numberOfLines={2}>
          {task.name}
        </Text>
        {showProject && task.project && (
          <Text style={s.project} numberOfLines={1}>
            {task.project.name}
          </Text>
        )}
        <View style={s.meta}>
          <PriorityBadge priority={task.priority} />
          <StatusPill label={TASK_STATUS_LABEL[task.status]} />
          {task.dueDate && (
            <Text style={[s.due, overdue && { color: colors.coral500 }]}>
              {overdue ? 'Overdue · ' : 'Due '}
              {formatDate(task.dueDate)}
            </Text>
          )}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.inkFaint} />
    </Pressable>
  );
}

export function TaskFilters({
  search,
  onSearch,
  status,
  onStatus,
  priority,
  onPriority,
}: {
  search: string;
  onSearch: (v: string) => void;
  status: '' | TaskStatus;
  onStatus: (v: '' | TaskStatus) => void;
  priority: '' | Priority;
  onPriority: (v: '' | Priority) => void;
}) {
  return (
    <View style={{ gap: 10 }}>
      <SearchBar value={search} onChangeText={onSearch} placeholder="Search tasks by name" />
      <FilterChips options={taskStatusFilter} value={status} onChange={onStatus} />
      <FilterChips options={priorityFilter} value={priority} onChange={onPriority} />
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.white, borderRadius: 20, padding: 14, ...shadow },
  check: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: 'rgba(31,27,46,0.2)', alignItems: 'center', justifyContent: 'center' },
  checkDone: { backgroundColor: colors.mint500, borderColor: colors.mint500 },
  name: { fontSize: 15, fontWeight: '700', color: colors.ink },
  nameDone: { textDecorationLine: 'line-through', color: colors.inkFaint },
  project: { fontSize: 12, color: colors.inkSoft },
  meta: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6 },
  due: { fontSize: 12, fontWeight: '600', color: colors.inkSoft },
});
