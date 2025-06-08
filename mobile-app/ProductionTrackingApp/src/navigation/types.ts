import { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  Auth: undefined;
  Main: NavigatorScreenParams<MainStackParamList>;
};

export type AuthStackParamList = {
  Login: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Machines: undefined;
  Employees: undefined;
  Customers: undefined;
  WireProduction: undefined;
  More: undefined;
};

export type MainStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList>;
  MachineDetail: { machineId: string };
  EmployeeDetail: { employeeId: string };
  WorkOrderDetail: { workOrderId: string };
  CustomerDetail: { customerId: string };
  AddEditMachine: { machineId?: string };
  AddEditEmployee: { employeeId?: string };
  AddEditCustomer: { customerId?: string };
  WireCalculator: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends MainStackParamList {}
  }
} 