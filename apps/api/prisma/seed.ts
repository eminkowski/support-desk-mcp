import { PrismaClient, TicketPriority, TicketStatus } from '@prisma/client';

const prisma = new PrismaClient();

const agents = [
  { email: 'alex.support@example.com', name: 'Alex Rivera' },
  { email: 'jordan.help@example.com', name: 'Jordan Lee' },
  { email: 'sam.tickets@example.com', name: 'Sam Patel' },
];

const customers = [
  {
    name: 'Acme Logistics',
    email: 'ops@acme.example',
    company: 'Acme Logistics',
  },
  {
    name: 'Brightline Health',
    email: 'it@brightline.example',
    company: 'Brightline Health',
  },
  {
    name: 'Northwind Trading',
    email: 'support@northwind.example',
    company: 'Northwind Trading',
  },
  {
    name: 'Orbit Analytics',
    email: 'help@orbit.example',
    company: 'Orbit Analytics',
  },
];

const ticketTemplates = [
  {
    subject: 'Cannot reset portal password',
    description:
      'User reports password reset emails are not arriving. Last attempt was 30 minutes ago.',
    status: TicketStatus.OPEN,
    priority: TicketPriority.HIGH,
    customerIndex: 0,
    assigneeIndex: 0,
  },
  {
    subject: 'Billing export missing transactions',
    description:
      'February export is missing rows from Feb 12-14. Need reconciliation before month close.',
    status: TicketStatus.IN_PROGRESS,
    priority: TicketPriority.URGENT,
    customerIndex: 1,
    assigneeIndex: 1,
  },
  {
    subject: 'API rate limit questions',
    description: 'Customer wants guidance on burst limits for the production integration key.',
    status: TicketStatus.WAITING,
    priority: TicketPriority.MEDIUM,
    customerIndex: 2,
    assigneeIndex: 2,
  },
  {
    subject: 'Dashboard charts not loading',
    description: 'Analytics dashboard shows a spinner indefinitely in Chrome and Safari.',
    status: TicketStatus.OPEN,
    priority: TicketPriority.HIGH,
    customerIndex: 3,
    assigneeIndex: 0,
  },
  {
    subject: 'Request for SSO documentation',
    description: 'Need SAML setup guide and metadata exchange checklist for Okta.',
    status: TicketStatus.RESOLVED,
    priority: TicketPriority.LOW,
    customerIndex: 0,
    assigneeIndex: 1,
  },
  {
    subject: 'Duplicate invoice notifications',
    description: 'Customer receives two emails for each invoice event since Tuesday.',
    status: TicketStatus.OPEN,
    priority: TicketPriority.MEDIUM,
    customerIndex: 1,
    assigneeIndex: 2,
  },
];

async function main(): Promise<void> {
  await prisma.auditLog.deleteMany();
  await prisma.ticketComment.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.agent.deleteMany();

  const createdAgents = await Promise.all(
    agents.map((agent) => prisma.agent.create({ data: agent })),
  );

  const createdCustomers = await Promise.all(
    customers.map((customer) => prisma.customer.create({ data: customer })),
  );

  for (const template of ticketTemplates) {
    const ticket = await prisma.ticket.create({
      data: {
        subject: template.subject,
        description: template.description,
        status: template.status,
        priority: template.priority,
        customerId: createdCustomers[template.customerIndex].id,
        assigneeId: createdAgents[template.assigneeIndex].id,
      },
    });

    await prisma.ticketComment.create({
      data: {
        ticketId: ticket.id,
        body: 'Initial triage complete. Gathering logs from customer environment.',
        internal: true,
        authorId: createdAgents[template.assigneeIndex].id,
      },
    });
  }

  console.log(
    `Seeded ${createdAgents.length} agents, ${createdCustomers.length} customers, ${ticketTemplates.length} tickets`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
