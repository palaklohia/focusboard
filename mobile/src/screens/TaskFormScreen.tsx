import { useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { api, ApiError } from '../lib/api';
import { isValidDateString, localDateString, toInputDate } from '../lib/format';
import { priorityChoices, taskStatusChoices } from '../lib/labels';
import { Button, Chip, Field, FilterChips } from '../components/ui';
import { colors } from '../theme';
import type { RootStackParamList } from '../navigation/types';
import type { Priority, TaskStatus } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'TaskForm'>;

export default function TaskFormScreen({ route, navigation }: Props) {
  const { projectId, task } = route.params;
  const [name, setName] = useState(task?.name ?? '');
  const [description, setDescription] = useState(task?.description ?? '');
  const [priority, setPriority] = useState<Priority>(task?.priority ?? 'MEDIUM');
  const [status, setStatus] = useState<TaskStatus>(task?.status ?? 'PENDING');
  const [dueDate, setDueDate] = useState(toInputDate(task?.dueDate ?? null));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function save() {
    setFormError('');
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = 'Task name is required';
    else if (name.trim().length > 150) next.name = 'Task name must be at most 150 characters';
    if (description.length > 2000) next.description = 'Description must be at most 2000 characters';
    if (dueDate && !isValidDateString(dueDate)) next.dueDate = 'Use the format YYYY-MM-DD, for example 2026-10-31';
    setErrors(next);
    if (Object.keys(next).length) return;

    const fields = {
      name: name.trim(),
      description: description.trim() || null,
      priority,
      status,
      dueDate: dueDate || null,
    };

    setSaving(true);
    try {
      if (task) await api('/tasks/' + task.id, { method: 'PUT', body: fields });
      else await api('/tasks', { method: 'POST', body: { ...fields, projectId } });
      navigation.goBack();
    } catch (e) {
      if (e instanceof ApiError && e.details?.length) {
        setErrors(Object.fromEntries(e.details.map((d) => [d.field, d.message])));
      } else {
        setFormError(e instanceof Error ? e.message : 'Something went wrong');
      }
      setSaving(false);
    }
  }

  function confirmDelete() {
    if (!task) return;
    Alert.alert('Delete task?', '"' + task.name + '" will be permanently deleted.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setDeleting(true);
          try {
            await api('/tasks/' + task.id, { method: 'DELETE' });
            navigation.goBack();
          } catch (e) {
            setDeleting(false);
            Alert.alert('Could not delete the task', e instanceof Error ? e.message : 'Something went wrong');
          }
        },
      },
    ]);
  }

  return (
    <ScrollView style={{ backgroundColor: colors.cream }} contentContainerStyle={{ padding: 20, gap: 18, paddingBottom: 48 }} keyboardShouldPersistTaps="handled">
      <Field label="Task name" value={name} onChangeText={setName} placeholder="e.g. Design homepage" error={errors.name} />
      <Field label="Description" value={description} onChangeText={setDescription} placeholder="Any details worth remembering?" multiline error={errors.description} />

      <View style={{ gap: 8 }}>
        <Text style={{ fontSize: 13, fontWeight: '700', color: colors.ink }}>Priority</Text>
        <FilterChips options={priorityChoices} value={priority} onChange={setPriority} />
      </View>

      <View style={{ gap: 8 }}>
        <Text style={{ fontSize: 13, fontWeight: '700', color: colors.ink }}>Status</Text>
        <FilterChips options={taskStatusChoices} value={status} onChange={setStatus} />
      </View>

      <View style={{ gap: 10 }}>
        <Field
          label="Due date"
          value={dueDate}
          onChangeText={setDueDate}
          placeholder="YYYY-MM-DD"
          keyboardType="numbers-and-punctuation"
          maxLength={10}
          error={errors.dueDate}
        />
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Chip label="Today" active={dueDate === localDateString(0)} onPress={() => setDueDate(localDateString(0))} />
          <Chip label="Tomorrow" active={dueDate === localDateString(1)} onPress={() => setDueDate(localDateString(1))} />
          <Chip label="No date" active={dueDate === ''} onPress={() => setDueDate('')} />
        </View>
      </View>

      {!!formError && (
        <Text style={{ backgroundColor: colors.coral100, color: colors.coral500, fontWeight: '600', padding: 12, borderRadius: 14, overflow: 'hidden' }}>{formError}</Text>
      )}

      <Button title={task ? 'Save changes' : 'Add task'} onPress={save} loading={saving} disabled={deleting} />
      {task && <Button title="Delete task" icon="trash-outline" variant="danger" onPress={confirmDelete} loading={deleting} disabled={saving} />}
    </ScrollView>
  );
}
