CREATE TABLE branch(
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    address VARCHAR(100) NOT NULL,
    timezone VARCHAR(50) NOT NULL, -- TODO: datatype
    barcode INTEGER NOT NULL, -- TODO: datatype
    phone_number VARCHAR(16) NOT NULL,
	status SMALLINT NOT NULL,
	/* 
        0. open
        1. closed
        2. acceptance
	    3. overordered
    */
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by_id INTEGER NOT NULL
);

CREATE TABLE branch_working_hours(
    branch_id INTEGER NOT NULL,
    day SMALLINT NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL
);

CREATE TABLE branch_items(
    id SERIAL PRIMARY KEY,
    branch_id INTEGER NOT NULL,
    name VARCHAR(150) NOT NULL,
    description VARCHAR(350) NOT NULL,
    ingredients VARCHAR(350) NOT NULL,
    barcode INTEGER NOT NULL, -- TODO: datatype
	weight INTEGER NOT NULL,
	product_type_id SMALLINT NOT NULL,
	items JSON NOT NULL,
	expires_date TIMESTAMP NOT NULL,
    is_sale BOOLEAN NOT NULL,
	price FLOAT NOT NULL,
	sale_price FLOAT NOT NULL,
    link_to_picture VARCHAR(350) DEFAULT 'default_link_to_picture',
	created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by_id INTEGER NOT NULL
);

CREATE TABLE branch_shelfs(
    id SERIAL PRIMARY KEY,
    branch_id INTEGER NOT NULL,
    name VARCHAR(50) NOT NULL,
    barcode INTEGER NOT NULL, -- TODO: datatype
	storage_type_id SMALLINT NOT NULL,
	status_name_id SMALLINT NOT NULL,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by_id INTEGER NOT NULL
);





CREATE TABLE acceptances(
    id SERIAL PRIMARY KEY,
    branch_id INTEGER NOT NULL,
	items JSON NOT NULL, /* make some marker for accepted items */
    is_finished BOOLEAN,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by_id INTEGER NOT NULL
);





CREATE TABLE storage_types(
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    /* 
        ambient shelf
        fridge shelf
        frozen shelf
        egg shelf
        ...
    */
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	created_by_id INTEGER NOT NULL
);

CREATE TABLE product_types(
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    /* 
        milk
        alcohol
        drink
        ...
    */
    storage_type_id SMALLINT NOT NULL,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	created_by_id INTEGER NOT NULL,
);




CREATE TABLE users(
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
	password CHAR(60),
	email VARCHAR(50) NOT NULL,
	phone_number VARCHAR(16) NOT NULL,
	sale_promocode JSON NOT NULL,
	payment_info JSON,
	registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_disabled BOOLEAN NOT NULL
);

CREATE TABLE workers(
    id SERIAL PRIMARY KEY,
    branch_id INTEGER NOT NULL,
    name VARCHAR(50) NOT NULL,
    email VARCHAR(50) NOT NULL,
	phone_number VARCHAR(16) NOT NULL,
	barcode INTEGER NOT NULL,  -- TODO: datatype
	role_id INTEGER NOT NULL,
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
	sale_promocode JSON NOT NULL,
    is_disabled BOOLEAN NOT NULL,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by_id INTEGER NOT NULL
);





CREATE TABLE operations( /* add all operations here - write logic of text in every operation functions */
    id SERIAL PRIMARY KEY,
    branch_id INTEGER NOT NULL,
    description VARCHAR(250) NOT NULL,
    created_by_id INTEGER NOT NULL,
	created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
);


CREATE TABLE orders(
    id SERIAL PRIMARY KEY,
    branch_id INTEGER NOT NULL,
    number VARCHAR(50) NOT NULL,
	items JSON NOT NULL,
    created_by_id INTEGER NOT NULL,
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
	delivery_address VARCHAR(150) NOT NULL,
	created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	worker_id INTEGER NOT NULL,
	deliveryman_id INTEGER NOT NULL, 
    start_gather_order_time TIMESTAMP,
    finish_gather_order_time TIMESTAMP,
    deliveryman_take_time TIMESTAMP,
	delivery_finish_time TIMESTAMP
);