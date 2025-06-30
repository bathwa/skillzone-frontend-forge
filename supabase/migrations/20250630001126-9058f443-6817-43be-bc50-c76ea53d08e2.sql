
-- Create testimonials table for real user reviews
CREATE TABLE public.testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on testimonials
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- Create policies for testimonials
CREATE POLICY "Users can create their own testimonials" 
  ON public.testimonials 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view approved testimonials" 
  ON public.testimonials 
  FOR SELECT 
  USING (is_approved = true);

CREATE POLICY "Users can update their own testimonials" 
  ON public.testimonials 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create function to update testimonial timestamps
CREATE OR REPLACE FUNCTION update_testimonial_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for testimonials
CREATE TRIGGER update_testimonials_updated_at
  BEFORE UPDATE ON public.testimonials
  FOR EACH ROW
  EXECUTE FUNCTION update_testimonial_updated_at();

-- Ensure RLS policies exist for core tables
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can view active opportunities" ON public.opportunities;
DROP POLICY IF EXISTS "Clients can manage their opportunities" ON public.opportunities;
DROP POLICY IF EXISTS "Freelancers can create proposals" ON public.proposals;
DROP POLICY IF EXISTS "Users can view relevant proposals" ON public.proposals;

-- Profiles policies
CREATE POLICY "Users can view all profiles" 
  ON public.profiles 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

-- Opportunities policies
CREATE POLICY "Anyone can view active opportunities" 
  ON public.opportunities 
  FOR SELECT 
  USING (status = 'open');

CREATE POLICY "Clients can manage their opportunities" 
  ON public.opportunities 
  FOR ALL 
  USING (auth.uid() = client_id);

-- Proposals policies
CREATE POLICY "Freelancers can create proposals" 
  ON public.proposals 
  FOR INSERT 
  WITH CHECK (auth.uid() = freelancer_id);

CREATE POLICY "Users can view relevant proposals" 
  ON public.proposals 
  FOR SELECT 
  USING (
    auth.uid() = freelancer_id OR 
    auth.uid() IN (
      SELECT client_id FROM opportunities WHERE id = opportunity_id
    )
  );
