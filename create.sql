CREATE TABLE products (
  product_id character varying(100) NOT NULL,
  product_name character varying(255),
  product_price integer,
  product_image text,
  created_at timestamp NOT NULL,
  updated_at timestamp
);

CREATE TABLE customer_orders (
  order_id character varying(100) NOT NULL,
  product_id character varying(100),
  line_id character varying(255),
  is_serve boolean DEFAULT false,
  created_at timestamp NOT NULL,
  updated_at timestamp
);