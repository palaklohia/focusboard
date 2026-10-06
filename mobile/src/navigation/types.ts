import type { Task } from '../types';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type RootStackParamList = {
  Tabs: undefined;
  ProjectDetail: { projectId: string };
  TaskForm: { projectId: string; task?: Task };
};
