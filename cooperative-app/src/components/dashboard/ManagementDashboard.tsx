'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { formatCurrency, formatDate } from '@/lib/utils'
import { 
  UserGroupIcon, 
  CurrencyDollarIcon, 
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

interface MemberData {
  id: string
  name: string
  employee_id: string
  position: string
  department: string
  email: string
  status: string
  join_date: string
}

interface LoanData {
  id: string
  member_id: string
  amount: number
  status: string
  application_date: string
  monthly_payment: number
  member_name: string
}

interface StatsData {
  totalMembers: number
  pendingLoans: number
  totalLoanAmount: number
  approvedLoans: number
}

export default function ManagementDashboard() {
  const { userRole } = useAuth()
  const [members, setMembers] = useState<MemberData[]>([])
  const [loans, setLoans] = useState<LoanData[]>([])
  const [stats, setStats] = useState<StatsData>({
    totalMembers: 0,
    pendingLoans: 0,
    totalLoanAmount: 0,
    approvedLoans: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Fetch members
      const { data: membersData, error: membersError } = await supabase
        .from('members')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)

      if (membersError) throw membersError

      // Fetch loans with member names
      const { data: loansData, error: loansError } = await supabase
        .from('loans')
        .select(`
          *,
          members!inner(name)
        `)
        .order('application_date', { ascending: false })
        .limit(10)

      if (loansError) throw loansError

      // Fetch stats
      const { count: totalMembers } = await supabase
        .from('members')
        .select('*', { count: 'exact', head: true })

      const { count: pendingLoans } = await supabase
        .from('loans')
        .select('*', { count: 'exact', head: true })
        .in('status', ['pending', 'approved_staff', 'approved_manager', 'approved_bendahara'])

      const { data: loanAmounts } = await supabase
        .from('loans')
        .select('amount')
        .eq('status', 'disbursed')

      const { count: approvedLoans } = await supabase
        .from('loans')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved_ketua')

      setMembers(membersData || [])
      setLoans(loansData?.map(loan => ({
        ...loan,
        member_name: loan.members.name
      })) || [])
      
      setStats({
        totalMembers: totalMembers || 0,
        pendingLoans: pendingLoans || 0,
        totalLoanAmount: loanAmounts?.reduce((sum, loan) => sum + loan.amount, 0) || 0,
        approvedLoans: approvedLoans || 0
      })
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
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

  const canApprove = (status: string) => {
    if (userRole === 'staff' && status === 'pending') return true
    if (userRole === 'manager' && status === 'approved_staff') return true
    if (userRole === 'bendahara' && status === 'approved_manager') return true
    if (userRole === 'ketua' && status === 'approved_bendahara') return true
    return false
  }

  const handleApprove = async (loanId: string, currentStatus: string) => {
    let newStatus = ''
    switch (currentStatus) {
      case 'pending': newStatus = 'approved_staff'; break
      case 'approved_staff': newStatus = 'approved_manager'; break
      case 'approved_manager': newStatus = 'approved_bendahara'; break
      case 'approved_bendahara': newStatus = 'approved_ketua'; break
    }

    try {
      const { error } = await supabase
        .from('loans')
        .update({ 
          status: newStatus,
          approved_at: new Date().toISOString()
        })
        .eq('id', loanId)

      if (error) throw error

      // Add approval record
      await supabase
        .from('loan_approvals')
        .insert({
          loan_id: loanId,
          approver_id: user?.id,
          level: userRole === 'staff' ? 1 : userRole === 'manager' ? 2 : userRole === 'bendahara' ? 3 : 4,
          status: 'approved',
          approved_at: new Date().toISOString()
        })

      fetchData() // Refresh data
    } catch (error) {
      console.error('Error approving loan:', error)
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
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Pengurus</h1>
        <p className="mt-2 text-gray-600">Kelola data anggota dan pengajuan pinjaman</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserGroupIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Anggota</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.totalMembers}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClockIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Menunggu Persetujuan</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.pendingLoans}</dd>
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
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Pinjaman Aktif</dt>
                  <dd className="text-lg font-medium text-gray-900">{formatCurrency(stats.totalLoanAmount)}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Disetujui Hari Ini</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.approvedLoans}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Members */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Anggota Terbaru</h3>
            {members.length === 0 ? (
              <div className="text-center py-6">
                <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Belum ada anggota</h3>
              </div>
            ) : (
              <div className="space-y-4">
                {members.map((member) => (
                  <div key={member.id} className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                        <span className="text-sm font-medium text-indigo-600">
                          {member.name.charAt(0)}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{member.name}</p>
                      <p className="text-sm text-gray-500">{member.position} - {member.department}</p>
                    </div>
                    <div className="flex-shrink-0">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        member.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {member.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Loans */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Pengajuan Pinjaman Terbaru</h3>
            {loans.length === 0 ? (
              <div className="text-center py-6">
                <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Belum ada pengajuan</h3>
              </div>
            ) : (
              <div className="space-y-4">
                {loans.map((loan) => (
                  <div key={loan.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{loan.member_name}</p>
                        <p className="text-sm text-gray-500">{formatCurrency(loan.amount)}</p>
                        <p className="text-xs text-gray-400">{formatDate(loan.application_date)}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(loan.status)}`}>
                          {getStatusText(loan.status)}
                        </span>
                        {canApprove(loan.status) && (
                          <button
                            onClick={() => handleApprove(loan.id, loan.status)}
                            className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            Setujui
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}