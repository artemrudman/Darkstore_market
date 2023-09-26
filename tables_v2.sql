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
  log_id INTEGER NOT NULL
);

/* TODO: create table branch_schedule_extra */

CREATE TABLE branch_items(
  id SERIAL PRIMARY KEY,
  branch_id INTEGER NOT NULL,
  item_id INTEGER NOT NULL,
  shelf_amount JSONB NOT NULL,
  expires_date TIMESTAMP NOT NULL,
  is_sale BOOLEAN NOT NULL,
  price FLOAT NOT NULL,
  sale_price FLOAT NOT NULL,
  log_id INTEGER NOT NULL
);