-- Migration 016: Delete old test property (cabana/test data from migration 009)
DELETE FROM properties WHERE id = 'b46c363f-7d06-4363-bd8f-1518f5a4452b';
