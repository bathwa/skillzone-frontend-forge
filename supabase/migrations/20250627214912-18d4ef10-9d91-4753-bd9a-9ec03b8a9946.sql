
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
    freelancer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
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

-- Create RLS policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Create RLS policies for skills (public read)
CREATE POLICY "Anyone can view skills" ON public.skills FOR SELECT USING (true);
CREATE POLICY "Only admins can modify skills" ON public.skills FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Create RLS policies for user_skills
CREATE POLICY "Anyone can view user skills" ON public.user_skills FOR SELECT USING (true);
CREATE POLICY "Users can manage own skills" ON public.user_skills FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for opportunities
CREATE POLICY "Anyone can view open opportunities" ON public.opportunities FOR SELECT USING (true);
CREATE POLICY "Clients can create opportunities" ON public.opportunities FOR INSERT WITH CHECK (auth.uid() = client_id);
CREATE POLICY "Clients can update own opportunities" ON public.opportunities FOR UPDATE USING (auth.uid() = client_id);
CREATE POLICY "Clients can delete own opportunities" ON public.opportunities FOR DELETE USING (auth.uid() = client_id);

-- Create RLS policies for proposals
CREATE POLICY "Users can view proposals for their opportunities or own proposals" ON public.proposals FOR SELECT USING (
    auth.uid() = freelancer_id OR 
    auth.uid() IN (SELECT client_id FROM public.opportunities WHERE id = opportunity_id)
);
CREATE POLICY "Freelancers can create proposals" ON public.proposals FOR INSERT WITH CHECK (auth.uid() = freelancer_id);
CREATE POLICY "Freelancers can update own proposals" ON public.proposals FOR UPDATE USING (auth.uid() = freelancer_id);
CREATE POLICY "Freelancers can delete own proposals" ON public.proposals FOR DELETE USING (auth.uid() = freelancer_id);

-- Create RLS policies for projects
CREATE POLICY "Project participants can view projects" ON public.projects FOR SELECT USING (
    auth.uid() = client_id OR auth.uid() = freelancer_id
);
CREATE POLICY "Clients can create projects" ON public.projects FOR INSERT WITH CHECK (auth.uid() = client_id);
CREATE POLICY "Project participants can update projects" ON public.projects FOR UPDATE USING (
    auth.uid() = client_id OR auth.uid() = freelancer_id
);

-- Create RLS policies for payments
CREATE POLICY "Payment participants can view payments" ON public.payments FOR SELECT USING (
    auth.uid() = client_id OR auth.uid() = freelancer_id
);
CREATE POLICY "Clients can create payments" ON public.payments FOR INSERT WITH CHECK (auth.uid() = client_id);
CREATE POLICY "Payment participants can update payments" ON public.payments FOR UPDATE USING (
    auth.uid() = client_id OR auth.uid() = freelancer_id
);

-- Create RLS policies for reviews
CREATE POLICY "Anyone can view reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Project participants can create reviews" ON public.reviews FOR INSERT WITH CHECK (
    auth.uid() = reviewer_id AND
    EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND (client_id = auth.uid() OR freelancer_id = auth.uid()))
);

-- Create RLS policies for messages
CREATE POLICY "Users can view own messages" ON public.messages FOR SELECT USING (
    auth.uid() = sender_id OR auth.uid() = receiver_id
);
CREATE POLICY "Users can send messages" ON public.messages FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Users can update own messages" ON public.messages FOR UPDATE USING (auth.uid() = sender_id);

-- Create RLS policies for notifications
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can create notifications" ON public.notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for portfolios
CREATE POLICY "Anyone can view portfolios" ON public.portfolios FOR SELECT USING (true);
CREATE POLICY "Users can manage own portfolio" ON public.portfolios FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for token_transactions
CREATE POLICY "Users can view own token transactions" ON public.token_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can create token transactions" ON public.token_transactions FOR INSERT WITH CHECK (true);

-- Create storage policies
CREATE POLICY "Anyone can view avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Users can upload avatars" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');
CREATE POLICY "Users can update own avatars" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete own avatars" ON storage.objects FOR DELETE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Anyone can view portfolios" ON storage.objects FOR SELECT USING (bucket_id = 'portfolios');
CREATE POLICY "Users can upload portfolio images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'portfolios' AND auth.role() = 'authenticated');
CREATE POLICY "Users can update own portfolio images" ON storage.objects FOR UPDATE USING (bucket_id = 'portfolios' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete own portfolio images" ON storage.objects FOR DELETE USING (bucket_id = 'portfolios' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view own documents" ON storage.objects FOR SELECT USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can upload documents" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'documents' AND auth.role() = 'authenticated');
CREATE POLICY "Users can update own documents" ON storage.objects FOR UPDATE USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete own documents" ON storage.objects FOR DELETE USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, first_name, last_name)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'first_name',
        NEW.raw_user_meta_data->>'last_name'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update user ratings
CREATE OR REPLACE FUNCTION public.update_user_rating()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the reviewee's rating
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to update ratings when review is added
CREATE TRIGGER on_review_created
    AFTER INSERT ON public.reviews
    FOR EACH ROW EXECUTE FUNCTION public.update_user_rating();

-- Create function to update proposal count
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for proposal count
CREATE TRIGGER on_proposal_created
    AFTER INSERT ON public.proposals
    FOR EACH ROW EXECUTE FUNCTION public.update_proposal_count();

CREATE TRIGGER on_proposal_deleted
    AFTER DELETE ON public.proposals
    FOR EACH ROW EXECUTE FUNCTION public.update_proposal_count();

-- Create indexes for better performance
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_country ON public.profiles(country);
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

-- Insert some sample skills
INSERT INTO public.skills (name, category, description) VALUES
('React', 'Frontend Development', 'Popular JavaScript library for building user interfaces'),
('Node.js', 'Backend Development', 'JavaScript runtime for server-side development'),
('Python', 'Backend Development', 'Versatile programming language'),
('UI/UX Design', 'Design', 'User interface and user experience design'),
('Mobile Development', 'Mobile', 'iOS and Android app development'),
('WordPress', 'CMS', 'Content management system development'),
('SEO', 'Marketing', 'Search engine optimization'),
('Content Writing', 'Writing', 'Creating engaging written content'),
('Graphic Design', 'Design', 'Visual design and branding'),
('Data Analysis', 'Data Science', 'Analyzing and interpreting data'),
('Digital Marketing', 'Marketing', 'Online marketing strategies'),
('Video Editing', 'Media', 'Video production and editing'),
('Translation', 'Language', 'Multi-language translation services'),
('Photography', 'Media', 'Professional photography services'),
('Project Management', 'Management', 'Planning and executing projects');
