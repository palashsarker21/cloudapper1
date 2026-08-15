-- Policy for payment_events
CREATE POLICY "Service role can manage payment events" ON public.payment_events FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Users can view their own payment events" ON public.payment_events FOR SELECT TO authenticated USING ((SELECT user_id FROM public.payments WHERE id = payment_id) = auth.uid());

-- Policy for crypto_wallets (already has one, but let's be explicit for all actions for service role)
CREATE POLICY "Admins can manage crypto wallets" ON public.crypto_wallets FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Policy for payment_audit_log (already has one for select, add for service role)
CREATE POLICY "Service role can manage audit logs" ON public.payment_audit_log FOR ALL TO service_role USING (true) WITH CHECK (true);
