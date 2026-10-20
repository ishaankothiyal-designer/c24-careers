import stories from './builder-stories.json';

const escape = value => String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));

export function builderDetailPage(pathname, header, footer) {
  const match = pathname.match(/^\/builders\/([^/]+)\/?$/);
  if (!match) return null;
  const story = stories.find(item => item.slug === match[1]);
  if (!story) return {title:'Builder story not found',html:`${header}<main class="builder-detail"><section class="cs-hero"><div class="container"><h1>Builder story not found.</h1><a href="/#builders">Back to our builders</a></div></section></main>${footer}`};
  const next = stories[(stories.indexOf(story) + 1) % stories.length];
  const cards = (items, kind) => items.map(([title, text]) => `<article class="${kind}-card"><div class="${kind}-card__top"><h3 class="${kind}-card__heading">${escape(title)}</h3></div><p class="${kind}-card__text">${escape(text)}</p></article>`).join('');
  return { title:`${story.name} — ${story.facts[0]} | Cars24 Careers`, html:`${header}
    <main class="builder-detail" id="builder-story">
      <section class="cs-hero" aria-labelledby="story-title"><div class="container cs-hero__grid">
        <div class="cs-hero__lead"><div class="builder-story-byline"><p>${escape(story.name)}</p><div class="craft-experiments__tags"><span class="craft-tag--claude">Person</span><span class="craft-tag--framer">${escape(story.team)}</span></div></div>
          <h1 class="cs-hero__title" id="story-title" data-no-roll>${escape(story.title)}</h1>
        </div>${story.productAsset ? `<figure class="cs-hero__media cs-hero__media--product"><img class="case-visual" src="${escape(story.productAsset)}" alt="${escape(story.productAlt)}" width="${story.productWidth}" height="${story.productHeight}" decoding="async" fetchpriority="high"></figure>` : `<div class="cs-hero__media cs-hero__media--placeholder" role="img" aria-label="Project image placeholder for ${escape(story.name)}"><span aria-hidden="true">Project image placeholder</span></div>`}
      </div>${story.stats?.length ? `<div class="container"><dl class="cs-stats" aria-label="${escape(story.statsAsOf || 'Project results')}">${story.stats.map(stat=>`<div><dt>${escape(stat.label)}</dt><dd>${escape(stat.value)}</dd></div>`).join('')}</dl></div>` : ''}</section>
      <section class="challenge"><div class="container challenge__grid"><div><span class="label">The challenge</span><h2 class="challenge__title">${escape(story.challengeTitle)}</h2></div><div class="challenge__text">${(Array.isArray(story.challenge) ? story.challenge : [story.challenge]).map(text=>`<p>${escape(text)}</p>`).join('')}</div></div></section>
      <section class="solution section"><div class="container solution__grid"><div class="solution__lead"><span class="label">The work</span><h2 class="solution__title">What ${escape(story.name.split(' ')[0])} built.</h2></div><div class="solution__cards">${cards(story.solutions,'sol')}</div></div></section>
      <section class="outcome"><div class="container"><div class="outcome__head"><span class="label label--on-dark">The outcome</span><h2 class="outcome__title">${escape(story.outcomeTitle)}</h2></div><div class="outcome__grid">${cards(story.outcomes,'out')}</div><nav class="builder-story-next" aria-label="Builder stories"><a href="/#builders">All builders</a><a href="/builders/${escape(next.slug)}/">Next builder: ${escape(next.name)}</a></nav></div></section>
    </main>${footer}`};
}
