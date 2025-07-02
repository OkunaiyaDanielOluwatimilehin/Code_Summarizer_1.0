import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabase = createClient(
  'https://dkixivngylkrisvcocvm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRraXhpdm5neWxrcmlzdmNvY3ZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc0OTkyMDMsImV4cCI6MjA2MzA3NTIwM30.t1QExOgESWvMXnHRKgm2BZghcpX7Bxrl79065_8WZBc'
);

document.addEventListener('DOMContentLoaded', async () => {
  const dropdownUsername = document.getElementById('dropdown-username');

  if (!dropdownUsername) return; // Don’t run if there's no target

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    dropdownUsername.textContent = "Guest";
    return;
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', user.id)
    .single();

  if (profileError || !profile?.username) {
    dropdownUsername.textContent = "Guest";
  } else {
    dropdownUsername.textContent = profile.username;
  }
});
