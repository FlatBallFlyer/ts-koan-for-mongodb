import { productsData, statusData } from "./TestData";
import { Product, ProductWithId } from "./models/Product";
import { MongoClient, Db, Collection, InsertManyResult, 
  IndexInformationOptions, DeleteResult, InsertOneResult, 
  ReturnDocument, FindOneAndReplaceOptions } from "mongodb";

export class MongoKoan {
  private dbName: string = "StageZero";
  private productsCollectionName: string = "Koan_products";
  private statusCollectionName: string = "Koan_status";
  private uri: string = "mongodb://root:example@localhost:27017/?tls=false&directConnection=true";
  
  private client: MongoClient;
  private db!: Db; 
  private products!: Collection;
  private status!: Collection;

  /**
   * Constructor - initilize client with connection URI
   */
  constructor() {
    this.client = new MongoClient(this.uri);
  }

  /**
   * Connect to the Database, and initilize 
   * products and status collection objects 
   * 
   * @returns Array of Index Information from both collections
   */
  public async connect(): Promise<Array<IndexInformationOptions> | {error: any}> {
    try {
      await this.client.connect();
      this.db = this.client.db(this.dbName);
      this.products = this.db.collection(this.productsCollectionName);
      this.status = this.db.collection(this.statusCollectionName);

      const productIndexes = await this.products.listIndexes().toArray();
      const statusIndexes = await this.status.listIndexes().toArray();
      return [...productIndexes, ...statusIndexes];
      // throw("To Be Implemented")
    } catch (error) {
      return {"error": error};
    }
  }

  /**
   * Load all of the products from the TestData file
   * into the this.products collection
   * 
   * @returns the InsertManyResult from MongoDB
   */
  public async loadAllProducts(): Promise<InsertManyResult<ProductWithId> | { error: any }> {
    try {
      return await this.products.insertMany(productsData);
      // throw("To Be Implemented")
    } catch (error) {
      return { error };
    }
  }

  /**
   * Load all of the products from the TestData file
   * into this.status collection
   * 
   * @returns the InsertManyResult from MongoDB
   */
  public async laodAllStatus(): Promise<InsertManyResult<ProductWithId> | { error: any }> {
    try {
      return await this.status.insertMany(statusData);
      // throw("To Be Implemented"); 
    } catch (error) {
      return { "error": error };
    }
  }

  /**
   * Get all the documents from the products collection
   * 
   * @returns Array of Products
   */
  public async getAll(): Promise< Array<ProductWithId> | {error: any}> {
    try {
      return await this.products.find({}).toArray() as Array<ProductWithId>;
      // throw("To Be Implemented")
    } catch (error) {
      return {"error":error};
    }
  }

  /**
   * Cout all of the documents in the products collection
   * 
   * @returns The number of documents in the products collection
   */
  public async countAll(): Promise< number | {error: any}> {
    var result: number | { error: any };
    try {
      return await this.products.countDocuments({});
      // throw("To Be Implemented")
    } catch (error) {
      return {"error":error};
    }
  }

  /**
   * Insert a single document into the products collection
   * 
   * @param product the Product to insert
   * @returns InsertOneResults from MongoDB
   */
  public async addOne(product: Product): Promise<InsertOneResult<Product> | { error: any }> {
    try {
      return await this.products.insertOne(product);
      // throw("To Be Implemented")      
    } catch (error) {
      return {"error": error };
    }
  }

  /**
   * Get a product given the id 
   * NOTE: This is id, not _id
   * 
   * @param id the id of the prodcut to return
   * @returns a single product
   */
  public async getOne(id: string): Promise<ProductWithId | {error: any}> {
    try {
      return await this.products.findOne({"id": id}) as ProductWithId;
      // throw("To Be Implemented")
    } catch (error) {
      return {"error":error};
    }
  }

  /**
   * Add an instock property to the product specified, with the value specified
   * 
   * @param id the Id of the product to update (NOT _id)
   * @param quantity the number to use with the new instock property
   * @returns the product after update
   */
  public async setInStock(id: string, quantity: number): Promise<ProductWithId | {error: any}> {
    try {
      const filter = { "id": id };
      const update = { $set: {"instock":quantity} };
      const option = { returnDocument: ReturnDocument.AFTER };

      return await this.products.findOneAndUpdate(filter, update, option) as ProductWithId;
      // throw("To Be Implemented")
    } catch (error) {
      return {"error":error};
    } 
  }

  /**
   * Decrement the inventoryQuantity on the specified product by the amount specified
   * NOTE quantity of 2 means DECriment quantity by 2
   * 
   * @param id the id of the document to update (NOT _id)
   * @param quantity the quantity to decrement by
   * @returns the updated document
   */
  public async decrementInventoryQuantity(id: string, quantity: number): Promise<ProductWithId | {error: any}> {
    try {
      const selector = { "id": id };
      const updater = {$inc:{inventoryQuantity: -quantity}};
      const option = { returnDocument: ReturnDocument.AFTER };

      return await this.products.findOneAndUpdate(selector, updater, option) as ProductWithId;
      // throw("To Be Implemented")
    } catch (error) {
      return {"error":error};
    }
  }

  /**
   * Add new tags property to a product and initilize it with the list provided
   * 
   * @param id the document id to be updated (NOT _id)
   * @param tags the list of tags to add to that document
   * @returns the updated product
   */
  public async addTags(id: string, tags: Array<string>): Promise<ProductWithId | {error: any}> {
    try {
      const filter = {"id":id};
      const update = {$set:{"tags":tags}};
      const option = { returnDocument: ReturnDocument.AFTER };

      return await this.products.findOneAndUpdate(filter, update, option) as ProductWithId;
      // throw("To Be Implemented")
    } catch (error) {
      return {"error":error};
    }
  }

  /**
   * Add a sinle tag value to the tags list
   * 
   * @param id the document id to be updated (NOT _id)
   * @param tag the single string to add to tags list
   * @returns the updated product
   */
  public async pushTag(id: string, tag: string): Promise<ProductWithId | {error: any}> {
    try {
      const filter = {"id":id};
      const update = {$push:{"tags":tag}} as any;
      const option = { returnDocument: ReturnDocument.AFTER };

      return await this.products.findOneAndUpdate(filter, update, option) as ProductWithId;
      // throw("To Be Implemented")
    } catch (error) {
      return {"error":error};
    }
  }

  /**
   * Add a list of tags to an existing tags attribute
   * 
   * @param id the id of the product to update (NOT _id)
   * @param tags the list of tags to add 
   * @returns the updated product
   */
  public async pushTags(id: string, tags: Array<string>): Promise<ProductWithId | {error: any}> {
    try {
      const filter = {"id":id};
      const update = {$push:{tags: {$each:tags}}} as any;
      const option = { returnDocument: ReturnDocument.AFTER };
      return await this.products.findOneAndUpdate(filter, update, option) as ProductWithId;
      // throw("To Be Implemented")
    } catch (error) {
      return {"error":error};
    }
  }

  /**
   * delete a single document in the products collection
   * 
   * @param id the id of the product to delete (NOT _id)
   * @returns the DeleteResult from MongoDB
   */
  public async deleteOne(id: string): Promise<DeleteResult | {error: any}>{
    try {
      const filter = {"id":id};
      return await this.products.deleteOne(filter);
      // throw("To Be Implemented")
    } catch (error) {
      return {"error":error};
    }
  }

  /**
   * For all of the products with a name greater than or equal to 
   * the provided value, return only the specified properties
   * 
   * @param minimumName minimum name value
   * @param fields list of properties to return
   * @returns Array of products with only the requested properties
   */
  public async getWithProjection(minimumName: string, fields: Array<string>): Promise<Array<ProductWithId> | {error: any}> {
    try {
      const selector: { [key: string]: any } = {name: {$gte:minimumName}};
      const projection: { [key: string]: any } = {_id:0};
      fields.forEach((field) => {projection[field] = 1;});

      return await this.products.find(selector).project(projection).toArray() as Array<ProductWithId>;
      // throw("To Be Implemented")
    } catch (error) {
      return {"error":error};
    }
  }

  /**
   * Find all the products that have a transaction with both
   * the provided description, and a credit value greater than a minimum
   * 
   * @param description the transaction description
   * @param minimumCredit 
   * @returns List of products that match
   */
  public async elemMatch(description: string, minimumCredit: number): Promise<Array<ProductWithId> | {error: any}> {
    try {
      const filter = {
        transactions: {
          $elemMatch: {
            "description": description,
            "credit": {$gt: minimumCredit}
          }
        }
      };
      return await this.products.find(filter).toArray() as Array<ProductWithId>;
      // throw("To Be Implemented")
    } catch (error) {
      return {"error":error};
    }
  }

  /**
   * Return all the products with a status that is in the list provided
   * 
   * @param statsOptions List of status to include
   * @returns List of products selected
   */
  public async inMatch(statsOptions: Array<string>): Promise<Array<ProductWithId> | {error: any}> {
    try {
      const filter = {status: {$in: statsOptions}};
      return await this.products.find(filter).sort({"name":1}).toArray() as Array<ProductWithId>;
      // throw("To Be Implemented")
    } catch (error) {
      return {"error":error};
    }
  }

  /**
   * Given a status, update all the products that match a provided status, 
   * sorted by name decending, with a new filed called "added" that has 
   * the value provided, and only return the name, added, and status properties
   * NOTE: Do not include the _id property in the return value
   * 
   * @param addTextValue value to be added 
   * @param status status of products to be updated
   * @returns an arry of objects with name, added, and status properties
   */
  public async aggregateSortAdd(addTextValue: string, status: string): Promise<Array<{name: string, status: string, added: string}> | {error: any}> {
    try {
      const selector = {status: status};
      const sort = {name: -1};
      const addField = {added: addTextValue};
      const projection = {"_id":0,"name":1,"added":1,"status":1};
      const pipeline = [
        {$match: selector },
        {$sort: sort },
        {$set: addField },
        {$project: projection},
      ];
      return await this.products.aggregate(pipeline).toArray() as Array<{name: string, status: string, added: string}>;
      // throw("To Be Implemented")
    } catch (error) {
      return {"error":error};
    }
  }

  /**
   * Return the number of products by status, with the total inventoryQuantity
   * 
   * @returns  an array of status, count, and quantity
   */
  public async aggregateGroupCount(): Promise<Array<{"_id": string, count: number, inventory: number}> | {error: any}> {
      try {
        const groupby = {_id:"$status", count: {$count:{}}, inventory:{$sum:"$inventoryQuantity"}};
        const projection = {"count":1,"inventory":1};
        const sort = {_id: 1};
        const pipeline = [
          {$group: groupby },
          {$sort: sort},
          {$project: projection},
        ];
        const cursor = this.products.aggregate(pipeline);
        const reply = await cursor.toArray() as Array<{"_id": string, count: number, inventory: number}>;
        return reply;
        // throw("To Be Implemented")
      } catch (error) {
        return {"error":error};
      }
    }
  
  /**
   * Create a new index on the products collection that 
   * is on ascend name, with a unique constraint
   * 
   * @returns The name of the index created
   */
  public async createUniqueNameIndex(): Promise<string | {error: any}> {
    try {
      return await this.products.createIndex( {name:1},{unique:true} );
    } catch (error) {
      return {"error":error};
    }
  }

  /**
   * Get a list of the indexes on the products collection
   * 
   * @returns the list
   */
  public async listIndexs(): Promise<Array<IndexInformationOptions> | {error: any}> {
    try {
      return await this.products.indexes({full:true});
      // throw("To Be Implemented")
    } catch (error) {
      return {"error":error};
    }
  }

  /**
   * Remove an index from the products collection
   * 
   * @param name the name of the index to drop
   * @returns the MongoDB drop index return value
   */
  public async dropIndex(name: string): Promise<any> {
    try {
      return await this.products.dropIndex(name);
      // throw("To Be Implemented")
    } catch (error) {
      return {"error":error};
    }
  }

  /**
   * get a list of indexes for the products and then drop all of them
   * 
   * @returns undefined or an error
   */
  public async dropAllIndexs() {
    try {
      const indexes = await(this.listIndexs()) as Array<any>;
      indexes.forEach(index => {
        if (index.name != "_id_") {
          this.dropIndex(index.name);
        }
      });
      // throw("To Be Implemented")
    } catch (error) {
      return {"error":error};
    }
  }

  /**
   * Use a cursor to iterate over all documents and total inventoryQuantity
   * 
   * @returns the total of inventoryQuantity
   */
  public async cursorIterate(): Promise<number | {error: any}> {
    try {
      // Get Cursor
      var quantity: number = 0;
      const cursor = this.products.find({});
      while (await cursor.hasNext()) {
        const product = await cursor.next() as ProductWithId;
        if (product.inventoryQuantity) {
          quantity += product.inventoryQuantity;
        }
      }
      return quantity;
      // throw("To Be Implemented")
    } catch (error) {
      return {"error":error};
    }
  }
    
  /**
   * Update a product document by replacing the entire document with a new document
   * 
   * @param product the new Prodcut to use
   * @returns the new product document
   */
  public async replaceProduct(product: Product): Promise<ProductWithId | {"error":any}> {
    try {
      // Code to replace the product with product.id with the product provided
      const filter = {"id": product.id};
      const options: FindOneAndReplaceOptions = {"returnDocument": "after"};
      return await this.products.findOneAndReplace(filter, product, options) as unknown as ProductWithId;
      // throw("To Be Implemented"); 
    } catch (error) {
      return {"error":error};
    }
  }

  /**
   * use the $and operator to find all products with a given status
   * and a inventoryQuantity greater than or equal to the required level
   * 
   * @param status the status to use
   * @param requiredInventory the minimum inventory 
   * @returns an array of the Products that match
   */
  public async findProductsLogical(status: string, requiredInventory: number): Promise<Array<ProductWithId> | {"error":any}> {
    try {
      const filter = {$and: [
        {"status": status},
        {"inventoryQuantity": {$gte: requiredInventory}},
      ]};

      return await this.products.find(filter).toArray() as Array<ProductWithId>;
      // throw("To Be Implemented"); 
    } catch (error) {
      return {"error":error};
    }
  }

  /**
   * use the $and operator to find all products with a given status
   * and a inventoryQuantity greater than or equal to the required level
   * and join them to the corresponding document from status collection
   * (where product.status == status.status)
   * 
   * @param status the status to use
   * @param requiredInventory the minimum inventory 
   * @returns an array of the Products with statuses
   */
  public async productsWithStatus(status: string, requiredInventory: number): Promise<Array<any> | {"error":any}> {
    try {
      const selector = {
        $and: [
          {status: status}, 
          {inventoryQuantity: {$gte:requiredInventory}},
        ]
      };
      const lookup = {
        from: this.statusCollectionName, 
        localField: "status", 
        foreignField: "status", 
        as: "statusItem",
      }; 
      const pipeline = [
        {$match: selector},
        {$lookup: lookup},
      ];
      return await this.products.aggregate(pipeline).toArray() as Array<any>;
      // throw("To Be Implemented"); 
    } catch (error) {
      return {"error":error};
    }
  }

  /**
   * delete all the documents in both the prodcuts and status collections
   * 
   * @returns undefined or an error
   */
  public async deleteAll() {
    try {
      // delete all documents in the products and status collections
      const allProductsDeleted = await this.products.deleteMany({});
      const allStatusDeleted = await this.status.deleteMany({});
      return;
      // throw("To Be Implemented"); 
    } catch (error) {
      return {"error":error};
    }
  }

  /**
   * disconnect from the mongo database
   */
  public async disconnect(): Promise<void> {
    try {
      await this.client.close();
      // throw("To Be Implemented"); 
      console.log("Disconnected from MongoDB");
    } catch (error) {
      console.error("Failed to disconnect from MongoDB:", error);
    }
  }
}
