-- Migration: Add whatsappPhone and imageUrl fields to Event model
-- Date: 2025-09-20

-- Add whatsappPhone field
ALTER TABLE Event ADD COLUMN whatsappPhone TEXT;

-- Add imageUrl field  
ALTER TABLE Event ADD COLUMN imageUrl TEXT;