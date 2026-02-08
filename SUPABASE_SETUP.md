# Supabase Database Setup for TerraRun

Follow these steps to set up your database on Supabase:

### 1. Create a New Project
1. Log in to [Supabase](https://supabase.com/).
2. Click on **"New Project"**.
3. Select your organization and enter a project name (e.g., `terrarun`).
4. Set a secure **Database Password**.
5. Choose a region close to you and click **"Create new project"**.

### 2. Enable PostGIS and Run Schema
1. Once your project is provisioned, go to the **SQL Editor** in the left sidebar.
2. Click **"New query"**.
3. Copy the entire contents of the `database/schema.sql` file from this repository.
4. Paste it into the SQL Editor.
5. Click **"Run"**.

### 3. Get Your Connection String
1. Go to **Project Settings** -> **Database**.
2. Scroll to **Connection string** -> **URI**.
3. Copy the URI and replace `[YOUR-PASSWORD]` with your actual password.

### 4. Update Backend Configuration
1. In the `backend` directory, update your `.env` file with the `DATABASE_URL`.
   ```env
   DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
   ```
