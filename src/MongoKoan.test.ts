import { MongoKoan } from './MongoKoan';
import { Product, ProductWithId } from './models/Product';
import { IndexInformationOptions, InsertManyResult, InsertOneResult, MongoServerError } from 'mongodb';

describe('MongoKoan', () => {
  let mongoKoan: MongoKoan; 

  beforeAll(async () => {
    mongoKoan = new MongoKoan();
    const connectResult = await mongoKoan.connect() as Array<IndexInformationOptions>;
    const loadAllResult = await mongoKoan.loadAll() as InsertManyResult<ProductWithId>;
  });

  test('test countAll', async () => {
    const response = await mongoKoan.countAll(); 
    expect(response).toEqual(36);
  });

  test('get all documents', async () => {
    const response = await mongoKoan.getAll() as Array<ProductWithId>;
    expect(response.length).toBe(36);
  });
  
  test('test addOne', async () => {
    const product: Product = {
      "id": "myNewProduct",
      "name": "This is a test product",
      "status": "draft",
    };

    const insertResult = await mongoKoan.addOne(product) as InsertOneResult<ProductWithId>;
    expect(insertResult).toHaveProperty("insertedId");

    const newProduct = await mongoKoan.getOne(product.id) as ProductWithId;
    expect(newProduct).toMatchObject(product);
    expect(newProduct._id).toEqual(insertResult.insertedId);
  });

  test('test setInStock', async () => {
    const id: string = "329149de-50fb-11ee-be56-0242ac120002";
    const response = await mongoKoan.setInStock(id,20);
    expect(response).toMatchObject({"instock":20});
  });

  test('test add tags attribute', async () => {
    const id = "329150d2-50fb-11ee-be56-0242ac120002";
    const response = await mongoKoan.addTags(id, ["one","two"]);
    expect(response).toMatchObject({tags:["one","two"]});
  });

  test('test push one tag', async () => {
    const id = "3291521c-50fb-11ee-be56-0242ac120002";
    const response = await mongoKoan.pushTag(id, "three");
    expect(response).toMatchObject({tags:["one", "two", "three"]});
  });

  test('test push tags', async () => {
    const id: string = "3291533e-50fb-11ee-be56-0242ac120002";
    const response = await mongoKoan.pushTags(id, ["Yellow","Green"]);
    expect(response).toMatchObject({tags:["Red", "Blue", "Yellow", "Green"]});
  });

  test('test deleteOne', async () => {
    const id: string = "32915442-50fb-11ee-be56-0242ac120002";
    const response = await mongoKoan.deleteOne(id);
    expect(response).toMatchObject({"acknowledged": true, "deletedCount": 1});
  });

  test('test getWithProjection', async () => {
    const response = await mongoKoan.getWithProjection("W",["name", "status"]) as Array<ProductWithId>;
    expect(response[0]).toMatchObject({"name": "YogaMat Plus", status: "draft"});
  });

  test('test elemMatch', async () => {
    const id: string = "32915582-50fb-11ee-be56-0242ac120002";
    const response = await mongoKoan.elemMatch("Opening Balance", 10000) as Array<ProductWithId>;
    expect(response).toBeInstanceOf(Array<ProductWithId>);
    response.forEach(product => {
      if (product.transactions) {
        product.transactions.forEach(trasaction => {
          if (trasaction.description === "Opening Balance") {
            expect(trasaction.credit).toBeGreaterThan(10000);
          };
        });
      }
    });
  });

  test('test inMatch', async () => {
    const id: string = "";
    const response = await mongoKoan.inMatch(["draft","active"]) as Array<ProductWithId>;
    expect(response).toBeInstanceOf(Array<ProductWithId>);
    response.forEach(product => {
      expect(["active", "draft"].includes(product.status)).toBeTruthy();
    })
    
  });

  test('test aggregateSortAdd', async () => {
    const id: string = "";
    const response = await mongoKoan.aggregateSortAdd("NewValue","draft") as Array<{name: string, status: string, added: string}>;
    expect(response).toBeInstanceOf(Array<{name: string, status: string, added: string}>);
    response.forEach(product => {
      expect(product).toHaveProperty("name");
      expect(product).toHaveProperty("status");
      expect(product.status).toBe("draft");
      expect(product).toHaveProperty("added");
      expect(product.added).toBe("NewValue");
    });

  });

  test('test aggregateGroupCount', async () => {
    const id: string = "";
    const response = await mongoKoan.aggregateGroupCount() as Array<{"_id": string, count: number, inventory: number}>;
    expect(response).toBeInstanceOf(Array<{"_id": string, count: number, inventory: number}>);
    expect(response).toHaveLength(3);
    expect(response[0]._id).toBe("active");
    expect(response[0].count).toBe(17);
    expect(response[0].inventory).toBe(381);
    expect(response[1]._id).toBe("deleted");
    expect(response[1].count).toBe(8);
    expect(response[1].inventory).toBe(184);
    expect(response[2]._id).toBe("draft");
    expect(response[2].count).toBe(11);
    expect(response[2].inventory).toBe(189);
  });

  test('test create, list, drop Index', async () => {
    const createResponse = await mongoKoan.createUniqueNameIndex();
    expect(createResponse).toBe("name_1");

    const listResponse = await mongoKoan.listIndexs() as Array<any>;
    expect(listResponse).toBeInstanceOf(Array<IndexInformationOptions>);
    expect(listResponse).toHaveLength(2);
    expect(listResponse[1].name).toBe("name_1");
    
    const response = await mongoKoan.dropIndex("name_1");
    expect(response).toMatchObject({"nIndexesWas": 2, "ok": 1,});

    const checkResponse = await mongoKoan.listIndexs() as Array<any>;
    expect(checkResponse).toBeInstanceOf(Array<IndexInformationOptions>);
    expect(checkResponse).toHaveLength(1);
  });

  test('test nonUniqueAddOne', async () => {
    const createResponse = await mongoKoan.createUniqueNameIndex();
    expect(createResponse).toBe("name_1");

    const product: Product = {id: "foo", name: "FocusTea", status: "none"};
    const response = await mongoKoan.addOne(product) as { error: MongoServerError };
    expect(response).toHaveProperty("error");
    expect(response.error).toBeInstanceOf(MongoServerError);
    expect(response.error.message).toContain("duplicate key error");

    await mongoKoan.dropIndex("name_1");
  });

  test('test cursorIterate', async () => {
    const id: string = "";
    const response = await mongoKoan.cursorIterate("deleted") as number;
    expect(response).toBe(754);
  });

  afterAll(async () => {
    await mongoKoan.dropAllIndexs();
    await mongoKoan.deleteAll(); 
    await mongoKoan.disconnect();
  });
});

