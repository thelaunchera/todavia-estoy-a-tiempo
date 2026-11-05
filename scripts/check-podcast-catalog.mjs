/* Public podcast publication contract: do not truncate or replace past episodes. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
const read = file => readFileSync(new URL('../'+file, import.meta.url),'utf8');
const sandbox={window:{}};
runInNewContext(read('podcast-catalog.js'),sandbox);
const catalog=sandbox.window.PODCAST_EPISODES;
assert(Array.isArray(catalog) && catalog.length>=3,'Fallback includes all confirmed launch episodes');
assert.equal(new Set(catalog.map(e=>e.number)).size,catalog.length,'Episode numbers must be unique');
const urls=new Set(),images=new Set();
for(const episode of catalog){
 assert(episode.published===true,'Only confirmed public episodes belong in catalog');
 assert(Number.isInteger(episode.number)&&episode.number>0,'Episode number is positive integer');
 assert(/^\d{4}-\d{2}-\d{2}$/.test(episode.date),'Date must be ISO local');
 assert(/^https:\/\/open\.spotify\.com\/episode\/[A-Za-z0-9]+/.test(episode.url),'Use individual Spotify link, not show page');
 assert(!urls.has(episode.url),'Never duplicate a published link');
 urls.add(episode.url);
 assert(episode.art && episode.popupImage && !images.has(episode.popupImage),'Every popup needs its own different artwork');
 images.add(episode.popupImage);
 for(const key of ['title','titleEn','summary','summaryEn','popupHeadline','popupHeadlineEn','popupMessage','popupMessageEn']){
  assert(typeof episode[key]==='string'&&episode[key].trim().length>0,key+' must be authored');
 }
}
const archive=read('podcast-archive.js');
const popup=read('podcast-episode-03-announcement-20261103.js');
const config=read('site-config.js');
assert(archive.includes('published.slice(1)'),'Latest is separate, every earlier episode remains in archive');
assert(!archive.includes('published.slice(0,3)'),'Never limit visible archive to three episodes');
assert(archive.includes('PODCAST_EPISODE_FEED_READY'),'Read newly published episodes from secure public feed');
assert(archive.includes('const catalog = new Map(fallback.map'),'Merge live entries without deleting the static originals');
assert(archive.includes('publicaciones reales')||archive.includes('publicaciones'),'Publications only');
assert(config.includes('publishedEpisodesEndpoint'),'The public RLS feed must be configured');
assert(popup.includes('PODCAST_PUBLISHED_EPISODES'),'Popup always reads the latest confirmed episode');
for(const field of ['popupImage','popupHeadline','popupMessage','days >= 7'])assert(popup.includes(field),'Popup must use '+field);
for(const file of ['index.html','index-en.html']){
 const page=read(file);
 for(const value of ['podcast-catalog.js','podcast-archive.js','podcast-archive.css?v=','podcast-episode-03-announcement-20261103.js?v=20261105-dynamic'])
  assert(page.includes(value),file+' includes '+value);
 assert(page.indexOf('podcast-catalog.js')<page.indexOf('episodios-destacados.js') &&
        page.indexOf('episodios-destacados.js')<page.indexOf('podcast-archive.js'),'Scripts load in the correct order');
}
console.log('PASS: every published episode retained, unique art, dynamic weekly popup, public RLS feed ES/EN');
