const translations = {
  ja: {
    displayName: "丑満 どき",
    reading: "うしみつ どき",
    avatarBubble: "2026年7月の一挙配信からYOI沼～！",
    lead: "ヴィク勇左右ガチ固定の民💜💙<br>スパダリでゆうりくん一筋なヴィクトルと、ヴィクトル大好きで無自覚に色気を振りまくかわいい勇利くんという傾向で絵とか漫画とかいろいろ描いてます🥰",
    contactNote: "♥Xやpixivへのメッセージ、いつもうれしく拝見してます！基本的に全レスしているんですが、まれに見逃しちゃうこともあるので、その時はどうぞお許しくださいませ…🙏<span class=\"note-rule\" aria-hidden=\"true\"></span>♥イラスト・漫画のリクエストは、制作のプレッシャーになってしまうためお引き受けしておりません。ごめんなさい。<span class=\"note-rule\" aria-hidden=\"true\"></span>♥その他、なにかご用がありましたらXのDMまでどうぞ。",
    aboutLabel: "ABOUT ME",
    bio: "",
    linkTitle: "X / @dokishka",
    linkDescription: "日々の絵とつぶやきはこちら",
    pixivTitle: "pixiv",
    pixivDescription: "X絵のまとめ",
    poipikuTitle: "ぽいぴく",
    poipikuDescription: "すけべなやつ",
    lastUpdated: "LAST UPDATED / 2026.09.11"
  },
  en: {
    displayName: "Ushimitsu Doki",
    reading: "",
    avatarBubble: "I fell into Yuri!!! on ICE after the July 2026 marathon stream!",
    lead: "Viktuuri only — fixed top/bottom! 💙💜<br>I mostly draw devoted, perfect-boyfriend Viktor × cute Yuuri who adores Viktor and is effortlessly sexy without even realizing it. Basically, lots and lots of my favorite kind of Viktuuri 🥰",
    contactNote: "♥I can read English, but I use a translator when replying. Feel free to comment in any language! I love connecting with people from around the world 💕<span class=\"note-rule\" aria-hidden=\"true\"></span>♥ I love replying to pretty much everything on X, but sometimes I miss a comment by accident—sorry if that happens!<span class=\"note-rule\" aria-hidden=\"true\"></span>♥ If you need to reach me for anything else, feel free to DM me on X.",
    aboutLabel: "ABOUT ME",
    bio: "",
    linkTitle: "X / @dokishka",
    linkDescription: "Daily art and thoughts",
    pixivTitle: "pixiv",
    pixivDescription: "A collection of my X art",
    poipikuTitle: "poipiku",
    poipikuDescription: "NSFW works",
    lastUpdated: "LAST UPDATED / 2026.09.14"
  }
};

const buttons = document.querySelectorAll("[data-lang]");
const localizedNodes = document.querySelectorAll("[data-i18n]");

function setLanguage(language) {
  localizedNodes.forEach((node) => {
    const copy = translations[language][node.dataset.i18n];
    if (copy !== undefined) node.innerHTML = copy;
  });
  document.documentElement.lang = language;
  document.title = language === "ja" ? "丑満 どき" : "USHIMITSU DOKI";
  buttons.forEach((button) => {
    const active = button.dataset.lang === language;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });
}

buttons.forEach((button) => {
  button.addEventListener("click", () => setLanguage(button.dataset.lang));
});
