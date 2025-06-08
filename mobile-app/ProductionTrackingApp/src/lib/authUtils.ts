import AsyncStorage from '@react-native-async-storage/async-storage';

// Role-based module access
export const moduleAccess = {
  // Define allowed roles for each module
  machines: ['admin', 'manager', 'maintenance', 'user'],
  employees: ['admin', 'manager', 'hr'],
  customers: ['admin', 'manager', 'sales'],
  'wire-production': ['admin', 'manager', 'production', 'engineer']
};

// Checks if a user has access to a specific module
export const hasModuleAccess = (moduleName: string, userRole: string | null): boolean => {
  console.log(`DEBUG - hasModuleAccess called with moduleName: ${moduleName}, userRole: ${userRole}`);
  
  if (!userRole) {
    console.log(`DEBUG - No userRole provided, access denied`);
    return false;
  }
  
  // Admin can access all modules (extra check)
  // Check if contains instead of exact string match
  if (userRole.toLowerCase().includes('admin')) {
    console.log(`DEBUG - User role contains 'admin', access granted`);
    return true;
  }
  
  // List of allowed roles for the module
  const allowedRoles = moduleAccess[moduleName as keyof typeof moduleAccess];
  console.log(`DEBUG - Allowed roles for module ${moduleName}:`, allowedRoles);
  
  // If module is not defined, deny access
  if (!allowedRoles) {
    console.log(`DEBUG - Module ${moduleName} not defined in moduleAccess, access denied`);
    return false;
  }
  
  // Check if user's role is in the list of allowed roles
  const hasAccess = allowedRoles.some(role => userRole.toLowerCase().includes(role.toLowerCase()));
  console.log(`DEBUG - User with role ${userRole} access to module ${moduleName}: ${hasAccess}`);
  return hasAccess;
};

// Gets the current user role from AsyncStorage
export const getCurrentUserRole = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem('userRole');
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
};

// Special authorization controls for machine module
export const machinePermissions = {
  view: ['admin', 'manager', 'maintenance', 'user'],
  add: ['admin', 'manager', 'maintenance'],
  edit: ['admin', 'manager', 'maintenance'],
  delete: ['admin', 'manager']
};

// Detailed permission check for machine module
export const hasMachinePermission = async (action: keyof typeof machinePermissions): Promise<boolean> => {
  const userRole = await getCurrentUserRole();
  if (!userRole) return false;
  
  // Admin can perform any action
  if (userRole === 'admin') return true;
  
  // Allowed roles for the specific action
  const allowedRoles = machinePermissions[action];
  
  // Check if user's role is in the list of allowed roles
  return allowedRoles.includes(userRole);
}; 