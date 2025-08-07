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

-- Insert sample products
INSERT INTO products (id, name, bottle_size, bottle_price, category, stock, variants) VALUES
  ('1', 'Purified Water', '300ml', 200, 'Small', 50, '[
    {"id": "1-100", "cardType": "100-pack", "quantity": 100, "totalPrice": 20000},
    {"id": "1-200", "cardType": "200-pack", "quantity": 200, "totalPrice": 40000},
    {"id": "1-400", "cardType": "400-pack", "quantity": 400, "totalPrice": 80000}
  ]'::jsonb),
  ('2', 'Premium Water', '600ml', 300, 'Medium', 30, '[
    {"id": "2-100", "cardType": "100-pack", "quantity": 100, "totalPrice": 30000},
    {"id": "2-200", "cardType": "200-pack", "quantity": 200, "totalPrice": 60000},
    {"id": "2-400", "cardType": "400-pack", "quantity": 400, "totalPrice": 120000}
  ]'::jsonb),
  ('3', 'Mineral Water', '500ml', 250, 'Large', 40, '[
    {"id": "3-100", "cardType": "100-pack", "quantity": 100, "totalPrice": 25000},
    {"id": "3-200", "cardType": "200-pack", "quantity": 200, "totalPrice": 50000}
  ]'::jsonb)
ON CONFLICT (id) DO NOTHING;
