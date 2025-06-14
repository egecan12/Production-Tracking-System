# ProdTrack - Production Management System

<div align="center">

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen.svg)](https://production-tracking-system-one.vercel.app/auth/system-login)
[![Next.js](https://img.shields.io/badge/Next.js-Framework-blue.svg)](https://nextjs.org/)
[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)

A comprehensive production management system for manufacturing companies, focused on order management, work orders, machine monitoring, and wire production calculation.

<img src="https://github.com/user-attachments/assets/0ed36683-b604-4325-9340-5587d8c88c57" width="25%">

</div>
<div align="center">
  <img src="https://github.com/user-attachments/assets/cee8adea-48ea-4be2-8702-d6bc6c4a2b6d" width="100">
  <img src="https://github.com/user-attachments/assets/c306847d-808d-4534-ae0f-24a58087bac1" width="100">
  <img src="https://github.com/user-attachments/assets/ae6fb431-4bf7-4748-ae84-d04d26658438" width="100">
  <img src="https://github.com/user-attachments/assets/b6b3e31b-e88e-4153-a888-2af123bb451e" width="100">
  <img src="https://github.com/user-attachments/assets/259fea0e-45e5-43e1-8a14-9a82fc050280" width="100">
  <img src="https://github.com/user-attachments/assets/00a7aa89-47d1-4068-b7a2-b35f492c1c3d" width="100">
  <img src="https://github.com/user-attachments/assets/72228700-0d8f-46ca-b756-624d39082a4e" width="100">
  <img src="https://github.com/user-attachments/assets/db5dc336-fae5-4611-93f8-a7feb774251e" width="100">
</div>




## ✨ Key Features

- 📋 **Order Management**: Create and track customer orders
- 📝 **Work Order Management**: Manage production work orders
- 🔧 **Machine Management**: Track machine status and operation
- 👥 **Employee Management**: Manage employee records and work assignments
- 🏢 **Customer Management**: Maintain customer database
- 🧮 **Wire Production Calculator**: Calculate and analyze wire production metrics

## 🚀 Quick Start

Visit [ProdTrack Demo](https://production-tracking-system-b4f4jp3eq.vercel.app/auth/system-login) to see the application in action.

use these credencials to login

username: DemoUser
password: DemoPassword.1234

## 💻 Setup Instructions

1. Clone the repository:
```bash
git clone https://github.com/yourusername/production-tracking-system.git
cd production-tracking-system
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Create a .env.local file with:
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

4. Set up the database:
   - Create a Supabase project at https://supabase.com
   - Run the `schema.sql` file in the Supabase SQL editor
   - Create an admin user with secure credentials

5. Run the development server:
```bash
npm run dev
```

## 🛠️ Technology Stack

### Frontend
- Next.js and React for UI components
- TypeScript for type safety
- TailwindCSS for responsive styling

### Backend
- Next.js API Routes
- Supabase for database and authentication

### Database
- PostgreSQL via Supabase
- Row Level Security (RLS) policies

## ER Diagram

![473E8664-106E-4979-93F5-45101839007E](https://github.com/user-attachments/assets/50150d23-adb3-4d7d-a112-956e95f3c443)

## 📊 Data Service API

```typescript
// Fetch employee data
import { getData } from "./lib/dataService";
const employees = await getData('employees');

// Filter active employees
const activeEmployees = await getData('employees', { status: 'active' });

// Create new employee
import { createData } from "./lib/dataService";
await createData('employees', {
  name: 'Ahmet Yılmaz',
  email: 'ahmet@example.com',
  phone: '5551234567'
});

// Update employee data
import { updateData } from "./lib/dataService";
await updateData('employees', 
  { name: 'Ahmet Yılmaz (Üretim)' },
  { id: '123e4567-e89b-12d3-a456-426614174000' }
);

// Delete employee
import { deleteData } from "./lib/dataService";
await deleteData('employees', { id: '123e4567-e89b-12d3-a456-426614174000' });
```


## 🔒 Privacy & Security

This project uses Supabase Row Level Security (RLS) for data protection. All data access is managed through secure API endpoints that properly handle authentication and authorization.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

Egecan Kahyaoglu

---
<div align="center">
Made with ❤️ for manufacturing companies
</div>
