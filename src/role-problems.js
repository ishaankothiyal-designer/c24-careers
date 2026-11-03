// Editorial titles describe the role's focus. Official titles remain in the API,
// accessible link names and role details; no external AI service is needed.
export function roleProblem(job) {
  const title=String(job.title||'');
  if (/evaluation|inspection/i.test(title)) return 'Help people trust the cars they buy';
  if (/key accounts?/i.test(title)) return 'Build lasting relationships with key accounts';
  const focus=String(job.department||'').trim();
  const statements={
    'home inspection':'Make every car inspection count',
    retail:'Help people find the right car',
    listing:'Make the right cars easier to discover',
    procurement:'Find the right cars at the right value',
    closure:'Turn customer decisions into completed purchases',
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
