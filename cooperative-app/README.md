# KoperasiApp - Sistem Manajemen Koperasi Karyawan

Platform terintegrasi untuk mengelola data anggota, pinjaman, dan transaksi keuangan dengan sistem akuntansi Accurate.id.

## 🚀 Fitur Utama

### 🏠 Homepage
- Landing page profesional dengan informasi perusahaan
- Highlight fitur dan statistik
- Desain modern dan responsif

### 👤 Dashboard Anggota
- **Data Pribadi**: Informasi lengkap karyawan dari Accurate.id
- **Sisa Pinjaman**: Tracking saldo pinjaman saat ini - Accurate.id - Journal voucher - Piutang karyawan (110303)
- **Simpanan**: Manajemen simpanan (coming soon)
- **Pengajuan Pinjaman**: Aplikasi pinjaman dengan simulasi

### 👨‍💼 Dashboard Pengurus
- **Data Anggota**: Semua data karyawan dari Accurate.id
- **Multilevel Approval**: Workflow persetujuan Staff → Manager → Bendahara → Ketua
- **Manajemen Pinjaman**: Proses lengkap aplikasi pinjaman → Post ke Accurate Piutang Karyawan

## 🛠️ Teknologi

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Integrasi**: Accurate.id API
- **UI Components**: Headless UI, Heroicons
- **State Management**: React Context API

## 📋 Prasyarat

- Node.js 18+ 
- npm atau yarn
- Akun Supabase
- Akun Accurate.id dengan API access

## 🚀 Instalasi

1. **Clone repository**
   ```bash
   git clone <repository-url>
   cd cooperative-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Edit `.env.local` dengan konfigurasi Anda:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

   # Accurate.id Configuration
   ACCURATE_API_URL=https://api.accurate.id
   ACCURATE_API_KEY=your_accurate_api_key_here
   ACCURATE_DATABASE_ID=your_accurate_database_id_here
   ```

4. **Setup Supabase Database**
   - Buat project baru di [Supabase](https://supabase.com)
   - Jalankan script SQL dari `supabase-schema.sql` di SQL Editor
   - Enable Row Level Security (RLS) policies

5. **Setup Accurate.id Integration**
   - Daftar akun di [Accurate.id](https://accurate.id)
   - Dapatkan API key dan database ID
   - Pastikan akun memiliki akses ke modul Journal Voucher

6. **Jalankan development server**
   ```bash
   npm run dev
   ```

7. **Buka aplikasi**
   ```
   http://localhost:3000
   ```

## 📊 Database Schema

### Tables
- `users` - Data pengguna dan role
- `members` - Data anggota (sync dengan Accurate.id)
- `loans` - Data pinjaman
- `loan_approvals` - Log persetujuan multilevel
- `transactions` - Transaksi keuangan
- `savings` - Data simpanan (future)

### Roles
- `member` - Anggota koperasi
- `staff` - Staff administrasi
- `manager` - Manager operasional
- `bendahara` - Bendahara
- `ketua` - Ketua koperasi

## 🔄 Workflow Pinjaman

1. **Pengajuan**: Anggota mengajukan pinjaman dengan simulasi
2. **Approval Staff**: Review awal dan validasi dokumen
3. **Approval Manager**: Evaluasi kelayakan dan analisis risiko
4. **Approval Bendahara**: Verifikasi keuangan dan persetujuan
5. **Approval Ketua**: Persetujuan akhir dan otorisasi
6. **Disbursement**: Pencairan dana dan posting ke Accurate.id
7. **Repayment**: Pembayaran cicilan dan update saldo

## 🔗 Integrasi Accurate.id

### Endpoints yang Digunakan
- `GET /employees` - Ambil data karyawan
- `GET /accounts/110303/balance` - Cek saldo Piutang Karyawan
- `POST /journal-vouchers` - Buat journal voucher pinjaman
- `PUT /accounts/110303/update-balance` - Update saldo pinjaman

### Mapping Akun
- `110303` - Piutang Karyawan (Asset)
- `111001` - Kas (Asset)

## 🎨 UI/UX Features

- **Responsive Design**: Mobile-first approach
- **Dark/Light Mode**: Toggle tema (coming soon)
- **Real-time Updates**: Live data dengan Supabase
- **Interactive Charts**: Visualisasi data (coming soon)
- **Form Validation**: Client dan server-side validation
- **Loading States**: Skeleton dan spinner components

## 🧪 Testing

```bash
# Run tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run e2e tests
npm run test:e2e
```

## 📦 Build & Deploy

```bash
# Build for production
npm run build

# Start production server
npm start

# Deploy to Vercel
vercel --prod
```

## 🤝 Contributing

1. Fork repository
2. Buat feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Buat Pull Request

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.

## 📞 Support

- Email: support@koperasiapp.com
- Documentation: [docs.koperasiapp.com](https://docs.koperasiapp.com)
- Issues: [GitHub Issues](https://github.com/your-org/koperasiapp/issues)

## 🗺️ Roadmap

### Phase 1 (Current)
- [x] Basic authentication
- [x] Member dashboard
- [x] Management dashboard
- [x] Loan application system
- [x] Accurate.id integration

### Phase 2 (Next)
- [ ] Savings management
- [ ] Advanced reporting
- [ ] Mobile app
- [ ] Email notifications
- [ ] Document management

### Phase 3 (Future)
- [ ] AI-powered risk assessment
- [ ] Blockchain integration
- [ ] Multi-tenant support
- [ ] Advanced analytics
- [ ] Third-party integrations