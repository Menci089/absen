import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zeburjchvisrkikefdzh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InplYnVyamNodmlzcmtpa2VmZHpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQzMjY0NzAsImV4cCI6MjA0OTkwMjQ3MH0.dExkx2iepTQ6hJrimJKQmxetOGkVjeMSPxIyneMATxo';
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase