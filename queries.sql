-- create a new user for application
-- creating a user named `foo` with password `bar`
CREATE USER 'foo'@'%' IDENTIFIED WITH mysql_native_password BY "bar";
GRANT ALL PRIVILEGES on *.* to 'foo'@'%';

-- flush privileges cache for changes to take place
FLUSH PRIVILEGES;

-- INSERT SOME PRODUCTS
INSERT INTO products (name, cost, description) VALUES
 ("Brown Rice Cookies", 1000, "Cookies but brown rice"),
 ("Organic Soy Milk", 1000, "Soy Milk But Organic"),
 ("Mock Chicken Rice", 1000, "Chicken but tofu");