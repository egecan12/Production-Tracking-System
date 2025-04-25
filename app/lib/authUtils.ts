'use client';

// Rol bazlı modül erişimi
export const moduleAccess = {
  // Her modül için izin verilen rolleri tanımlayın
  workorders: ['admin', 'manager', 'production'],
  orders: ['admin', 'manager', 'sales'],
  machines: ['admin', 'manager', 'maintenance', 'user'],
  employees: ['admin', 'manager', 'hr'],
  customers: ['admin', 'manager', 'sales'],
  'wire-production': ['admin', 'manager', 'production', 'engineer']
};

// Kullanıcının belirli bir modüle erişimi olup olmadığını kontrol eder
export const hasModuleAccess = (moduleName: string, userRole: string | null): boolean => {
  console.log(`DEBUG - hasModuleAccess called with moduleName: ${moduleName}, userRole: ${userRole}`);
  
  if (!userRole) {
    console.log(`DEBUG - No userRole provided, access denied`);
    return false;
  }
  
  // Admin her modüle erişebilir (ekstra kontrol)
  // String olarak tam eşleşme yerine içeriyor mu kontrolü
  if (userRole.toLowerCase().includes('admin')) {
    console.log(`DEBUG - User role contains 'admin', access granted`);
    return true;
  }
  
  // Modül için izin verilen roller listesi
  const allowedRoles = moduleAccess[moduleName as keyof typeof moduleAccess];
  console.log(`DEBUG - Allowed roles for module ${moduleName}:`, allowedRoles);
  
  // Eğer modül tanımlanmamışsa erişimi reddet
  if (!allowedRoles) {
    console.log(`DEBUG - Module ${moduleName} not defined in moduleAccess, access denied`);
    return false;
  }
  
  // Kullanıcının rolü izin verilen roller listesinde mi kontrol et
  const hasAccess = allowedRoles.some(role => userRole.toLowerCase().includes(role.toLowerCase()));
  console.log(`DEBUG - User with role ${userRole} access to module ${moduleName}: ${hasAccess}`);
  return hasAccess;
};

// Kullanıcının o anki rolünü localStorage'dan alır
export const getCurrentUserRole = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('userRole');
};

// Makine modülü için özel yetkilendirme kontrolleri
export const machinePermissions = {
  view: ['admin', 'manager', 'maintenance', 'user'],
  add: ['admin', 'manager', 'maintenance'],
  edit: ['admin', 'manager', 'maintenance'],
  delete: ['admin', 'manager']
};

// Makine modülü için detaylı yetki kontrolü
export const hasMachinePermission = (action: keyof typeof machinePermissions): boolean => {
  const userRole = getCurrentUserRole();
  if (!userRole) return false;
  
  // Admin her işlemi yapabilir
  if (userRole === 'admin') return true;
  
  // İlgili işlem için izin verilen roller
  const allowedRoles = machinePermissions[action];
  
  // Kullanıcının rolü izin verilen roller listesinde mi kontrol et
  return allowedRoles.includes(userRole);
}; 