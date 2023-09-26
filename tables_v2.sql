CREATE TABLE branch(
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  address VARCHAR(100) NOT NULL,
  timezone VARCHAR(32) NOT NULL,
  phone_number VARCHAR(50) NOT NULL,
  status SMALLINT NOT NULL,
  /* 
    0. open
    1. closed
    2. acceptance
    3. overordered
  */
  schedule JSONB NOT NULL,
  /*
  [
      { // Monday
        'starts': {starts time},
        'ends': {ends time}
      },
      {
        'starts': {starts time},
        'ends': {ends time}
      },
      {
        'starts': {starts time},
        'ends': {ends time}
      },
      {
        'starts': {starts time},
        'ends': {ends time}
      },
      {
        'starts': {starts time},
        'ends': {ends time}
      },
      {
        'starts': {starts time},
        'ends': {ends time}
      },
      {
        'start': 'closed'
      },
  ]
  */
  qr CHAR(64) NOT NULL,
);

/* TODO: create table branch_schedule_extra */

CREATE TABLE branch_item(
  id SERIAL PRIMARY KEY,
  branch_id INTEGER NOT NULL,
  item_id INTEGER NOT NULL,
  shelf_amount JSONB NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  is_sale BOOLEAN NOT NULL,
  price FLOAT NOT NULL,
  sale_price FLOAT NOT NULL,
);

CREATE TABLE branch_shelf(
  id SERIAL PRIMARY KEY,
  branch_id INTEGER NOT NULL,
  name VARCHAR(5) NOT NULL,
  storage_type_id INTEGER NOT NULL,
  is_disabled BOOLEAN NOT NULL,
  qr CHAR(64) NOT NULL,
);