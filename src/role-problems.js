// Editorial titles describe the role's focus. Official titles remain in the API,
// accessible link names and role details; no external AI service is needed.
export function roleProblem(job) {
  const title=String(job.title||'');
  if (/evaluation|inspection/i.test(title)) return 'Help people trust the cars they buy';
  if (/key accounts?/i.test(title)) return 'Build lasting relationships with key accounts';
  // This opening sits in Sales, but its published work is dealer auctions.
  if (/^\s*builder\s*[-–—]\s*procurement associate\s*$/i.test(title)) return 'Help dealers buy through our auctions';
  const focus=String(job.department||'').trim();
  const statements={
    'home inspection':'Make every car inspection count',
    retail:'Help people find the right car',
    listing:'Make the right cars easier to discover',
    procurement:'Find the right cars at the right value',
    closure:'Help buyers complete a purchase',
    sales:'Help more people find their next car',
    finance:'Make the numbers work for the business',
    legal:'Help the business navigate legal complexity',
    technology:'Build technology that moves the business forward',
    engineering:'Build systems that solve real problems',
    operations:'Make everyday operations run better',
    marketing:'Connect more people with what we build',
    'human resources':'Help people do their best work',
  };
  return statements[focus.toLowerCase()] || (focus ? `Solve problems in ${focus}` : 'Solve the next challenge at Cars24');
}

// Card summaries paraphrase the published Darwinbox responsibilities reviewed
// on 15 November 2026. See docs/uat/2026-11-15/preproduction-copy.md for the
// seven source role IDs and the editorial boundary. Match complete titles:
// Procurement Associate (dealer auctions) and Procurement (technical review)
// must not inherit each other's work, nor a generic department description.
const roleSummaries = {
  'builder - evaluation engineer': 'Inspect cars at customer sites and document their condition, giving the team accurate findings to work from.',
  'builder - key accounts': 'Build dealer relationships in the field and turn partner leads into car-sourcing opportunities, helping grow the procurement network.',
  'builder - retail associate': 'Call prospective customers, follow up on leads and use negotiation to help turn interest into sales.',
  'builder - procurement associate': 'Engage dealers in car auctions, encourage competitive bids and build repeat transactions to grow activity on the platform.',
  'builder - listing': 'Help sellers list their cars and coordinate buyer conversations, making it easier to move from an enquiry to a completed transaction.',
  'builder - closure': 'Guide buyers through listed cars, answer questions and support negotiations so they can complete their purchase.',
  'builder - procurement': 'Review inspection reports, photos, videos and service records to spot risks and inconsistencies before procurement decisions are made.',
};

export function roleSummary(job) {
  const title = String(job?.title || '').trim().replace(/\s+/g, ' ').replace(/\s*[-–—]\s*/g, ' - ').toLowerCase();
  return roleSummaries[title] || 'Read the full role description to understand the responsibilities and requirements.';
}
