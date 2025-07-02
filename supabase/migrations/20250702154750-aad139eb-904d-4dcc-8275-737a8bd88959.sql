
-- Drop existing tables if they exist (in correct order to handle dependencies)
DROP TABLE IF EXISTS public.dispute_evidence CASCADE;
DROP TABLE IF EXISTS public.disputes CASCADE;
DROP TABLE IF EXISTS public.feedback CASCADE;
DROP TABLE IF EXISTS public.daily_analytics CASCADE;
DROP TABLE IF EXISTS public.site_settings CASCADE;
DROP TABLE IF EXISTS public.subscriptions CASCADE;

-- Drop existing types if they exist
DROP TYPE IF EXISTS public.feedback_type CASCADE;
DROP TYPE IF EXISTS public.feedback_status CASCADE;
DROP TYPE IF EXISTS public.feedback_priority CASCADE;
DROP TYPE IF EXISTS public.dispute_type CASCADE;
DROP TYPE IF EXISTS public.dispute_status CASCADE;
DROP TYPE IF EXISTS public.subscription_tier CASCADE;
DROP TYPE IF EXISTS public.subscription_status CASCADE;

-- Create enums for feedback system
CREATE TYPE public.feedback_type AS ENUM ('bug', 'feature_request', 'general', 'complaint', 'compliment');
CREATE TYPE public.feedback_status AS ENUM ('pending', 'in_progress', 'resolved', 'closed');
CREATE TYPE public.feedback_priority AS ENUM ('low', 'medium', 'high', 'urgent');

-- Create enums for dispute system
CREATE TYPE public.dispute_type AS ENUM ('payment', 'quality', 'communication', 'timeline', 'other');
CREATE TYPE public.dispute_status AS ENUM ('open', 'under_review', 'resolved', 'closed');

-- Create enums for subscription system
CREATE TYPE public.subscription_tier AS ENUM ('basic', 'pro', 'premium');
CREATE TYPE public.subscription_status AS ENUM ('active', 'cancelled', 'expired', 'suspended');

-- Create feedback table
CREATE TABLE public.feedback (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    feedback_type public.feedback_type NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    context_data JSONB,
    screenshot_url TEXT,
    status public.feedback_status NOT NULL DEFAULT 'pending',
    priority public.feedback_priority NOT NULL DEFAULT 'medium',
    admin_response TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create disputes table
CREATE TABLE public.disputes (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    opportunity_id UUID REFERENCES public.opportunities(id) ON DELETE CASCADE NOT NULL,
    client_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    service_provider_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    dispute_type public.dispute_type NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    amount_disputed NUMERIC(10,2),
    status public.dispute_status NOT NULL DEFAULT 'open',
    resolution TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- Create dispute evidence table
CREATE TABLE public.dispute_evidence (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    dispute_id UUID REFERENCES public.disputes(id) ON DELETE CASCADE NOT NULL,
    submitted_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    evidence_type TEXT NOT NULL, -- 'text', 'image', 'document'
    evidence_data TEXT NOT NULL, -- text content or file URL
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create subscriptions table
CREATE TABLE public.subscriptions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    tier public.subscription_tier NOT NULL DEFAULT 'basic',
    status public.subscription_status NOT NULL DEFAULT 'active',
    started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    expires_at TIMESTAMP WITH TIME ZONE,
    auto_renew BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id)
);

-- Create site settings table
CREATE TABLE public.site_settings (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    key TEXT NOT NULL UNIQUE,
    value JSONB NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create daily analytics table
CREATE TABLE public.daily_analytics (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    date DATE NOT NULL UNIQUE,
    new_users INTEGER NOT NULL DEFAULT 0,
    active_users INTEGER NOT NULL DEFAULT 0,
    new_opportunities INTEGER NOT NULL DEFAULT 0,
    completed_projects INTEGER NOT NULL DEFAULT 0,
    revenue_usd NUMERIC(10,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dispute_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_analytics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for feedback
CREATE POLICY "Users can create their own feedback" ON public.feedback
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own feedback" ON public.feedback
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own feedback" ON public.feedback
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all feedback" ON public.feedback
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Create RLS policies for disputes
CREATE POLICY "Dispute participants can view disputes" ON public.disputes
    FOR SELECT USING (
        auth.uid() = client_id OR 
        auth.uid() = service_provider_id OR
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Dispute participants can create disputes" ON public.disputes
    FOR INSERT WITH CHECK (
        auth.uid() = client_id OR auth.uid() = service_provider_id
    );

CREATE POLICY "Admins can update disputes" ON public.disputes
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Create RLS policies for dispute evidence
CREATE POLICY "Dispute participants can view evidence" ON public.dispute_evidence
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.disputes 
            WHERE id = dispute_id AND (
                client_id = auth.uid() OR 
                service_provider_id = auth.uid()
            )
        ) OR
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Dispute participants can submit evidence" ON public.dispute_evidence
    FOR INSERT WITH CHECK (
        auth.uid() = submitted_by AND
        EXISTS (
            SELECT 1 FROM public.disputes 
            WHERE id = dispute_id AND (
                client_id = auth.uid() OR 
                service_provider_id = auth.uid()
            )
        )
    );

-- Create RLS policies for subscriptions
CREATE POLICY "Users can view their own subscription" ON public.subscriptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own subscription" ON public.subscriptions
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all subscriptions" ON public.subscriptions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Create RLS policies for site settings
CREATE POLICY "Admins can manage site settings" ON public.site_settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Create RLS policies for daily analytics
CREATE POLICY "Admins can view analytics" ON public.daily_analytics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "System can insert analytics" ON public.daily_analytics
    FOR INSERT WITH CHECK (true);

-- Insert default site settings
INSERT INTO public.site_settings (key, value, description) VALUES
('token_rates', '{"standard": 1, "premium": 3}', 'Token costs for opportunity access'),
('bonus_tokens', '{"signup": 5, "referral": 10}', 'Bonus tokens for various actions'),
('admin_emails', '["abathwabiz@gmail.com", "admin@abathwa.com"]', 'Super admin email addresses'),
('escrow_details', '{"mobile_wallets": {"number": "0788420479", "name": "Vusa Ncube"}, "innbucks": {"account_name": "Abathwa Incubator PBC", "account_number": "013113351190001"}}', 'Escrow payment details for Zimbabwe'),
('subscription_details', '{"basic": {"price": 0, "features": ["Basic features"]}, "pro": {"price": 29, "features": ["All basic features", "Priority support"]}, "premium": {"price": 99, "features": ["All pro features", "Premium opportunities", "Advanced analytics"]}}', 'Subscription tier details'),
('premium_categories', '["Software Development", "Digital Marketing", "Consulting"]', 'Categories eligible for premium opportunities'),
('support_contacts', '{"phone": "+263 78 998 9619", "email": "admin@abathwa.com", "whatsapp": "wa.me/789989619"}', 'Support contact information'),
('admin_key', '"vvv.ndev"', 'Super admin verification key');

-- Create function to automatically create subscription for new users
CREATE OR REPLACE FUNCTION public.create_user_subscription()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.subscriptions (user_id, tier, status)
    VALUES (NEW.id, 'basic', 'active');
    RETURN NEW;
END;
$$;

-- Create trigger to auto-create subscription
CREATE TRIGGER on_profile_created_subscription
    AFTER INSERT ON public.profiles
    FOR EACH ROW EXECUTE PROCEDURE public.create_user_subscription();

-- Create function to update feedback updated_at
CREATE OR REPLACE FUNCTION public.update_feedback_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- Create trigger for feedback updated_at
CREATE TRIGGER update_feedback_updated_at
    BEFORE UPDATE ON public.feedback
    FOR EACH ROW EXECUTE PROCEDURE public.update_feedback_updated_at();

-- Create function to update disputes updated_at
CREATE OR REPLACE FUNCTION public.update_disputes_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- Create trigger for disputes updated_at
CREATE TRIGGER update_disputes_updated_at
    BEFORE UPDATE ON public.disputes
    FOR EACH ROW EXECUTE PROCEDURE public.update_disputes_updated_at();

-- Create function to update subscriptions updated_at
CREATE OR REPLACE FUNCTION public.update_subscriptions_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- Create trigger for subscriptions updated_at
CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW EXECUTE PROCEDURE public.update_subscriptions_updated_at();
