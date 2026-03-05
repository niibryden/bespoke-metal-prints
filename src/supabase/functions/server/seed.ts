// Seed data generator for testing
import * as kv from "./kv_store.tsx";

const SAMPLE_NAMES = [
  "Sarah Johnson", "Michael Chen", "Emily Rodriguez", "David Kim", 
  "Jessica Martinez", "Christopher Brown", "Amanda Taylor", "James Wilson"
];

const SAMPLE_CITIES = [
  { city: "New York", state: "NY", zip: "10001" },
  { city: "Los Angeles", state: "CA", zip: "90001" },
  { city: "Chicago", state: "IL", zip: "60601" },
  { city: "Houston", state: "TX", zip: "77001" },
  { city: "Phoenix", state: "AZ", zip: "85001" }
];

const SIZES = ["8\" x 10\"", "12\" x 16\"", "16\" x 20\"", "24\" x 36\""];
const FINISHES = ["Matte", "Glossy"];
const STATUSES = ["pending", "paid", "processing", "shipped", "completed"];

function randomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function generateOrderId(): string {
  return `ord_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export async function seedTestOrders(count: number = 10) {
  console.log(`🌱 Seeding ${count} test orders...`);
  
  for (let i = 0; i < count; i++) {
    const name = randomItem(SAMPLE_NAMES);
    const location = randomItem(SAMPLE_CITIES);
    const orderId = generateOrderId();
    
    const order = {
      id: orderId,
      customerEmail: `${name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
      shippingAddress: {
        name: name,
        street1: `${Math.floor(Math.random() * 999) + 1} Main Street`,
        city: location.city,
        state: location.state,
        zip: location.zip,
        country: "US"
      },
      orderDetails: {
        size: randomItem(SIZES),
        finish: randomItem(FINISHES),
        mountType: "Stick Tape",
        frame: "None"
      },
      amount: 50 + Math.floor(Math.random() * 200),
      status: randomItem(STATUSES),
      paymentStatus: "succeeded",
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await kv.set(`order:${orderId}`, order);
  }
  
  console.log(`✅ Successfully seeded ${count} test orders!`);
  return { success: true, count };
}