interface AccurateEmployee {
  id: string
  name: string
  employee_id: string
  position: string
  department: string
  email: string
  phone: string
  address: string
  join_date: string
  status: 'active' | 'inactive'
}

interface AccurateJournalVoucher {
  id: string
  date: string
  description: string
  reference: string
  total_amount: number
  details: Array<{
    account_id: string
    account_name: string
    debit: number
    credit: number
    description: string
  }>
}

interface AccurateApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

class AccurateApiClient {
  private baseUrl: string
  private apiKey: string
  private databaseId: string

  constructor() {
    this.baseUrl = process.env.ACCURATE_API_URL!
    this.apiKey = process.env.ACCURATE_API_KEY!
    this.databaseId = process.env.ACCURATE_DATABASE_ID!
  }

  private async makeRequest<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    body?: any
  ): Promise<AccurateApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method,
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'X-Database-ID': this.databaseId,
        },
        body: body ? JSON.stringify(body) : undefined,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Accurate API Error:', error)
      return {
        success: false,
        data: null as any,
        message: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // Get all employees
  async getEmployees(): Promise<AccurateApiResponse<AccurateEmployee[]>> {
    return this.makeRequest<AccurateEmployee[]>('/employees')
  }

  // Get employee by ID
  async getEmployee(id: string): Promise<AccurateApiResponse<AccurateEmployee>> {
    return this.makeRequest<AccurateEmployee>(`/employees/${id}`)
  }

  // Get employee loan balance (Piutang Karyawan - 110303)
  async getEmployeeLoanBalance(employeeId: string): Promise<AccurateApiResponse<number>> {
    return this.makeRequest<number>(`/accounts/110303/balance?employee_id=${employeeId}`)
  }

  // Create journal voucher for loan
  async createLoanJournalVoucher(
    employeeId: string,
    amount: number,
    description: string
  ): Promise<AccurateApiResponse<AccurateJournalVoucher>> {
    const journalData = {
      date: new Date().toISOString().split('T')[0],
      description: `Pinjaman Karyawan - ${description}`,
      reference: `LOAN-${employeeId}-${Date.now()}`,
      details: [
        {
          account_id: '110303', // Piutang Karyawan
          account_name: 'Piutang Karyawan',
          debit: amount,
          credit: 0,
          description: `Pinjaman untuk ${employeeId}`
        },
        {
          account_id: '111001', // Kas
          account_name: 'Kas',
          debit: 0,
          credit: amount,
          description: `Pembayaran pinjaman untuk ${employeeId}`
        }
      ]
    }

    return this.makeRequest<AccurateJournalVoucher>('/journal-vouchers', 'POST', journalData)
  }

  // Update employee loan balance
  async updateEmployeeLoanBalance(
    employeeId: string,
    amount: number,
    type: 'add' | 'subtract'
  ): Promise<AccurateApiResponse<boolean>> {
    return this.makeRequest<boolean>(
      `/accounts/110303/update-balance`,
      'PUT',
      {
        employee_id: employeeId,
        amount: type === 'add' ? amount : -amount
      }
    )
  }
}

export const accurateApi = new AccurateApiClient()
export type { AccurateEmployee, AccurateJournalVoucher }