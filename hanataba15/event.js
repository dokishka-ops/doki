const statusPanel = document.getElementById('status');
const title = document.getElementById('status-title');
const copy = document.getElementById('status-copy');
const retry = document.getElementById('retry');
const reader = document.getElementById('reader');
const pages = document.getElementById('pages');
let closeTimer;
let remainingMs = 0;
let receivedAt = 0;
let busy = false;
function message(heading, text) {
  reader.hidden = true;
  pages.replaceChildren();
  statusPanel.hidden = false;
  title.textContent = heading;
  copy.textContent = text;
}
async function refresh() {
  if (busy) return;
  busy = true;
  try {
    const response = await fetch('/api/event-comic', { cache: 'no-store' });
    if (!response.ok) throw new Error('status unavailable');
    const data = await response.json();
    retry.hidden = true;
    clearTimeout(closeTimer);
    if (data.state === 'before') {
      message('公開まで、もう少し', '10月4日（日）22:10からお読みいただけます。どうぞ楽しみにお待ちください♡');
    } else if (data.state === 'after') {
      message('公開は終了しました', '遊びにきてくださって、ありがとうございました♡');
    } else if (!data.ready) {
      message('ただいま準備中です', '漫画の公開準備を進めています。少し時間をおいて、またお越しください。');
    } else {
      if (reader.hidden) {
        const fragment = document.createDocumentFragment();
        data.pages.forEach((page, i) => {
          const figure = document.createElement('figure');
          figure.className = 'comic-page';
          const image = document.createElement('img');
          image.src = `/api/event-comic?page=${page.number}`;
          image.alt = `漫画 ${page.number}ページ目`;
          image.loading = i === 0 ? 'eager' : 'lazy';
          image.decoding = 'async';
          if (page.width && page.height) { image.width = page.width; image.height = page.height; }
          image.addEventListener('error', () => { retry.hidden = false; copy.textContent = '漫画を読み込めませんでした。時間をおいて再度お試しください。'; statusPanel.hidden = false; });
          const caption = document.createElement('figcaption');
          caption.textContent = `${page.number} / ${data.pages.length}`;
          figure.append(image, caption);
          fragment.append(figure);
        });
        pages.replaceChildren(fragment);
        document.getElementById('page-count').textContent = `${data.pages.length} PAGES`;
      }
      reader.hidden = false;
      statusPanel.hidden = true;
      remainingMs = data.remainingMs;
      receivedAt = performance.now();
      closeTimer = setTimeout(() => message('公開は終了しました', '遊びにきてくださって、ありがとうございました♡'), remainingMs);
    }
  } catch {
    message('公開状況を確認できませんでした', '通信環境をご確認のうえ、もう一度お試しください。');
    retry.hidden = false;
  } finally { busy = false; }
}
retry.addEventListener('click', () => { reader.hidden = true; refresh(); });
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    if (remainingMs && performance.now() - receivedAt >= remainingMs) message('公開は終了しました', '遊びにきてくださって、ありがとうございました♡');
    refresh();
  }
});
setInterval(refresh, 60000);
refresh();
