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
