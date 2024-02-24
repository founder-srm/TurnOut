import { createClient } from "@supabase/supabase-js";

const supabaseUrl = 'https://eedplvopkhwuhhquagfw.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVlZHBsdm9wa2h3dWhocXVhZ2Z3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDcyNDM1ODUsImV4cCI6MjAyMjgxOTU4NX0.uXlL7xAorEiCd_kmbZ0v3hgB0FR5vskjCHLveoATQ6g'

export const supabase = createClient(supabaseUrl, supabaseAnonKey);