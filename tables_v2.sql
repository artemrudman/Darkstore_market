CREATE TABLE branch(
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  address VARCHAR(100) NOT NULL,
  timezone VARCHAR(32) NOT NULL,
  phone_number VARCHAR(50) NOT NULL,
  status SMALLINT NOT NULL, -- TODO: needed?
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
  qr CHAR(64) NOT NULL
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
  acceptance_id INTEGER NOT NULL
);

CREATE TABLE branch_shelf(
  id SERIAL PRIMARY KEY,
  branch_id INTEGER NOT NULL,
  name VARCHAR(5) NOT NULL,
  storage_type_id INTEGER NOT NULL,
  is_disabled BOOLEAN NOT NULL,
  qr CHAR(64) NOT NULL
);



CREATE TABLE branch_acceptance(
  id SERIAL PRIMARY KEY,
  branch_id INTEGER NOT NULL,
  items JSONB NOT NULL,
  is_finished BOOLEAN NOT NULL
);



CREATE TABLE item(
  id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  description VARCHAR(350) NOT NULL,
  ingredients VARCHAR(350) NOT NULL,
  weight INTEGER NOT NULL,
  product_type_id INTEGER NOT NULL,
  storage_type_id INTEGER NOT NULL,
  picture_uuid UUID NOT NULL,
  barcode CHAR(64) NOT NULL
);



CREATE TABLE item_storage_type(
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL
  /* 
    ambient shelf
    fridge shelf
    frozen shelf
    egg shelf
    ...
  */
);

CREATE TABLE item_product_type(
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL
  /* 
    milk
    alcohol
    drink
    ...
  */
);



CREATE TABLE user_(
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  email VARCHAR(50) NOT NULL,
  phone_number VARCHAR(50) NOT NULL,
  password CHAR(60) NOT NULL,
  payment_info JSONB NOT NULL, -- TODO: needed?
  registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  registration_ip INET NOT NULL,
  is_disabled BOOLEAN NOT NULL
);

CREATE TABLE worker(
  id SERIAL PRIMARY KEY,
  branch_id INTEGER NOT NULL,
  name VARCHAR(50) NOT NULL,
  email VARCHAR(50) NOT NULL,
  phone_number VARCHAR(50) NOT NULL,
  role_id SMALLINT NOT NULL,
  /* 
    0. technical director
    1. executive director
    2. manager
    3. warehouse worker
    4. deliveryman
    5. technical support
    6. customer support
  */
  status SMALLINT NOT NULL,
  /*
    Deliveryman: 
    0. available
    1. returning
    2. break
    3. handling over orders
    4. on the way to client
    5. picking up order
    Worker:
    0. available
    1. not available
    2. break
    3. collects and prepare order
  */
  is_disabled BOOLEAN NOT NULL,
  qr CHAR(64) NOT NULL
);



CREATE TABLE order_(
  id SERIAL PRIMARY KEY,
  branch_id INTEGER NOT NULL,
  number VARCHAR(50) NOT NULL, -- ?
  items JSONB NOT NULL,
  status SMALLINT NOT NULL,
  /* 
    0. awaiting preparation
    1. preparing
    2. ready for pickup
    3. delivering
    4. delivered
    5. returned
    6. partly returned
    7. not active
  */
  user_id INTEGER NOT NULL,
  worker_id INTEGER NOT NULL,
  deliveryman_id INTEGER NOT NULL,
  delivery_address VARCHAR(150) NOT NULL,
  worker_started_at TIMESTAMP NOT NULL,
  worker_finished_at TIMESTAMP NOT NULL,
  deliveryman_started_at TIMESTAMP NOT NULL,
  deliveryman_finished_at TIMESTAMP NOT NULL
);



CREATE TABLE log(
  id INTEGER NOT NULL,
  type SMALLINT NOT NULL,
  history JSONB NOT NULL
);