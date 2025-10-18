'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'
import { useRouter } from 'next/navigation'

interface LoanCalculation {
  principal: number
  interestRate: number
  termMonths: number
  monthlyPayment: number
  totalInterest: number
  totalAmount: number
}

export default function LoanApplicationForm() {
  const { user } = useAuth()
  const router = useRouter()
  const [formData, setFormData] = useState({
    amount: '',
    termMonths: '12',
    purpose: '',
    interestRate: '12' // Default 12% per year
  })
  const [calculation, setCalculation] = useState<LoanCalculation | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const calculateLoan = () => {
    const principal = parseFloat(formData.amount)
    const interestRate = parseFloat(formData.interestRate) / 100 / 12 // Monthly rate
    const termMonths = parseInt(formData.termMonths)

    if (principal <= 0 || termMonths <= 0) return

    const monthlyPayment = (principal * interestRate * Math.pow(1 + interestRate, termMonths)) / 
                          (Math.pow(1 + interestRate, termMonths) - 1)
    const totalAmount = monthlyPayment * termMonths
    const totalInterest = totalAmount - principal

    setCalculation({
      principal,
      interestRate: parseFloat(formData.interestRate),
      termMonths,
      monthlyPayment,
      totalInterest,
      totalAmount
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!calculation) return

    setLoading(true)
    setError('')

    try {
      // Get member data
      const { data: memberData, error: memberError } = await supabase
        .from('members')
        .select('id')
        .eq('user_id', user?.id)
        .single()

      if (memberError) throw memberError

      // Create loan application
      const { error: loanError } = await supabase
        .from('loans')
        .insert({
          member_id: memberData.id,
          amount: calculation.principal,
          interest_rate: calculation.interestRate,
          term_months: calculation.termMonths,
          monthly_payment: calculation.monthlyPayment,
          purpose: formData.purpose,
          status: 'pending'
        })

      if (loanError) throw loanError

      router.push('/dashboard')
    } catch (error) {
      console.error('Error creating loan application:', error)
      setError('Gagal mengajukan pinjaman. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Pengajuan Pinjaman</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                Jumlah Pinjaman (Rp)
              </label>
              <input
                type="number"
                id="amount"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Masukkan jumlah pinjaman"
                required
              />
            </div>

            <div>
              <label htmlFor="termMonths" className="block text-sm font-medium text-gray-700">
                Jangka Waktu (Bulan)
              </label>
              <select
                id="termMonths"
                value={formData.termMonths}
                onChange={(e) => setFormData({ ...formData, termMonths: e.target.value })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              >
                <option value="6">6 Bulan</option>
                <option value="12">12 Bulan</option>
                <option value="18">18 Bulan</option>
                <option value="24">24 Bulan</option>
                <option value="36">36 Bulan</option>
              </select>
            </div>

            <div>
              <label htmlFor="purpose" className="block text-sm font-medium text-gray-700">
                Tujuan Pinjaman
              </label>
              <textarea
                id="purpose"
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                rows={3}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Jelaskan tujuan penggunaan pinjaman"
                required
              />
            </div>

            <div>
              <label htmlFor="interestRate" className="block text-sm font-medium text-gray-700">
                Suku Bunga (% per tahun)
              </label>
              <input
                type="number"
                id="interestRate"
                value={formData.interestRate}
                onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
                step="0.1"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              />
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={calculateLoan}
                className="mr-3 inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Hitung Simulasi
              </button>
            </div>

            {calculation && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Simulasi Pinjaman</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Jumlah Pinjaman</p>
                    <p className="text-lg font-semibold text-gray-900">{formatCurrency(calculation.principal)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Suku Bunga</p>
                    <p className="text-lg font-semibold text-gray-900">{calculation.interestRate}% per tahun</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Jangka Waktu</p>
                    <p className="text-lg font-semibold text-gray-900">{calculation.termMonths} bulan</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Cicilan per Bulan</p>
                    <p className="text-lg font-semibold text-indigo-600">{formatCurrency(calculation.monthlyPayment)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Bunga</p>
                    <p className="text-lg font-semibold text-gray-900">{formatCurrency(calculation.totalInterest)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Pembayaran</p>
                    <p className="text-lg font-semibold text-gray-900">{formatCurrency(calculation.totalAmount)}</p>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="text-red-600 text-sm">{error}</div>
            )}

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => router.back()}
                className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={!calculation || loading}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {loading ? 'Mengajukan...' : 'Ajukan Pinjaman'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}