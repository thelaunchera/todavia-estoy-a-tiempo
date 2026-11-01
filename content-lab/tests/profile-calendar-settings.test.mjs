import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../src/'+p,import.meta.url),'utf8');

test('Settings keeps device install help short and profile photos private and persistent',()=>{
 const settings=read('AccountSettings.tsx'),app=read('App.tsx'),api=read('platform/client.ts');
 assert.ok(app.includes("id: 'settings', title: 'Ajustes'"));
 assert.ok(settings.includes('Mi foto de perfil'));
 assert.ok(settings.includes('iPhone / iPad'));
 assert.ok(settings.includes('Android / tablets'));
 assert.ok(settings.includes('<details>'));
 assert.ok(settings.includes('onUpload(picture)'));
 assert.ok(app.includes("upload(file,'original',false)"));
 assert.ok(app.includes('auth.setProfilePhotoAssetId(picture.id)'));
 assert.ok(api.includes('content_lab_avatar_asset_id'));
 assert.ok(api.includes('sb.auth.updateUser({data:{content_lab_avatar_asset_id:id}})'));
});

test('All editors can save finished design with a chosen date and hour into calendar',()=>{
 const app=read('App.tsx'),action=read('ScheduleFromEditor.tsx');
 assert.ok(app.includes("['factory','vertical','create'].includes(tab)"));
 assert.ok(app.includes('<ScheduleFromEditor'));
 assert.ok(action.includes('type="date"'));
 assert.ok(action.includes('type="time"'));
 assert.ok(app.includes("save({...latest,date,time,planningStatus:'planned'})"));
 assert.ok(app.includes("if(ok){toast('Guardado en el calendario."));
});

test('Month view visibly distinguishes reel cover from video editing',()=>{
 const calendar=read('ContentCalendar.tsx'),model=read('CalendarPlannerModel.ts');
 const app=read('App.tsx'),vertical=read('VerticalStudio.tsx');
 assert.ok(model.includes("return 'reel-cover'"));
 assert.ok(model.includes("reel-cover:'Portada reel'"));
 assert.ok(calendar.includes('contentKindShort(p.format)'));
 assert.ok(calendar.includes('contentKindLabel(p.format,locale)'));
 assert.ok(calendar.includes('lab-calendar-format-legend'));
 assert.ok(app.includes('Portadas de reels e historias'));
 assert.ok(vertical.includes('No es un editor de video.'));
});
