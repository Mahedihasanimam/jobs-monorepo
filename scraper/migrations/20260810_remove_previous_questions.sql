-- Optional destructive cleanup after removing the previous-year question feature.
-- This permanently deletes previously collected question-resource rows.
DROP TABLE IF EXISTS previous_questions;
