import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const read=name=>readFileSync(new URL(name,import.meta.url),'utf8');
const touch=read('../src/TouchLayerCanvas.tsx');
const studio=read('../../estudio-control/src/SeamlessEditor.tsx');
const parse=source=>ts.createSourceFile('editor.tsx',source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
function find(source,predicate){
  let match;
  const visit=node=>{if(!match&&predicate(node))match=node;ts.forEachChild(node,visit)};
  visit(parse(source));assert.ok(match,'Required editor behavior exists');return match;
}
const compile=source=>ts.transpileModule(source,{compilerOptions:{
  target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.React
}}).outputText;
const initializer=(source,name)=>find(source,node=>ts.isVariableDeclaration(node)&&node.name.getText()===name).initializer.getText();

test('curved text shows the requested opacity once, including an uncommitted slider preview',()=>{
  const branch=find(touch,node=>ts.isConditionalExpression(node)&&node.whenTrue.getText().includes('<CurvedTextPreview')).whenTrue.getText();
  const component=find(read('../src/CurvedTextPreview.tsx'),node=>ts.isFunctionDeclaration(node)&&node.name?.text==='CurvedTextPreview');
  const definition=component.getText().replace('export default ','');
  const React={createElement:(type,props,...children)=>typeof type==='function'
    ?type({...props,children}):{type,props:{...props,children}}};
  for(const saved of [0,.25,.5,1])for(const preview of [0,.3,.5,1]){
    const context={React,useRef:()=>({current:null}),useEffect:()=>{},
      layer:{kind:'text',curve:50,opacity:saved,text:'Hello'},fw:600,fh:250,
      visibleOpacity:()=>preview};
    const tree=vm.runInNewContext(compile(definition+'\nconst output='+branch+';')+'\noutput;',context);
    const effectiveOpacity=node=>(node.props.style?.opacity??1)*
      (node.props.children.filter(Boolean).map(effectiveOpacity)[0]??1);
    assert.equal(effectiveOpacity(tree),preview,`saved ${saved}, slider ${preview}`);
  }
});

function studioHarness(){
  const initial={count:5,background:'#FAF8F3',backgroundImages:{},items:[{id:1,text:'Project A'}]};
  const h={past:[],future:[],current:JSON.stringify(initial),lastChange:0,ignore:false};
  const context=vm.createContext({doc:initial,history:{current:h},storageReady:true,JSON,
    setDoc:next=>{context.doc=next},setHistoryVersion:()=>{},setSelected:()=>{},setMessage:()=>{}});
  const tracking=find(studio,node=>ts.isCallExpression(node)&&node.expression.getText()==='useEffect'&&
    node.arguments[0]?.getText().includes('h.past.push')).arguments[0].getText();
  const bindings=['replaceProjectDocument','undoCanvas','redoCanvas']
    .map(name=>'const '+name+'='+initializer(studio,name)+';').join('\n');
  const actions=vm.runInContext(compile(bindings+'\nconst track='+tracking+';')+
    '\n({replaceProjectDocument,undoCanvas,redoCanvas,track});',context);
  return {context,actions,initial};
}

test('undo and redo stay within the opened project, preserving the new document baseline',()=>{
  const {context,actions}=studioHarness();
  context.doc={...context.doc,items:[{id:1,text:'Edited A'}]};actions.track();
  assert.equal(context.history.current.past.length,1);
  const b={...context.doc,items:[{id:2,text:'Project B'}]};
  actions.replaceProjectDocument(b);actions.track();
  actions.undoCanvas();assert.deepEqual(context.doc,b,'Opening B cannot undo to A');
  context.doc={...b,items:[{id:2,text:'Edited B'}]};actions.track();
  actions.undoCanvas();actions.track();
  assert.deepEqual(context.doc,b,'First B edit undoes to the saved B document');
  actions.redoCanvas();actions.track();
  assert.equal(context.doc.items[0].text,'Edited B');
  actions.replaceProjectDocument({...b,items:[]});actions.track();actions.undoCanvas();
  assert.equal(context.doc.items.length,0,'A new empty project cannot restore an earlier project');
});

test('opening, duplicating, creating, and preparing projects all start a separate history',()=>{
  assert.match(initializer(studio,'startNewProject'),/replaceProjectDocument\(/);
  assert.match(initializer(studio,'prepareEditorial'),/replaceProjectDocument\(/);
  const openHandlers=[];
  const visit=node=>{
    if(ts.isArrowFunction(node)&&node.body.getText().includes('JSON.parse(JSON.stringify(p.doc))'))openHandlers.push(node.body.getText());
    ts.forEachChild(node,visit);
  };
  visit(parse(studio));
  // The map callback also contains both event handlers; inspect the leaf handlers.
  const leafHandlers=openHandlers.filter(text=>!text.includes('projects.map')&&!text.includes('key={p.id}'));
  assert.equal(leafHandlers.length,3,'Existing project handlers and the mobile library opener each reset history');
  for(const handler of leafHandlers)assert.match(handler,/replaceProjectDocument\(JSON.parse\(JSON.stringify\(p.doc\)\)\)/);
  assert.doesNotMatch(initializer(studio,'saveProject'),/replaceProjectDocument\(/,'Saving the same project retains undo');
});

test('desktop canvas measures its mounted viewport after asynchronous draft recovery',()=>{
  const effect=find(studio,node=>ts.isCallExpression(node)&&node.expression.getText()==='useEffect'&&
    node.arguments[0]?.getText().includes('new ResizeObserver(measure)'));
  let measured,observed;
  const context=vm.createContext({wideScreen:true,storageReady:false,viewport:{current:null},
    setArtboardSpace:value=>{measured=value},ResizeObserver:class{
      constructor(callback){this.callback=callback}observe(node){observed=node}disconnect(){}
    }});
  const setup=vm.runInContext(compile('const setup='+effect.arguments[0].getText()+';')+'\nsetup;',context);
  const deps=()=>Array.from(vm.runInContext(effect.arguments[1].getText(),context));
  const before=deps();setup();assert.equal(observed,undefined);
  context.storageReady=true;context.viewport.current={clientWidth:602};
  const after=deps();
  if(after.some((value,i)=>value!==before[i]))setup();
  assert.equal(observed,context.viewport.current,'Recovery must attach the resize observer');
  assert.equal(measured,578,'Initial desktop width uses the actual available space');
});
