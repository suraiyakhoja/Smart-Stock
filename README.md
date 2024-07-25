# smart-stock-499-capstone

Database information
The database has been dumped into the ssdump.sql file. The following link shows details on how to restore it.
Essentially you just need to run the following command 'mysql < ssdump.sql'. but refer to the link in case you come across any issue reloading the database on your computer

https://dev.mysql.com/doc/refman/5.7/en/reloading-sql-format-dumps.html

Details
Product Table:
For you to add an item to this table, you can use the following columns: barcode, product_name, product_description, product_category, variant_id.

barcode could be anything for now. I suggest A000065 for example.
product_name is pretty obvious
product_description is pretty obvious
product_category is a bit tricky. for now you can just enter the value 1 in there because we get this value from a different table 'Category'. For now, I had created a category that you can link to your new product by putting the value '1'
variant_id is the same concept but for now a variant has been created and you can use the value '1' when creating a product to assign that variant to your new product.


