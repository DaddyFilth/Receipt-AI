import axios from 'axios';
import * as cheerio from 'cheerio';

export interface ReceiptTemplate {
  id: string;
  name: string;
  source: string;
  sourceUrl: string;
  category: string;
  html: string;
  thumbnail: string;
  fields: ReceiptField[];
}

export interface ReceiptField {
  key: string;
  label: string;
  value: string;
  type: 'text' | 'number' | 'date' | 'currency';
}

const BUILT_IN_TEMPLATES: ReceiptTemplate[] = [
  {
    id: 'retail-basic',
    name: 'Basic Retail Receipt',
    source: 'Built-in',
    sourceUrl: '',
    category: 'Retail',
    thumbnail: '',
    html: '',
    fields: [
      { key: 'storeName', label: 'Store Name', value: 'ACME Store', type: 'text' },
      { key: 'storeAddress', label: 'Store Address', value: '123 Main St, Anytown, USA', type: 'text' },
      { key: 'storePhone', label: 'Phone', value: '(555) 123-4567', type: 'text' },
      { key: 'date', label: 'Date', value: new Date().toLocaleDateString(), type: 'date' },
      { key: 'time', label: 'Time', value: new Date().toLocaleTimeString(), type: 'text' },
      { key: 'cashier', label: 'Cashier', value: 'Employee #42', type: 'text' },
      { key: 'item1Name', label: 'Item 1', value: 'Widget A', type: 'text' },
      { key: 'item1Price', label: 'Item 1 Price', value: '9.99', type: 'currency' },
      { key: 'item2Name', label: 'Item 2', value: 'Widget B', type: 'text' },
      { key: 'item2Price', label: 'Item 2 Price', value: '14.99', type: 'currency' },
      { key: 'item3Name', label: 'Item 3', value: 'Widget C', type: 'text' },
      { key: 'item3Price', label: 'Item 3 Price', value: '5.49', type: 'currency' },
      { key: 'subtotal', label: 'Subtotal', value: '30.47', type: 'currency' },
      { key: 'tax', label: 'Tax (8%)', value: '2.44', type: 'currency' },
      { key: 'total', label: 'Total', value: '32.91', type: 'currency' },
      { key: 'paymentMethod', label: 'Payment', value: 'VISA ****1234', type: 'text' },
    ],
  },
  {
    id: 'restaurant-receipt',
    name: 'Restaurant Receipt',
    source: 'Built-in',
    sourceUrl: '',
    category: 'Restaurant',
    thumbnail: '',
    html: '',
    fields: [
      { key: 'restaurantName', label: 'Restaurant', value: 'The Golden Fork', type: 'text' },
      { key: 'address', label: 'Address', value: '456 Oak Ave, Foodtown, USA', type: 'text' },
      { key: 'phone', label: 'Phone', value: '(555) 987-6543', type: 'text' },
      { key: 'date', label: 'Date', value: new Date().toLocaleDateString(), type: 'date' },
      { key: 'server', label: 'Server', value: 'Mike', type: 'text' },
      { key: 'table', label: 'Table', value: '12', type: 'text' },
      { key: 'item1', label: 'Appetizer', value: 'Caesar Salad', type: 'text' },
      { key: 'item1Price', label: 'Appetizer Price', value: '12.00', type: 'currency' },
      { key: 'item2', label: 'Entree', value: 'Grilled Salmon', type: 'text' },
      { key: 'item2Price', label: 'Entree Price', value: '28.00', type: 'currency' },
      { key: 'item3', label: 'Drink', value: 'Iced Tea', type: 'text' },
      { key: 'item3Price', label: 'Drink Price', value: '4.50', type: 'currency' },
      { key: 'subtotal', label: 'Subtotal', value: '44.50', type: 'currency' },
      { key: 'tax', label: 'Tax', value: '3.56', type: 'currency' },
      { key: 'tipSuggestion', label: 'Suggested Tip (20%)', value: '8.90', type: 'currency' },
      { key: 'total', label: 'Total', value: '48.06', type: 'currency' },
    ],
  },
  {
    id: 'hotel-receipt',
    name: 'Hotel Invoice',
    source: 'Built-in',
    sourceUrl: '',
    category: 'Hotel',
    thumbnail: '',
    html: '',
    fields: [
      { key: 'hotelName', label: 'Hotel', value: 'Grand Plaza Hotel', type: 'text' },
      { key: 'address', label: 'Address', value: '789 Luxury Blvd, Metro City, USA', type: 'text' },
      { key: 'phone', label: 'Phone', value: '(555) 456-7890', type: 'text' },
      { key: 'guestName', label: 'Guest', value: 'John Smith', type: 'text' },
      { key: 'checkIn', label: 'Check-in', value: '2024-01-15', type: 'date' },
      { key: 'checkOut', label: 'Check-out', value: '2024-01-18', type: 'date' },
      { key: 'roomType', label: 'Room Type', value: 'Deluxe King Suite', type: 'text' },
      { key: 'roomNumber', label: 'Room #', value: '412', type: 'text' },
      { key: 'nightlyRate', label: 'Nightly Rate', value: '189.00', type: 'currency' },
      { key: 'nights', label: 'Nights', value: '3', type: 'number' },
      { key: 'roomTotal', label: 'Room Total', value: '567.00', type: 'currency' },
      { key: 'roomService', label: 'Room Service', value: '45.00', type: 'currency' },
      { key: 'parking', label: 'Parking', value: '60.00', type: 'currency' },
      { key: 'tax', label: 'Tax (12%)', value: '80.64', type: 'currency' },
      { key: 'total', label: 'Total', value: '752.64', type: 'currency' },
    ],
  },
  {
    id: 'gas-station',
    name: 'Gas Station Receipt',
    source: 'Built-in',
    sourceUrl: '',
    category: 'Gas Station',
    thumbnail: '',
    html: '',
    fields: [
      { key: 'stationName', label: 'Station', value: 'QuickFuel Gas', type: 'text' },
      { key: 'address', label: 'Address', value: '321 Highway 1, Roadside, USA', type: 'text' },
      { key: 'date', label: 'Date', value: new Date().toLocaleDateString(), type: 'date' },
      { key: 'time', label: 'Time', value: new Date().toLocaleTimeString(), type: 'text' },
      { key: 'pump', label: 'Pump #', value: '7', type: 'text' },
      { key: 'fuelType', label: 'Fuel Type', value: 'Regular Unleaded', type: 'text' },
      { key: 'gallons', label: 'Gallons', value: '12.456', type: 'number' },
      { key: 'pricePerGallon', label: 'Price/Gal', value: '3.459', type: 'currency' },
      { key: 'fuelTotal', label: 'Fuel Total', value: '43.08', type: 'currency' },
      { key: 'carWash', label: 'Car Wash', value: '8.00', type: 'currency' },
      { key: 'total', label: 'Total', value: '51.08', type: 'currency' },
      { key: 'paymentMethod', label: 'Payment', value: 'Debit ****5678', type: 'text' },
    ],
  },
  {
    id: 'medical-receipt',
    name: 'Medical Office Receipt',
    source: 'Built-in',
    sourceUrl: '',
    category: 'Medical',
    thumbnail: '',
    html: '',
    fields: [
      { key: 'practiceName', label: 'Practice', value: 'Wellness Medical Group', type: 'text' },
      { key: 'doctorName', label: 'Provider', value: 'Dr. Sarah Johnson, MD', type: 'text' },
      { key: 'address', label: 'Address', value: '555 Health Way, Suite 200', type: 'text' },
      { key: 'phone', label: 'Phone', value: '(555) 234-5678', type: 'text' },
      { key: 'patientName', label: 'Patient', value: 'Jane Doe', type: 'text' },
      { key: 'visitDate', label: 'Visit Date', value: new Date().toLocaleDateString(), type: 'date' },
      { key: 'service1', label: 'Office Visit', value: 'Annual Physical', type: 'text' },
      { key: 'service1Cost', label: 'Visit Cost', value: '250.00', type: 'currency' },
      { key: 'service2', label: 'Lab Work', value: 'Blood Panel', type: 'text' },
      { key: 'service2Cost', label: 'Lab Cost', value: '150.00', type: 'currency' },
      { key: 'insuranceAdj', label: 'Insurance Adj.', value: '-320.00', type: 'currency' },
      { key: 'copay', label: 'Copay', value: '30.00', type: 'currency' },
      { key: 'amountDue', label: 'Amount Due', value: '50.00', type: 'currency' },
    ],
  },
  {
    id: 'grocery-receipt',
    name: 'Grocery Store Receipt',
    source: 'Built-in',
    sourceUrl: '',
    category: 'Grocery',
    thumbnail: '',
    html: '',
    fields: [
      { key: 'storeName', label: 'Store', value: 'FreshMart Grocery', type: 'text' },
      { key: 'storeNumber', label: 'Store #', value: '1042', type: 'text' },
      { key: 'address', label: 'Address', value: '890 Market St, Greenville', type: 'text' },
      { key: 'date', label: 'Date', value: new Date().toLocaleDateString(), type: 'date' },
      { key: 'item1', label: 'Item 1', value: 'Organic Milk 1gal', type: 'text' },
      { key: 'item1Price', label: 'Price', value: '5.99', type: 'currency' },
      { key: 'item2', label: 'Item 2', value: 'Whole Wheat Bread', type: 'text' },
      { key: 'item2Price', label: 'Price', value: '3.49', type: 'currency' },
      { key: 'item3', label: 'Item 3', value: 'Bananas 2lb', type: 'text' },
      { key: 'item3Price', label: 'Price', value: '1.98', type: 'currency' },
      { key: 'item4', label: 'Item 4', value: 'Chicken Breast 3lb', type: 'text' },
      { key: 'item4Price', label: 'Price', value: '12.99', type: 'currency' },
      { key: 'item5', label: 'Item 5', value: 'Avocados x3', type: 'text' },
      { key: 'item5Price', label: 'Price', value: '4.50', type: 'currency' },
      { key: 'subtotal', label: 'Subtotal', value: '28.95', type: 'currency' },
      { key: 'savings', label: 'Member Savings', value: '-3.50', type: 'currency' },
      { key: 'tax', label: 'Tax', value: '1.53', type: 'currency' },
      { key: 'total', label: 'Total', value: '26.98', type: 'currency' },
    ],
  },
];

function generateTemplateHtml(template: ReceiptTemplate): string {
  const fields = template.fields;
  const getField = (key: string) => fields.find(f => f.key === key)?.value ?? '';

  switch (template.id) {
    case 'retail-basic':
      return generateRetailHtml(fields, getField);
    case 'restaurant-receipt':
      return generateRestaurantHtml(fields, getField);
    case 'hotel-receipt':
      return generateHotelHtml(fields, getField);
    case 'gas-station':
      return generateGasStationHtml(fields, getField);
    case 'medical-receipt':
      return generateMedicalHtml(fields, getField);
    case 'grocery-receipt':
      return generateGroceryHtml(fields, getField);
    default:
      return generateGenericHtml(fields, template.name);
  }
}

function generateRetailHtml(fields: ReceiptField[], g: (k: string) => string): string {
  const items = fields.filter(f => f.key.match(/^item\d+Name$/));
  let itemRows = '';
  for (const item of items) {
    const num = item.key.replace('item', '').replace('Name', '');
    itemRows += `<tr><td>${g(`item${num}Name`)}</td><td class="text-right">$${g(`item${num}Price`)}</td></tr>\n`;
  }
  return `<div style="font-family: 'Courier New', monospace; max-width: 320px; margin: 0 auto; padding: 24px; background: white;">
  <div style="text-align: center; border-bottom: 2px dashed #333; padding-bottom: 12px; margin-bottom: 12px;">
    <h2 style="margin: 0; font-size: 20px; font-weight: bold;">${g('storeName')}</h2>
    <p style="margin: 4px 0; font-size: 12px;">${g('storeAddress')}</p>
    <p style="margin: 4px 0; font-size: 12px;">${g('storePhone')}</p>
  </div>
  <div style="font-size: 12px; margin-bottom: 12px;">
    <div style="display: flex; justify-content: space-between;"><span>${g('date')}</span><span>${g('time')}</span></div>
    <div>${g('cashier')}</div>
  </div>
  <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
    <tbody>
      ${itemRows}
    </tbody>
  </table>
  <div style="border-top: 1px dashed #333; margin-top: 8px; padding-top: 8px; font-size: 13px;">
    <div style="display: flex; justify-content: space-between;"><span>Subtotal</span><span>$${g('subtotal')}</span></div>
    <div style="display: flex; justify-content: space-between;"><span>${fields.find(f => f.key === 'tax')?.label ?? 'Tax'}</span><span>$${g('tax')}</span></div>
  </div>
  <div style="border-top: 2px solid #333; margin-top: 8px; padding-top: 8px; font-size: 16px; font-weight: bold; display: flex; justify-content: space-between;">
    <span>TOTAL</span><span>$${g('total')}</span>
  </div>
  <div style="margin-top: 12px; font-size: 12px; border-top: 1px dashed #333; padding-top: 8px;">
    <div>${g('paymentMethod')}</div>
  </div>
  <div style="text-align: center; margin-top: 16px; font-size: 11px; color: #666;">
    <p>Thank you for shopping with us!</p>
  </div>
</div>`;
}

function generateRestaurantHtml(fields: ReceiptField[], g: (k: string) => string): string {
  const items = fields.filter(f => f.key.match(/^item\d+$/) && !f.key.includes('Price'));
  let itemRows = '';
  for (const item of items) {
    const num = item.key.replace('item', '');
    itemRows += `<tr><td>${g(`item${num}`)}</td><td style="text-align: right;">$${g(`item${num}Price`)}</td></tr>\n`;
  }
  return `<div style="font-family: 'Georgia', serif; max-width: 340px; margin: 0 auto; padding: 24px; background: white;">
  <div style="text-align: center; border-bottom: 1px solid #333; padding-bottom: 12px; margin-bottom: 16px;">
    <h2 style="margin: 0; font-size: 22px; font-style: italic;">${g('restaurantName')}</h2>
    <p style="margin: 4px 0; font-size: 11px;">${g('address')}</p>
    <p style="margin: 4px 0; font-size: 11px;">${g('phone')}</p>
  </div>
  <div style="font-size: 12px; margin-bottom: 12px; display: flex; justify-content: space-between;">
    <span>Server: ${g('server')}</span><span>Table: ${g('table')}</span>
  </div>
  <div style="font-size: 12px; margin-bottom: 12px;">${g('date')}</div>
  <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
    ${itemRows}
  </table>
  <div style="border-top: 1px solid #333; margin-top: 10px; padding-top: 8px; font-size: 13px;">
    <div style="display: flex; justify-content: space-between;"><span>Subtotal</span><span>$${g('subtotal')}</span></div>
    <div style="display: flex; justify-content: space-between;"><span>Tax</span><span>$${g('tax')}</span></div>
  </div>
  <div style="border-top: 2px solid #333; margin-top: 8px; padding-top: 8px; font-size: 16px; font-weight: bold; display: flex; justify-content: space-between;">
    <span>Total</span><span>$${g('total')}</span>
  </div>
  <div style="margin-top: 12px; font-size: 12px; color: #666;">
    <div style="display: flex; justify-content: space-between;"><span>Suggested Tip (20%)</span><span>$${g('tipSuggestion')}</span></div>
  </div>
  <div style="text-align: center; margin-top: 20px; font-size: 11px; color: #888; font-style: italic;">
    <p>Thank you for dining with us!</p>
  </div>
</div>`;
}

function generateHotelHtml(fields: ReceiptField[], g: (k: string) => string): string {
  return `<div style="font-family: 'Helvetica', sans-serif; max-width: 380px; margin: 0 auto; padding: 28px; background: white; border: 1px solid #ddd;">
  <div style="text-align: center; border-bottom: 2px solid #1a1a2e; padding-bottom: 16px; margin-bottom: 16px;">
    <h2 style="margin: 0; font-size: 24px; color: #1a1a2e; letter-spacing: 2px;">${g('hotelName')}</h2>
    <p style="margin: 4px 0; font-size: 11px; color: #666;">${g('address')}</p>
    <p style="margin: 4px 0; font-size: 11px; color: #666;">${g('phone')}</p>
  </div>
  <div style="font-size: 13px; margin-bottom: 16px; background: #f9f9f9; padding: 12px; border-radius: 4px;">
    <div><strong>Guest:</strong> ${g('guestName')}</div>
    <div><strong>Room:</strong> ${g('roomNumber')} - ${g('roomType')}</div>
    <div><strong>Check-in:</strong> ${g('checkIn')} | <strong>Check-out:</strong> ${g('checkOut')}</div>
  </div>
  <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
    <tr><td>Room (${g('nights')} nights × $${g('nightlyRate')})</td><td style="text-align: right;">$${g('roomTotal')}</td></tr>
    <tr><td>Room Service</td><td style="text-align: right;">$${g('roomService')}</td></tr>
    <tr><td>Parking</td><td style="text-align: right;">$${g('parking')}</td></tr>
  </table>
  <div style="border-top: 1px solid #ddd; margin-top: 10px; padding-top: 8px; font-size: 13px;">
    <div style="display: flex; justify-content: space-between;"><span>${fields.find(f => f.key === 'tax')?.label ?? 'Tax'}</span><span>$${g('tax')}</span></div>
  </div>
  <div style="border-top: 2px solid #1a1a2e; margin-top: 8px; padding-top: 10px; font-size: 18px; font-weight: bold; display: flex; justify-content: space-between; color: #1a1a2e;">
    <span>Total</span><span>$${g('total')}</span>
  </div>
  <div style="text-align: center; margin-top: 20px; font-size: 11px; color: #999;">
    <p>We hope you enjoyed your stay!</p>
  </div>
</div>`;
}

function generateGasStationHtml(fields: ReceiptField[], g: (k: string) => string): string {
  return `<div style="font-family: 'Courier New', monospace; max-width: 300px; margin: 0 auto; padding: 20px; background: white;">
  <div style="text-align: center; margin-bottom: 12px;">
    <h2 style="margin: 0; font-size: 18px;">${g('stationName')}</h2>
    <p style="margin: 4px 0; font-size: 11px;">${g('address')}</p>
  </div>
  <div style="font-size: 11px; margin-bottom: 8px;">
    <div>${g('date')} ${g('time')}</div>
    <div>Pump #${g('pump')}</div>
  </div>
  <div style="border-top: 1px dashed #333; border-bottom: 1px dashed #333; padding: 8px 0; margin: 8px 0; font-size: 12px;">
    <div><strong>${g('fuelType')}</strong></div>
    <div style="display: flex; justify-content: space-between;"><span>${g('gallons')} GAL</span><span>@ $${g('pricePerGallon')}/gal</span></div>
    <div style="display: flex; justify-content: space-between; font-weight: bold;"><span>Fuel</span><span>$${g('fuelTotal')}</span></div>
  </div>
  <div style="font-size: 12px; margin-bottom: 8px;">
    <div style="display: flex; justify-content: space-between;"><span>Car Wash</span><span>$${g('carWash')}</span></div>
  </div>
  <div style="border-top: 2px solid #333; margin-top: 8px; padding-top: 8px; font-size: 15px; font-weight: bold; display: flex; justify-content: space-between;">
    <span>TOTAL</span><span>$${g('total')}</span>
  </div>
  <div style="margin-top: 8px; font-size: 11px;">${g('paymentMethod')}</div>
</div>`;
}

function generateMedicalHtml(fields: ReceiptField[], g: (k: string) => string): string {
  const services = fields.filter(f => f.key.match(/^service\d+$/) && !f.key.includes('Cost'));
  let serviceRows = '';
  for (const service of services) {
    const num = service.key.replace('service', '');
    serviceRows += `<tr><td>${g(`service${num}`)}</td><td style="text-align: right;">$${g(`service${num}Cost`)}</td></tr>\n`;
  }
  return `<div style="font-family: 'Arial', sans-serif; max-width: 380px; margin: 0 auto; padding: 24px; background: white; border: 1px solid #e0e0e0;">
  <div style="border-bottom: 2px solid #2563eb; padding-bottom: 12px; margin-bottom: 16px;">
    <h2 style="margin: 0; font-size: 20px; color: #2563eb;">${g('practiceName')}</h2>
    <p style="margin: 4px 0; font-size: 13px;">${g('doctorName')}</p>
    <p style="margin: 2px 0; font-size: 11px; color: #666;">${g('address')} | ${g('phone')}</p>
  </div>
  <div style="background: #f0f7ff; padding: 10px; border-radius: 4px; margin-bottom: 16px; font-size: 13px;">
    <div><strong>Patient:</strong> ${g('patientName')}</div>
    <div><strong>Visit Date:</strong> ${g('visitDate')}</div>
  </div>
  <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
    ${serviceRows}
  </table>
  <div style="border-top: 1px solid #ddd; margin-top: 10px; padding-top: 8px; font-size: 13px;">
    <div style="display: flex; justify-content: space-between; color: #16a34a;"><span>Insurance Adjustment</span><span>${g('insuranceAdj')}</span></div>
    <div style="display: flex; justify-content: space-between;"><span>Copay Paid</span><span>$${g('copay')}</span></div>
  </div>
  <div style="border-top: 2px solid #2563eb; margin-top: 8px; padding-top: 10px; font-size: 16px; font-weight: bold; display: flex; justify-content: space-between; color: #2563eb;">
    <span>Amount Due</span><span>$${g('amountDue')}</span>
  </div>
</div>`;
}

function generateGroceryHtml(fields: ReceiptField[], g: (k: string) => string): string {
  const items = fields.filter(f => f.key.match(/^item\d+$/) && !f.key.includes('Price'));
  let itemRows = '';
  for (const item of items) {
    const num = item.key.replace('item', '');
    itemRows += `<tr><td>${g(`item${num}`)}</td><td style="text-align: right;">$${g(`item${num}Price`)}</td></tr>\n`;
  }
  return `<div style="font-family: 'Courier New', monospace; max-width: 320px; margin: 0 auto; padding: 24px; background: white;">
  <div style="text-align: center; margin-bottom: 12px;">
    <h2 style="margin: 0; font-size: 18px;">${g('storeName')}</h2>
    <p style="margin: 2px 0; font-size: 11px;">Store #${g('storeNumber')}</p>
    <p style="margin: 2px 0; font-size: 11px;">${g('address')}</p>
  </div>
  <div style="font-size: 11px; margin-bottom: 8px;">${g('date')}</div>
  <table style="width: 100%; font-size: 12px; border-collapse: collapse;">
    ${itemRows}
  </table>
  <div style="border-top: 1px dashed #333; margin-top: 8px; padding-top: 8px; font-size: 12px;">
    <div style="display: flex; justify-content: space-between;"><span>Subtotal</span><span>$${g('subtotal')}</span></div>
    <div style="display: flex; justify-content: space-between; color: #16a34a;"><span>Member Savings</span><span>${g('savings')}</span></div>
    <div style="display: flex; justify-content: space-between;"><span>Tax</span><span>$${g('tax')}</span></div>
  </div>
  <div style="border-top: 2px solid #333; margin-top: 8px; padding-top: 8px; font-size: 15px; font-weight: bold; display: flex; justify-content: space-between;">
    <span>TOTAL</span><span>$${g('total')}</span>
  </div>
  <div style="text-align: center; margin-top: 16px; font-size: 10px; color: #888;">
    <p>*** MEMBER SAVINGS THIS VISIT: $${g('savings').replace('-', '')} ***</p>
  </div>
</div>`;
}

function generateGenericHtml(fields: ReceiptField[], name: string): string {
  let rows = '';
  for (const f of fields) {
    const prefix = f.type === 'currency' ? '$' : '';
    rows += `<tr><td style="padding: 4px 8px;">${f.label}</td><td style="padding: 4px 8px; text-align: right;">${prefix}${f.value}</td></tr>\n`;
  }
  return `<div style="font-family: monospace; max-width: 340px; margin: 0 auto; padding: 24px; background: white;">
  <h2 style="text-align: center; margin: 0 0 16px;">${name}</h2>
  <table style="width: 100%; font-size: 13px; border-collapse: collapse;">${rows}</table>
</div>`;
}

interface CrawlResult {
  url: string;
  title: string;
  description: string;
  templateSnippets: string[];
}

async function crawlReceiptSites(): Promise<CrawlResult[]> {
  const results: CrawlResult[] = [];
  const sitesToCrawl = [
    {
      url: 'https://www.vertex42.com/ExcelTemplates/receipt-template.html',
      name: 'Vertex42 Receipt Templates',
    },
    {
      url: 'https://www.invoicesimple.com/receipt-templates',
      name: 'Invoice Simple Receipt Templates',
    },
    {
      url: 'https://www.template.net/editable/receipts',
      name: 'Template.net Receipts',
    },
  ];

  for (const site of sitesToCrawl) {
    try {
      const response = await axios.get(site.url, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; ReceiptAI/1.0; +https://receiptai.app)',
        },
      });

      const $ = cheerio.load(response.data);
      const title = $('title').text().trim() || site.name;
      const description = $('meta[name="description"]').attr('content') || '';

      const snippets: string[] = [];
      $('h2, h3, .template-name, .card-title, [class*="template"]').each((_, el) => {
        const text = $(el).text().trim();
        if (text && text.length > 3 && text.length < 200) {
          snippets.push(text);
        }
      });

      results.push({
        url: site.url,
        title,
        description,
        templateSnippets: snippets.slice(0, 20),
      });
    } catch {
      results.push({
        url: site.url,
        title: site.name,
        description: 'Could not crawl (site may block automated requests)',
        templateSnippets: [],
      });
    }
  }
  return results;
}

export function getBuiltInTemplates(): ReceiptTemplate[] {
  return BUILT_IN_TEMPLATES.map(t => ({
    ...t,
    html: generateTemplateHtml(t),
  }));
}

export function getTemplateById(id: string): ReceiptTemplate | undefined {
  const template = BUILT_IN_TEMPLATES.find(t => t.id === id);
  if (!template) return undefined;
  return { ...template, html: generateTemplateHtml(template) };
}

export function renderTemplateHtml(template: ReceiptTemplate): string {
  return generateTemplateHtml(template);
}

export { crawlReceiptSites, type CrawlResult };
