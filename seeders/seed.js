import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
const prisma = new PrismaClient();

async function main() {
  // Clear existing data in the correct order to avoid foreign key constraint issues
  await prisma.orderItem.deleteMany({});
  await prisma.approvalLog.deleteMany({});
  await prisma.paymentHistory.deleteMany({});
  await prisma.invoice.deleteMany({});
  await prisma.transaction.deleteMany({});
  await prisma.userNotification.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.purchaseOrder.deleteMany({});
  await prisma.expense.deleteMany({});
  await prisma.pIC.deleteMany({});
  await prisma.warehouse.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.service.deleteMany({});
  await prisma.vendor.deleteMany({});
  await prisma.customer.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.role.deleteMany({});
  await prisma.prefixSequence.deleteMany({});

  // Seeder for Role
  await prisma.role.createMany({
    data: [
      { role_id: "ROLE001", role_name: "Admin" },
      { role_id: "ROLE002", role_name: "User" },
    ],
  });

  const adminRole = await prisma.role.findFirst({
    where: { role_name: "Admin" },
  });
  const userRole = await prisma.role.findFirst({
    where: { role_name: "User" },
  });

  // Hash passwords
  const hashedAdminPassword = await bcrypt.hash("admin", 10);
  const hashedUserPassword = await bcrypt.hash("user", 10);

  // Seeder for User
  await prisma.user.createMany({
    data: [
      {
        user_id: "USER001",
        username: "admin",
        password: hashedAdminPassword,
        role_id: adminRole.role_id,
        account_name: "Admin Account",
        email: "admin@example.com",
      },
      {
        user_id: "USER002",
        username: "user",
        password: hashedUserPassword,
        role_id: userRole.role_id,
        account_name: "User Account",
        email: "user@example.com",
      },
    ],
  });

  // Seeder for Customer
  await prisma.customer.createMany({
    data: [
      {
        customer_id: "CUST001",
        customer_name: "Customer One",
        customer_type: "Corporate",
        image: "customer1.jpg",
        address: "123 Main St",
        phone: "123-456-7890",
        email: "customer1@example.com",
        credit_balance: 1000.0,
      },
      {
        customer_id: "CUST002",
        customer_name: "Customer Two",
        customer_type: "Individual",
        image: "customer2.jpg",
        address: "456 Elm St",
        phone: "987-654-3210",
        email: "customer2@example.com",
        credit_balance: 500.0,
      },
    ],
  });

  // Seeder for Product
  await prisma.product.createMany({
    data: [
      {
        sku: "PROD001",
        product_name: "Product One",
        unit_price: 100.0,
      },
      {
        sku: "PROD002",
        product_name: "Product Two",
        unit_price: 150.0,
      },
    ],
  });

  // Seeder for Service
  await prisma.service.createMany({
    data: [
      {
        service_code: "SERV001",
        service_name: "Service One",
        unit_price: 200.0,
        customer_id: 1, // Ensure this matches the appropriate customer ID
      },
      {
        service_code: "SERV002",
        service_name: "Service Two",
        unit_price: 250.0,
        customer_id: 2, // Ensure this matches the appropriate customer ID
      },
    ],
  });

  // Seeder for Warehouse
  await prisma.warehouse.createMany({
    data: [
      {
        warehouse_id: "WH001",
        warehouse_name: "Main Warehouse",
        location: "Warehouse Location 1",
      },
      {
        warehouse_id: "WH002",
        warehouse_name: "Secondary Warehouse",
        location: "Warehouse Location 2",
      },
    ],
  });

  // Seeder for Vendor
  await prisma.vendor.createMany({
    data: [
      {
        vendor_id: "VEND001",
        vendor_name: "Vendor One",
        vendor_address: "Vendor Address 1",
        vendor_phone: "111-222-3333",
        vendor_tax_number: "TAX001",
      },
      {
        vendor_id: "VEND002",
        vendor_name: "Vendor Two",
        vendor_address: "Vendor Address 2",
        vendor_phone: "444-555-6666",
        vendor_tax_number: "TAX002",
      },
    ],
  });

  // Seeder for Purchase Order
  await prisma.purchaseOrder.createMany({
    data: [
      {
        purchase_order_id: "PO001",
        product_id: 1, // Ensure this matches the appropriate product ID
        vendor_id: 1, // Ensure this matches the appropriate vendor ID
        warehouse_id: 1, // Ensure this matches the appropriate warehouse ID
        quantity: 50,
        order_date: new Date(),
      },
      {
        purchase_order_id: "PO002",
        product_id: 2, // Ensure this matches the appropriate product ID
        vendor_id: 2, // Ensure this matches the appropriate vendor ID
        warehouse_id: 2, // Ensure this matches the appropriate warehouse ID
        quantity: 100,
        order_date: new Date(),
      },
    ],
  });

  // Seeder for PrefixSequence
  await prisma.prefixSequence.createMany({
    data: [
      {
        prefix: "ORD",
        prefix_id: "ORD001",
        current_sequence: 1,
      },
      {
        prefix: "INV",
        prefix_id: "INV001",
        current_sequence: 1,
      },
    ],
  });

  console.log("Seeding completed.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
