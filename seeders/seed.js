import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // Create Roles
  const adminRole = await prisma.role.create({
    data: {
      role_name: "Admin",
    },
  });

  const userRole = await prisma.role.create({
    data: {
      role_name: "User",
    },
  });

  // Create Users
  const adminUser = await prisma.user.create({
    data: {
      username: "admin",
      password: "adminpassword", // Make sure to hash passwords in a real application
      role_id: adminRole.role_id,
      account_name: "Admin Account",
      email: "admin@example.com",
    },
  });

  const normalUser = await prisma.user.create({
    data: {
      username: "user",
      password: "userpassword", // Make sure to hash passwords in a real application
      role_id: userRole.role_id,
      account_name: "User Account",
      email: "user@example.com",
    },
  });

  // Create Customers
  const customer1 = await prisma.customer.create({
    data: {
      customer_id: "CUST001",
      customer_name: "Customer One",
      customer_type: "Type A",
      image: "image1.png",
      address: "Address 1",
      phone: "1234567890",
      email: "customer1@example.com",
      credit_balance: 100.0,
    },
  });

  const customer2 = await prisma.customer.create({
    data: {
      customer_id: "CUST002",
      customer_name: "Customer Two",
      customer_type: "Type B",
      image: "image2.png",
      address: "Address 2",
      phone: "0987654321",
      email: "customer2@example.com",
      credit_balance: 200.0,
    },
  });

  // Create Products
  const product1 = await prisma.product.create({
    data: {
      sku: "PROD001",
      product_name: "Product One",
      unit_price: 50.0,
    },
  });

  const product2 = await prisma.product.create({
    data: {
      sku: "PROD002",
      product_name: "Product Two",
      unit_price: 75.0,
    },
  });

  // Create Orders
  const order1 = await prisma.order.create({
    data: {
      customer_id: customer1.id,
      user_id: adminUser.user_id,
      order_status: "Pending",
    },
  });

  const order2 = await prisma.order.create({
    data: {
      customer_id: customer2.id,
      user_id: normalUser.user_id,
      order_status: "Completed",
    },
  });

  // Create Order Items
  await prisma.orderItem.create({
    data: {
      order_id: order1.order_id,
      item_type: "Product",
      item_id: product1.id.toString(),
      quantity: 2,
      unit_price: 50.0,
    },
  });

  await prisma.orderItem.create({
    data: {
      order_id: order2.order_id,
      item_type: "Product",
      item_id: product2.id.toString(),
      quantity: 1,
      unit_price: 75.0,
    },
  });

  // Create Warehouses
  const warehouse1 = await prisma.warehouse.create({
    data: {
      warehouse_name: "Warehouse One",
      location: "Location 1",
    },
  });

  // Create Vendors
  const vendor1 = await prisma.vendor.create({
    data: {
      vendor_name: "Vendor One",
      vendor_address: "Vendor Address 1",
      vendor_phone: "1111111111",
      vendor_tax_number: "TAX001",
    },
  });

  // Create Purchase Orders
  await prisma.purchaseOrder.create({
    data: {
      product_id: product1.id,
      sku: product1.sku,
      vendor_id: vendor1.vendor_id,
      warehouse_id: warehouse1.warehouse_id,
      quantity: 10,
    },
  });

  // Create Transactions
  await prisma.transaction.create({
    data: {
      order_id: order1.order_id,
      user_id: adminUser.user_id,
      amount: 100.0,
      transaction_type: "Credit",
    },
  });

  // Create Invoices
  await prisma.invoice.create({
    data: {
      order_id: order1.order_id,
      amount: 100.0,
      status: "Paid",
    },
  });

  // Create Notifications
  await prisma.userNotification.create({
    data: {
      user_id: adminUser.user_id,
      notification_type: "Email",
    },
  });

  // Create Expenses
  await prisma.expense.create({
    data: {
      expense_id: "EXP001",
      expense_name: "Expense One",
      description: "Expense Description",
      amount: 20.0,
      expense_date: new Date(),
      category: "Office",
      user_id: adminUser.user_id,
    },
  });

  // Create Prefix Sequences
  await prisma.prefixSequence.create({
    data: {
      prefix: "ORD",
    },
  });

  console.log("Database has been seeded");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
