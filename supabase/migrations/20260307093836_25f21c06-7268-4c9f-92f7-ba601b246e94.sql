-- Fix: restrict bias_analyses insert to only allow users to insert for their own opinions
DROP POLICY "System can insert analyses" ON public.bias_analyses;
CREATE POLICY "Users can insert analyses for their opinions" ON public.bias_analyses 
  FOR INSERT TO authenticated 
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.opinions WHERE opinions.id = opinion_id AND opinions.user_id = auth.uid())
  );