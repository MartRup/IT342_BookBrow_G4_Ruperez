-- Add status column to borrow_records table
ALTER TABLE borrow_records 
ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'PENDING';

-- Update existing records to APPROVED status (they were already borrowed)
UPDATE borrow_records 
SET status = CASE 
    WHEN return_date IS NOT NULL THEN 'RETURNED'
    ELSE 'APPROVED'
END;

-- Add index for better query performance
CREATE INDEX idx_borrow_records_status ON borrow_records(status);
