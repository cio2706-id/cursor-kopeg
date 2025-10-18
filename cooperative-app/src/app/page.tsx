import Layout from '@/components/layout/Layout'
import Link from 'next/link'
import { 
  UserGroupIcon, 
  CurrencyDollarIcon, 
  ChartBarIcon,
  ShieldCheckIcon,
  ClockIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'

const features = [
  {
    name: 'Data Anggota Terintegrasi',
    description: 'Sinkronisasi otomatis dengan sistem Accurate.id untuk data karyawan yang akurat dan terkini.',
    icon: UserGroupIcon,
  },
  {
    name: 'Manajemen Pinjaman',
    description: 'Sistem pengajuan pinjaman dengan approval multilevel dan integrasi ke sistem akuntansi.',
    icon: CurrencyDollarIcon,
  },
  {
    name: 'Laporan Keuangan',
    description: 'Dashboard real-time untuk monitoring transaksi dan laporan keuangan terintegrasi.',
    icon: ChartBarIcon,
  },
  {
    name: 'Keamanan Data',
    description: 'Enkripsi data dan kontrol akses berbasis peran untuk keamanan informasi anggota.',
    icon: ShieldCheckIcon,
  },
]

const stats = [
  { name: 'Total Anggota', value: '1,200+' },
  { name: 'Pinjaman Aktif', value: 'Rp 2.5M' },
  { name: 'Tingkat Kepuasan', value: '98%' },
  { name: 'Tahun Berpengalaman', value: '15+' },
]

const approvalSteps = [
  { name: 'Staff', description: 'Review awal dan validasi dokumen' },
  { name: 'Manager', description: 'Evaluasi kelayakan dan analisis risiko' },
  { name: 'Bendahara', description: 'Verifikasi keuangan dan persetujuan' },
  { name: 'Ketua', description: 'Persetujuan akhir dan otorisasi' },
]

export default function HomePage() {
  return (
    <Layout>
      <div className="bg-white">
        {/* Hero section */}
        <div className="relative overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
              <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
                <div className="sm:text-center lg:text-left">
                  <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                    <span className="block xl:inline">Sistem Manajemen</span>{' '}
                    <span className="block text-indigo-600 xl:inline">Koperasi Karyawan</span>
                  </h1>
                  <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                    Platform terintegrasi untuk mengelola data anggota, pinjaman, dan transaksi keuangan 
                    dengan sistem akuntansi Accurate.id yang handal dan aman.
                  </p>
                  <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                    <div className="rounded-md shadow">
                      <Link
                        href="/login"
                        className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10"
                      >
                        Mulai Sekarang
                      </Link>
                    </div>
                    <div className="mt-3 sm:mt-0 sm:ml-3">
                      <Link
                        href="#features"
                        className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 md:py-4 md:text-lg md:px-10"
                      >
                        Pelajari Lebih Lanjut
                      </Link>
                    </div>
                  </div>
                </div>
              </main>
            </div>
          </div>
          <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
            <div className="h-56 w-full bg-gradient-to-r from-indigo-500 to-purple-600 sm:h-72 md:h-96 lg:w-full lg:h-full flex items-center justify-center">
              <div className="text-white text-center">
                <ChartBarIcon className="mx-auto h-32 w-32 mb-4" />
                <h3 className="text-2xl font-bold">Dashboard Terintegrasi</h3>
                <p className="text-lg opacity-90">Monitoring real-time semua aktivitas koperasi</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats section */}
        <div className="bg-indigo-50 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.name} className="text-center">
                  <div className="text-3xl font-bold text-indigo-600">{stat.value}</div>
                  <div className="text-sm text-gray-500">{stat.name}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Features section */}
        <div id="features" className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:text-center">
              <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Fitur Unggulan</h2>
              <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                Solusi Lengkap untuk Koperasi Modern
              </p>
              <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
                Platform terintegrasi yang memudahkan pengelolaan koperasi dengan teknologi terkini.
              </p>
            </div>

            <div className="mt-10">
              <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
                {features.map((feature) => (
                  <div key={feature.name} className="relative">
                    <dt>
                      <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                        <feature.icon className="h-6 w-6" aria-hidden="true" />
                      </div>
                      <p className="ml-16 text-lg leading-6 font-medium text-gray-900">{feature.name}</p>
                    </dt>
                    <dd className="mt-2 ml-16 text-base text-gray-500">{feature.description}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>

        {/* Approval Process section */}
        <div className="bg-gray-50 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:text-center">
              <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Proses Approval</h2>
              <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                Sistem Persetujuan Multilevel
              </p>
              <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
                Proses pengajuan pinjaman yang transparan dan terstruktur dengan 4 tingkat persetujuan.
              </p>
            </div>

            <div className="mt-10">
              <div className="flow-root">
                <ul className="-mb-8">
                  {approvalSteps.map((step, stepIdx) => (
                    <li key={step.name}>
                      <div className="relative pb-8">
                        {stepIdx !== approvalSteps.length - 1 ? (
                          <span
                            className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                            aria-hidden="true"
                          />
                        ) : null}
                        <div className="relative flex space-x-3">
                          <div>
                            <span className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center ring-8 ring-white">
                              <CheckCircleIcon className="h-5 w-5 text-white" />
                            </span>
                          </div>
                          <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{step.name}</p>
                              <p className="text-sm text-gray-500">{step.description}</p>
                            </div>
                            <div className="text-right text-sm whitespace-nowrap text-gray-500">
                              <ClockIcon className="inline h-4 w-4 mr-1" />
                              <span>1-2 hari</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* CTA section */}
        <div className="bg-indigo-700">
          <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              <span className="block">Siap untuk memulai?</span>
              <span className="block">Bergabunglah dengan sistem koperasi modern.</span>
            </h2>
            <p className="mt-4 text-lg leading-6 text-indigo-200">
              Dapatkan akses ke platform manajemen koperasi yang terintegrasi dan mudah digunakan.
            </p>
            <Link
              href="/login"
              className="mt-8 w-full inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50 sm:w-auto"
            >
              Masuk ke Dashboard
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  )
}