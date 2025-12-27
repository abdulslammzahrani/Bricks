-- Add missing columns to form_configs table if they don't exist
DO $$ 
BEGIN
    -- Add submission_endpoint column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'form_configs' AND column_name = 'submission_endpoint') THEN
        ALTER TABLE form_configs ADD COLUMN submission_endpoint TEXT;
    END IF;
    
    -- Add submission_handler column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'form_configs' AND column_name = 'submission_handler') THEN
        ALTER TABLE form_configs ADD COLUMN submission_handler TEXT;
    END IF;
    
    -- Add embedding_config column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'form_configs' AND column_name = 'embedding_config') THEN
        ALTER TABLE form_configs ADD COLUMN embedding_config JSONB DEFAULT '{}'::jsonb;
    END IF;
END $$;
