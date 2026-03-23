
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dturigybcuxhgpgvfpzw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0dXJpZ3liY3V4aGdwZ3ZmcHp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0MzA1OTgsImV4cCI6MjA4MTAwNjU5OH0.E-JaJ_CCvHQeI1WO-OPyDYIF7D--B-146Esh2wFbC-U';

export const supabase = createClient(supabaseUrl, supabaseKey);
