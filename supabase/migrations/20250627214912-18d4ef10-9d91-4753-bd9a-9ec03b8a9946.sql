-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types/enums first
CREATE TYPE public.user_role AS ENUM ('freelancer', 'client', 'admin');
CREATE TYPE public.opportunity_type AS ENUM ('standard', 'premium');
CREATE TYPE public.opportunity_status AS ENUM ('open', 'in_progress', 'completed', 'cancelled');
CREATE TYPE public.proposal_status AS ENUM ('pending', 'accepted', 'rejected', 'withdrawn');
CREATE TYPE public.project_status AS ENUM ('active', 'completed', 'cancelled', 'disputed');
CREATE TYPE public.payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
CREATE TYPE public.skill_level AS ENUM ('beginner', 'intermediate', 'advanced', 'expert');
CREATE TYPE public.country_code AS ENUM ('south_africa', 'botswana', 'zimbabwe', 'namibia', 'zambia', 'lesotho', 'eswatini', 'malawi', 'mozambique', 'tanzania', 'angola', 'madagascar', 'mauritius', 'seychelles', 'comoros');
CREATE TYPE public.account_type AS ENUM ('mobile_wallet', 'bank_account', 'digital_wallet');

-- Create profiles table (linked to auth.users)
CREATE TABLE public.profiles (
    id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    country country_code,
    city TEXT,
    phone TEXT,
    website TEXT,
    role user_role NOT NULL DEFAULT 'freelancer',
    hourly_rate DECIMAL(10,2),
    total_earnings DECIMAL(12,2) DEFAULT 0,
    total_jobs_completed INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0,
    rating_count INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    tokens INTEGER DEFAULT 5,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    PRIMARY KEY (id)
);

-- Create escrow_accounts table
CREATE TABLE public.escrow_accounts (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    country country_code NOT NULL,
    account_name TEXT NOT NULL,
    account_number TEXT NOT NULL,
    account_type account_type NOT NULL,
    provider TEXT,
    phone_number TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    PRIMARY KEY (id)
);

-- Create support_contacts table
CREATE TABLE public.support_contacts (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    country country_code NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    whatsapp TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    PRIMARY KEY (id)
);

-- Create skills table
CREATE TABLE public.skills (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    PRIMARY KEY (id)
);

-- Create user_skills junction table
CREATE TABLE public.user_skills (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
    level skill_level NOT NULL DEFAULT 'intermediate',
    years_experience INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, skill_id),
    PRIMARY KEY (id)
);

-- Create opportunities table
CREATE TABLE public.opportunities (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    budget_min DECIMAL(10,2),
    budget_max DECIMAL(10,2),
    type opportunity_type NOT NULL DEFAULT 'standard',
    status opportunity_status NOT NULL DEFAULT 'open',
    client_country country_code NOT NULL,
    deadline TIMESTAMP WITH TIME ZONE,
    required_skills TEXT[] DEFAULT '{}',
    proposals_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    PRIMARY KEY (id)
);

-- Create proposals table
CREATE TABLE public.proposals (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    opportunity_id UUID NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
    freelancer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    cover_letter TEXT NOT NULL,
    proposed_budget DECIMAL(10,2) NOT NULL,
    estimated_duration INTEGER, -- in days
    status proposal_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(opportunity_id, freelancer_id),
    PRIMARY KEY (id)
);

-- Create projects table (when proposal is accepted)
CREATE TABLE public.projects (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    opportunity_id UUID NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
    proposal_id UUID NOT NULL REFERENCES public.proposals(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    freelancer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    budget DECIMAL(10,2) NOT NULL,
    status project_status NOT NULL DEFAULT 'active',
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deadline TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    PRIMARY KEY (id)
);

-- Create payments table
CREATE TABLE public.payments (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    freelancer_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    platform_fee DECIMAL(10,2) NOT NULL,
    freelancer_amount DECIMAL(10,2) NOT NULL,
    status payment_status NOT NULL DEFAULT 'pending',
    stripe_payment_intent_id TEXT,
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    PRIMARY KEY (id)
);

-- Create reviews table
CREATE TABLE public.reviews (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    reviewee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(project_id, reviewer_id),
    PRIMARY KEY (id)
);

-- Create messages table
CREATE TABLE public.messages (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    PRIMARY KEY (id)
);

-- Create notifications table
CREATE TABLE public.notifications (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    related_id UUID, -- can reference any table
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    PRIMARY KEY (id)
);

-- Create portfolios table
CREATE TABLE public.portfolios (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    project_url TEXT,
    technologies TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    PRIMARY KEY (id)
);

-- Create token_transactions table
CREATE TABLE public.token_transactions (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL, -- positive for credits, negative for debits
    transaction_type TEXT NOT NULL,
    description TEXT,
    related_id UUID, -- can reference opportunities, proposals, etc.
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    PRIMARY KEY (id)
);

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES 
('avatars', 'avatars', true),
('portfolios', 'portfolios', true),
('documents', 'documents', false);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escrow_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.token_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view other profiles" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage all profiles" ON public.profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- RLS Policies for escrow_accounts (admin only)
CREATE POLICY "Admins can manage escrow accounts" ON public.escrow_accounts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- RLS Policies for support_contacts (admin only)
CREATE POLICY "Admins can manage support contacts" ON public.support_contacts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- RLS Policies for skills
CREATE POLICY "Anyone can view skills" ON public.skills
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage skills" ON public.skills
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- RLS Policies for user_skills
CREATE POLICY "Users can view their own skills" ON public.user_skills
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own skills" ON public.user_skills
    FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for opportunities
CREATE POLICY "Anyone can view opportunities" ON public.opportunities
    FOR SELECT USING (true);

CREATE POLICY "Users can create opportunities" ON public.opportunities
    FOR INSERT WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Users can update their own opportunities" ON public.opportunities
    FOR UPDATE USING (auth.uid() = client_id);

CREATE POLICY "Users can delete their own opportunities" ON public.opportunities
    FOR DELETE USING (auth.uid() = client_id);

-- RLS Policies for proposals
CREATE POLICY "Users can view proposals for their opportunities" ON public.proposals
    FOR SELECT USING (
        auth.uid() IN (
            SELECT client_id FROM public.opportunities WHERE id = opportunity_id
        )
    );

CREATE POLICY "Users can view their own proposals" ON public.proposals
    FOR SELECT USING (auth.uid() = freelancer_id);

CREATE POLICY "Users can create proposals" ON public.proposals
    FOR INSERT WITH CHECK (auth.uid() = freelancer_id);

CREATE POLICY "Users can update their own proposals" ON public.proposals
    FOR UPDATE USING (auth.uid() = freelancer_id);

-- RLS Policies for projects
CREATE POLICY "Users can view their projects" ON public.projects
    FOR SELECT USING (auth.uid() IN (client_id, freelancer_id));

CREATE POLICY "Users can update their projects" ON public.projects
    FOR UPDATE USING (auth.uid() IN (client_id, freelancer_id));

-- RLS Policies for payments
CREATE POLICY "Users can view their payments" ON public.payments
    FOR SELECT USING (auth.uid() IN (client_id, freelancer_id));

-- RLS Policies for reviews
CREATE POLICY "Users can view reviews" ON public.reviews
    FOR SELECT USING (true);

CREATE POLICY "Users can create reviews for their projects" ON public.reviews
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT client_id, freelancer_id FROM public.projects WHERE id = project_id
        )
    );

-- RLS Policies for messages
CREATE POLICY "Users can view messages for their projects" ON public.messages
    FOR SELECT USING (
        auth.uid() IN (
            SELECT client_id, freelancer_id FROM public.projects WHERE id = project_id
        )
    );

CREATE POLICY "Users can send messages" ON public.messages
    FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- RLS Policies for notifications
CREATE POLICY "Users can view their notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their notifications" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for portfolios
CREATE POLICY "Anyone can view portfolios" ON public.portfolios
    FOR SELECT USING (true);

CREATE POLICY "Users can manage their own portfolios" ON public.portfolios
    FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for token_transactions
CREATE POLICY "Users can view their token transactions" ON public.token_transactions
    FOR SELECT USING (auth.uid() = user_id);

-- Functions and triggers
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, first_name, last_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'first_name',
        NEW.raw_user_meta_data->>'last_name',
        COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'freelancer')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.update_user_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.profiles
    SET 
        rating = (
            SELECT AVG(rating)::DECIMAL(3,2)
            FROM public.reviews
            WHERE reviewee_id = NEW.reviewee_id
        ),
        rating_count = (
            SELECT COUNT(*)
            FROM public.reviews
            WHERE reviewee_id = NEW.reviewee_id
        )
    WHERE id = NEW.reviewee_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_review_created
    AFTER INSERT ON public.reviews
    FOR EACH ROW EXECUTE FUNCTION public.update_user_rating();

CREATE OR REPLACE FUNCTION public.update_proposal_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.opportunities
        SET proposals_count = proposals_count + 1
        WHERE id = NEW.opportunity_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.opportunities
        SET proposals_count = proposals_count - 1
        WHERE id = OLD.opportunity_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_proposal_created
    AFTER INSERT ON public.proposals
    FOR EACH ROW EXECUTE FUNCTION public.update_proposal_count();

CREATE TRIGGER on_proposal_deleted
    AFTER DELETE ON public.proposals
    FOR EACH ROW EXECUTE FUNCTION public.update_proposal_count();

-- Indexes for performance
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_country ON public.profiles(country);
CREATE INDEX idx_escrow_accounts_country ON public.escrow_accounts(country);
CREATE INDEX idx_support_contacts_country ON public.support_contacts(country);
CREATE INDEX idx_opportunities_status ON public.opportunities(status);
CREATE INDEX idx_opportunities_category ON public.opportunities(category);
CREATE INDEX idx_opportunities_client_country ON public.opportunities(client_country);
CREATE INDEX idx_opportunities_created_at ON public.opportunities(created_at DESC);
CREATE INDEX idx_proposals_opportunity_id ON public.proposals(opportunity_id);
CREATE INDEX idx_proposals_freelancer_id ON public.proposals(freelancer_id);
CREATE INDEX idx_proposals_status ON public.proposals(status);
CREATE INDEX idx_projects_status ON public.projects(status);
CREATE INDEX idx_messages_project_id ON public.messages(project_id);
CREATE INDEX idx_messages_sender_receiver ON public.messages(sender_id, receiver_id);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX idx_reviews_reviewee_id ON public.reviews(reviewee_id);
CREATE INDEX idx_portfolios_user_id ON public.portfolios(user_id);
CREATE INDEX idx_token_transactions_user_id ON public.token_transactions(user_id);

-- Insert default data
INSERT INTO public.escrow_accounts (country, account_name, account_number, account_type, provider, phone_number) VALUES
('zimbabwe', 'Vusa Ncube', '0788420479', 'mobile_wallet', 'Ecocash, Omari, Innbucks', '0788420479'),
('zimbabwe', 'Abathwa Incubator PBC', '013113351190001', 'bank_account', 'Innbucks MicroBank', NULL);

INSERT INTO public.support_contacts (country, phone, email, whatsapp) VALUES
('zimbabwe', '+263 78 998 9619', 'admin@abathwa.com', 'wa.me/789989619');

-- Insert some default skills
INSERT INTO public.skills (name, category, description) VALUES
('React', 'Frontend Development', 'JavaScript library for building user interfaces'),
('Node.js', 'Backend Development', 'JavaScript runtime for server-side development'),
('TypeScript', 'Frontend Development', 'Typed superset of JavaScript'),
('Python', 'Backend Development', 'High-level programming language'),
('UI/UX Design', 'Design', 'User interface and user experience design'),
('Digital Marketing', 'Marketing', 'Online marketing strategies and techniques'),
('Content Writing', 'Writing', 'Creating engaging written content'),
('Data Analysis', 'Data Science', 'Analyzing and interpreting data'),
('Project Management', 'Management', 'Planning and executing projects'),
('Translation', 'Language', 'Converting text from one language to another');
