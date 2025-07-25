// Simple test script to add sample notifications
// Run this with: node test-notifications.js

const sampleNotifications = [
  {
    title: "Welcome to ConstructPro!",
    message: "Thank you for using our construction management system. We're here to help you manage your projects efficiently.",
    type: "info",
    status: "unread"
  },
  {
    title: "New Site Created",
    message: "Construction site 'Downtown Plaza' has been successfully created and is now ready for management.",
    type: "success",
    status: "unread",
    relatedEntityType: "site",
    relatedEntityId: 1
  },
  {
    title: "Invoice Payment Due",
    message: "Invoice #INV-001 for Downtown Plaza project is due for payment. Please review and process the payment.",
    type: "warning",
    status: "unread",
    relatedEntityType: "invoice",
    relatedEntityId: 1
  },
  {
    title: "Labour Attendance Updated",
    message: "Daily attendance has been recorded for 15 workers at Downtown Plaza site.",
    type: "info",
    status: "read"
  },
  {
    title: "Material Purchase Completed",
    message: "Purchase order for cement and steel has been completed. Materials will be delivered tomorrow.",
    type: "success",
    status: "unread",
    relatedEntityType: "purchase",
    relatedEntityId: 1
  }
];

console.log("Sample notifications data:");
console.log(JSON.stringify(sampleNotifications, null, 2));
console.log("\nTo add these notifications, use the 'Create Test Notification' button in the notifications page!"); 