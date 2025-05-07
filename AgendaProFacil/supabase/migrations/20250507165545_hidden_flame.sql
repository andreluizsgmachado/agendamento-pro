/*
  # Add INSERT policy for profiles table

  1. Security Changes
    - Add policy to allow authenticated users to insert their own profile
    - This fixes the 403 error when creating new profiles during registration
*/

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);