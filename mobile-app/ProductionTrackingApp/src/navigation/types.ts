import { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  Auth: undefined;
  Main: NavigatorScreenParams<MainStackParamList>;
};

export type MainStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList>;
  EmployeeDetail: { employeeId: string };
  MachineDetail: { machineId: string };
  WorkOrderDetail: { workOrderId: string };
  CustomerDetail: { customerId: string };
};

export type MainTabParamList = {
  Dashboard: undefined;
  WorkOrders: undefined;
  Machines: undefined;
  Customers: undefined;
  Employees: undefined;
  Profile: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
}; 