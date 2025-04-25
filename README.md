# ProdTrack - Production Management System

<div align="center">
  <img src="https://raw.githubusercontent.com/yourusername/production-tracking-system/main/public/favicon.svg" alt="ProdTrack Logo" width="120" height="120">
</div>

A comprehensive open-source production management system for manufacturing companies, focused on order management, work orders, machine monitoring, and wire production calculation.

## Features

- **Order Management**: Create and track customer orders
- **Work Order Management**: Manage production work orders 
- **Machine Management**: Track machine status and operation
- **Employee Management**: Manage employee records and work assignments
- **Customer Management**: Maintain customer database
- **Wire Production Calculator**: Calculate and analyze wire production metrics

## Tech Stack

- **Frontend**: Next.js, React, TypeScript, TailwindCSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Custom authentication system

## Setup Instructions

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
Create a `.env.local` file with the following variables:
```
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

## Open Source

This project is open source under the MIT License. Any company-specific information has been removed to make it a truly open-source solution for anyone to use and contribute to.

## Rebranding

This project was rebranded as ProdTrack with a new logo and identity focused on being an open-source solution for production tracking needs.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

[MIT](LICENSE)

## Veri Erişim Servisi (Data Service)

Proje, veri tabanı erişimi için merkezi bir servis kullanmaktadır. Bu, Row Level Security (RLS) politikalarını güvenli bir şekilde yönetmeyi sağlar.

### API Kullanımı

Veritabanı işlemleri için merkezi API endpoint'i:

```typescript
// Çalışan bilgilerini çekmek
import { getData } from "./lib/dataService";

// Tüm çalışanları getir
const employees = await getData('employees');

// Belirli filtrelere göre çalışanları getir
const activeEmployees = await getData('employees', { status: 'active' });

// Yeni çalışan ekle
import { createData } from "./lib/dataService";

await createData('employees', {
  name: 'Ahmet Yılmaz',
  email: 'ahmet@example.com',
  phone: '5551234567'
});

// Çalışan bilgilerini güncelle
import { updateData } from "./lib/dataService";

await updateData('employees', 
  { name: 'Ahmet Yılmaz (Üretim)' }, // Güncellenecek veriler
  { id: '123e4567-e89b-12d3-a456-426614174000' } // Filtreler
);

// Çalışan sil
import { deleteData } from "./lib/dataService";

await deleteData('employees', { id: '123e4567-e89b-12d3-a456-426614174000' });
```

### Supabase Row Level Security (RLS)

Bu proje Supabase veritabanı kullanmaktadır ve güvenlik için Row Level Security (RLS) politikalarını destekler.

RLS politikaları aktif olduğunda, client tarafından doğrudan veritabanına erişim kısıtlanır. Bu durumda iki seçenek vardır:

1. **API üzerinden erişim (Önerilen)**: Bu projede kullanılan yöntem budur. Sunucu tarafında çalışan API endpoint'leri, service role key kullanarak RLS kısıtlamalarını güvenli bir şekilde aşar.

2. **RLS Politikaları Yapılandırma**: Supabase konsolundan direkt erişim için RLS politikalarını ayarlanabilir.

#### RLS Politikalarını Etkinleştirme/Düzenleme

Supabase konsolunda RLS politikalarını yönetmek için:

1. [Supabase Dashboard](https://app.supabase.io/)'a giriş yapın
2. Projenizi seçin
3. Sol menüden "Authentication" > "Policies" seçin
4. İlgili tabloyu bulun ve politikalarını düzenleyin

Örnek RLS politikası:

```sql
-- Sadece giriş yapmış kullanıcılar kendi verilerini görebilir
CREATE POLICY "Users can view own data" ON employees
  FOR SELECT
  USING (auth.uid() = user_id);

-- Sadece admin rolüne sahip kullanıcılar yeni kayıt ekleyebilir
CREATE POLICY "Only admins can insert" ON employees
  FOR INSERT
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');
```
