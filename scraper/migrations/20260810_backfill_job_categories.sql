-- Backfill category values for existing source records so UI category filters work.
UPDATE jobs SET category = 'রেলওয়ে' WHERE source = 'Bangladesh Railway' AND category IS NULL;
UPDATE jobs SET category = 'স্বাস্থ্য' WHERE source = 'DGHS' AND category IS NULL;
UPDATE jobs SET category = 'শিক্ষা' WHERE source = 'SHED' AND category IS NULL;
UPDATE jobs SET category = 'জনপ্রশাসন' WHERE source = 'BPSC' AND category IS NULL;
