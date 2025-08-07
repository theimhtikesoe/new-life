-- Insert default categories
INSERT INTO categories (id, name, description, is_default) VALUES
  ('small', 'Small', 'Small sized water bottles', true),
  ('medium', 'Medium', 'Medium sized water bottles', true),
  ('large', 'Large', 'Large sized water bottles', true)
ON CONFLICT (name) DO NOTHING;

-- Insert default card types
INSERT INTO card_types (id, label, quantity, is_default) VALUES
  ('100', '100-pack', 100, true),
  ('200', '200-pack', 200, true),
  ('400', '400-pack', 400, true),
  ('500', '500-pack', 500, true)
ON CONFLICT (quantity) DO NOTHING;

-- No sample products or orders - start with empty tables as requested
