-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create custom types
CREATE TYPE user_role AS ENUM ('member', 'staff', 'manager', 'bendahara', 'ketua');
CREATE TYPE loan_status AS ENUM ('pending', 'approved_staff', 'approved_manager', 'approved_bendahara', 'approved_ketua', 'rejected', 'disbursed', 'completed');
CREATE TYPE transaction_type AS ENUM ('loan_disbursement', 'loan_payment', 'savings_deposit', 'savings_withdrawal');

-- Create users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  role user_role NOT NULL DEFAULT 'member',
  employee_id TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create members table (synced with Accurate.id)
CREATE TABLE public.members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  accurate_id TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES public.users(id),
  name TEXT NOT NULL,
  employee_id TEXT UNIQUE NOT NULL,
  position TEXT,
  department TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  join_date DATE,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create loans table
CREATE TABLE public.loans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES public.members(id) NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  interest_rate DECIMAL(5,2) DEFAULT 0,
  term_months INTEGER NOT NULL,
  monthly_payment DECIMAL(15,2) NOT NULL,
  status loan_status DEFAULT 'pending',
  purpose TEXT,
  application_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approved_at TIMESTAMP WITH TIME ZONE,
  disbursed_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create loan_approvals table for multilevel approval
CREATE TABLE public.loan_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id UUID REFERENCES public.loans(id) NOT NULL,
  approver_id UUID REFERENCES public.users(id) NOT NULL,
  level INTEGER NOT NULL, -- 1: staff, 2: manager, 3: bendahara, 4: ketua
  status TEXT NOT NULL, -- 'pending', 'approved', 'rejected'
  comments TEXT,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create transactions table
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES public.members(id) NOT NULL,
  loan_id UUID REFERENCES public.loans(id),
  type transaction_type NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  description TEXT,
  accurate_journal_id TEXT, -- Reference to Accurate.id journal voucher
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create savings table (for future implementation)
CREATE TABLE public.savings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES public.members(id) NOT NULL,
  balance DECIMAL(15,2) DEFAULT 0,
  last_transaction_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_members_accurate_id ON public.members(accurate_id);
CREATE INDEX idx_members_employee_id ON public.members(employee_id);
CREATE INDEX idx_loans_member_id ON public.loans(member_id);
CREATE INDEX idx_loans_status ON public.loans(status);
CREATE INDEX idx_loan_approvals_loan_id ON public.loan_approvals(loan_id);
CREATE INDEX idx_transactions_member_id ON public.transactions(member_id);
CREATE INDEX idx_transactions_loan_id ON public.transactions(loan_id);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loan_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can view their own data
CREATE POLICY "Users can view own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- Members can view their own data
CREATE POLICY "Members can view own data" ON public.members
  FOR SELECT USING (auth.uid() = user_id);

-- Management can view all members
CREATE POLICY "Management can view all members" ON public.members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role IN ('staff', 'manager', 'bendahara', 'ketua')
    )
  );

-- Members can view their own loans
CREATE POLICY "Members can view own loans" ON public.loans
  FOR SELECT USING (
    member_id IN (
      SELECT id FROM public.members WHERE user_id = auth.uid()
    )
  );

-- Management can view all loans
CREATE POLICY "Management can view all loans" ON public.loans
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role IN ('staff', 'manager', 'bendahara', 'ketua')
    )
  );

-- Members can create loan applications
CREATE POLICY "Members can create loans" ON public.loans
  FOR INSERT WITH CHECK (
    member_id IN (
      SELECT id FROM public.members WHERE user_id = auth.uid()
    )
  );

-- Management can update loans
CREATE POLICY "Management can update loans" ON public.loans
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role IN ('staff', 'manager', 'bendahara', 'ketua')
    )
  );

-- Similar policies for other tables...
CREATE POLICY "Members can view own transactions" ON public.transactions
  FOR SELECT USING (
    member_id IN (
      SELECT id FROM public.members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Management can view all transactions" ON public.transactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role IN ('staff', 'manager', 'bendahara', 'ketua')
    )
  );

-- Create functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_members_updated_at BEFORE UPDATE ON public.members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_loans_updated_at BEFORE UPDATE ON public.loans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_savings_updated_at BEFORE UPDATE ON public.savings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();