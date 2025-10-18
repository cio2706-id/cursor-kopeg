'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { formatCurrency, formatDate } from '@/lib/utils'
import { 
  UserIcon, 
  CurrencyDollarIcon, 
  BanknotesIcon,
  PlusIcon,
  ClockIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'

interface MemberData {
  id: string
  name: string
  employee_id: string
  position: string
  department: string
  email: string
  phone: string
  address: string
  join_date: string
  status: string
}

interface LoanData {
  id: string
  amount: number
  status: string
  application_date: string
  monthly_payment: number
  term_months: number
}

export default function MemberDashboard() {
  const { user } = useAuth()
  const [memberData, setMemberData] = useState<MemberData | null>(null)
  const [loans, setLoans] = useState<LoanData[]>([])
  const [loanBalance, setLoanBalance] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchMemberData()
      fetchLoans()
    }
  }, [user])

  const fetchMemberData = async () => {
    try {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .eq('user_id', user?.id)
        .single()

      if (error) throw error
      setMemberData(data)
    } catch (error) {
      console.error('Error fetching member data:', error)
    }
  }

  const fetchLoans = async () => {
    try {
      const { data, error } = await supabase
        .from('loans')
        .select('*')
        .eq('member_id', memberData?.id)
        .order('application_date', { ascending: false })

      if (error) throw error
      setLoans(data || [])
      
      // Calculate total loan balance
      const activeLoans = data?.filter(loan => 
        ['approved_ketua', 'disbursed'].includes(loan.status)
      ) || []
      const totalBalance = activeLoans.reduce((sum, loan) => sum + loan.amount, 0)
      setLoanBalance(totalBalance)
    } catch (error) {
      console.error('Error fetching loans:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'approved_staff': return 'bg-blue-100 text-blue-800'
      case 'approved_manager': return 'bg-indigo-100 text-indigo-800'
      case 'approved_bendahara': return 'bg-purple-100 text-purple-800'
      case 'approved_ketua': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      case 'disbursed': return 'bg-green-100 text-green-800'
      case 'completed': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Menunggu Persetujuan'
      case 'approved_staff': return 'Disetujui Staff'
      case 'approved_manager': return 'Disetujui Manager'
      case 'approved_bendahara': return 'Disetujui Bendahara'
      case 'approved_ketua': return 'Disetujui Ketua'
      case 'rejected': return 'Ditolak'
      case 'disbursed': return 'Cair'
      case 'completed': return 'Lunas'
      default: return status
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Anggota</h1>
        <p className="mt-2 text-gray-600">Selamat datang, {memberData?.name || 'Anggota'}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Status Keanggotaan</dt>
                  <dd className="text-lg font-medium text-gray-900 capitalize">{memberData?.status || 'Aktif'}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CurrencyDollarIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Sisa Pinjaman</dt>
                  <dd className="text-lg font-medium text-gray-900">{formatCurrency(loanBalance)}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BanknotesIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Pinjaman Aktif</dt>
                  <dd className="text-lg font-medium text-gray-900">{loans.filter(l => ['disbursed'].includes(l.status)).length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg mb-8">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Aksi Cepat</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <button className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500 rounded-lg border border-gray-300 hover:border-gray-400">
              <div>
                <span className="rounded-lg inline-flex p-3 bg-indigo-50 text-indigo-700 ring-4 ring-white">
                  <PlusIcon className="h-6 w-6" />
                </span>
              </div>
              <div className="mt-8">
                <h3 className="text-lg font-medium">
                  <span className="absolute inset-0" aria-hidden="true" />
                  Pengajuan Pinjaman
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Ajukan pinjaman baru dengan simulasi cicilan
                </p>
              </div>
            </button>

            <button className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500 rounded-lg border border-gray-300 hover:border-gray-400">
              <div>
                <span className="rounded-lg inline-flex p-3 bg-green-50 text-green-700 ring-4 ring-white">
                  <BanknotesIcon className="h-6 w-6" />
                </span>
              </div>
              <div className="mt-8">
                <h3 className="text-lg font-medium">
                  <span className="absolute inset-0" aria-hidden="true" />
                  Simpanan
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Kelola simpanan dan riwayat transaksi
                </p>
              </div>
            </button>

            <button className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500 rounded-lg border border-gray-300 hover:border-gray-400">
              <div>
                <span className="rounded-lg inline-flex p-3 bg-purple-50 text-purple-700 ring-4 ring-white">
                  <UserIcon className="h-6 w-6" />
                </span>
              </div>
              <div className="mt-8">
                <h3 className="text-lg font-medium">
                  <span className="absolute inset-0" aria-hidden="true" />
                  Data Pribadi
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Lihat dan update informasi pribadi
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Recent Loans */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Riwayat Pinjaman</h3>
          {loans.length === 0 ? (
            <div className="text-center py-6">
              <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Belum ada pinjaman</h3>
              <p className="mt-1 text-sm text-gray-500">Mulai dengan mengajukan pinjaman pertama Anda.</p>
            </div>
          ) : (
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tanggal Pengajuan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Jumlah
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cicilan/Bulan
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loans.map((loan) => (
                    <tr key={loan.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(loan.application_date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(loan.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(loan.status)}`}>
                          {getStatusText(loan.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(loan.monthly_payment)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}