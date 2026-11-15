// Decorative subjects follow the reviewed work, not the department alone.
// In particular, dealer auctions and inspection-record review are separate jobs.
const subjects={
  'builder - evaluation engineer':'inspection',
  'builder - key accounts':'dealer-network',
  'builder - retail associate':'customer-calls',
  'builder - procurement associate':'dealer-auctions',
  'builder - listing':'car-listing',
  'builder - closure':'purchase-completion',
  'builder - procurement':'inspection-review',
};

export function roleSticker(job) {
  const title=String(job?.title||'').trim().replace(/\s+/g,' ').replace(/\s*[-–—]\s*/g,' - ').toLowerCase();
  return `/img/stickers/roles/${Object.hasOwn(subjects,title)?subjects[title]:'work'}.svg`;
}
