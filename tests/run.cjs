// Deterministic checks with native APIs/auth mocked. Real device and live RLS
// checks are still required; this suite never calls LilyPad or Supabase.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const babel = require('@babel/core');
const React = require('react');
const Renderer = require('react-test-renderer');
const { act } = Renderer;
const root = path.resolve(__dirname, '..');
const plugins = [[require.resolve('@babel/plugin-transform-react-jsx'), { runtime: 'classic' }], require.resolve('@babel/plugin-transform-modules-commonjs')];
const native = {
  Platform: { OS: 'ios' }, StyleSheet: { create: x => x, absoluteFillObject: {} },
  AppState: { currentState: 'active', addEventListener: () => ({ remove() {} }) },
  BackHandler: { addEventListener: () => ({ remove() {} }) },
  Alert: { alert() {} }, Linking: { openURL: async () => {} },
};
for (const name of ['View','Text','TextInput','ScrollView','TouchableOpacity','Image','Modal','RefreshControl','ActivityIndicator','KeyboardAvoidingView']) native[name] = name;
function loader(overrides = {}) {
  const cache = {};
  function load(relative) {
    const file = path.resolve(root, relative);
    if (cache[file]) return cache[file].exports;
    const key = path.relative(root, file).split(path.sep).join('/');
    if (Object.hasOwn(overrides, key)) return overrides[key];
    const mod = { exports: {} }; cache[file] = mod;
    const requireMock = (id) => {
      if (Object.hasOwn(overrides, id)) return overrides[id];
      if (id === 'react') return React;
      if (id === 'react-native') return native;
      if (id.startsWith('.')) return load(path.relative(root, path.resolve(path.dirname(file), id + '.js')));
      throw new Error('Unmocked dependency: ' + id);
    };
    const code = babel.transformSync(fs.readFileSync(file, 'utf8'), { filename: file, babelrc: false, configFile: false, plugins }).code;
    vm.runInNewContext(code, { require: requireMock, module: mod, exports: mod.exports, console, Date, Math, Intl, setTimeout, clearTimeout, window: undefined });
    return mod.exports;
  }
  return load;
}
function parseAll(dir) {
  for (const name of fs.readdirSync(dir)) {
    const file = path.join(dir,name);
    if (fs.statSync(file).isDirectory()) parseAll(file);
    else if (name.endsWith('.js')) babel.transformSync(fs.readFileSync(file,'utf8'), { filename:file, babelrc:false, configFile:false, plugins });
  }
}
const flush = () => new Promise(resolve => setImmediate(resolve));
async function main() {
  parseAll(path.join(root,'src'));
  const time = loader()('src/services/visitTime.js');
  const now = Date.parse('2026-01-01T00:00:00Z');
  assert.equal(time.parseVisitTime('2026-07-10','15:00',now),'2026-07-10T22:00:00.000Z');
  assert.equal(time.parseVisitTime('2026-12-10','15:00',now),'2026-12-10T23:00:00.000Z');
  for (const [date, clock] of [['2026-02-30','10:00'],['2026-03-08','02:30'],['2026-11-01','01:30'],['2026-12-10','24:00']]) assert.throws(()=>time.parseVisitTime(date,clock,now));
  assert.throws(()=>time.validateVisit({kind:'Open Jump',date:'2026-01-02',time:'10:00',reminder_hours:48},now));
  assert.throws(()=>time.validateVisit({kind:'bad',date:'2026-12-10',time:'10:00',reminder_hours:0},now));
  console.log('PASS: date validation, California winter/summer offsets, DST gaps/ambiguity and expired reminders.');

  const secure = new Map(); let failChunk = false;
  const secureApi = {
    getItemAsync:async k=>secure.get(k)??null,
    setItemAsync:async(k,v)=>{if(failChunk && k.endsWith('.1'))throw Error('disk full');secure.set(k,v);},
    deleteItemAsync:async k=>{secure.delete(k);},
  };
  const storage = loader({'expo-secure-store':secureApi})('src/services/sessionStorage.js').sessionStorage;
  await storage.setItem('session', 'a'.repeat(5000));
  assert.equal(await storage.getItem('session'),'a'.repeat(5000));
  assert([...secure.values()].every(v=>v.length<=900));
  failChunk=true; await assert.rejects(storage.setItem('session','b'.repeat(5000)));
  assert.equal(await storage.getItem('session'),'a'.repeat(5000));
  failChunk=false; await storage.setItem('session','👑名'.repeat(1200));
  assert.equal(await storage.getItem('session'),'👑名'.repeat(1200));
  assert([...secure.values()].every(v=>Buffer.byteLength(v)<=900));
  await storage.setItem('session','new');
  assert.equal(await storage.getItem('session'),'new');
  await storage.removeItem('session'); assert.equal(secure.size,0);
  console.log('PASS: encrypted session chunk round-trip, failed-write rollback, replacement and deletion.');

  let scheduled = new Map(); let granted = true; let created=0;
  const notifications = {
    setNotificationHandler(){}, IosAuthorizationStatus:{PROVISIONAL:3}, AndroidImportance:{DEFAULT:3},
    getAllScheduledNotificationsAsync:async()=>[...scheduled.values()],
    getPermissionsAsync:async()=>({granted,canAskAgain:false}),
    requestPermissionsAsync:async()=>({granted}), setNotificationChannelAsync:async()=>{},
    scheduleNotificationAsync:async value=>{created++;scheduled.set(value.identifier,value);return value.identifier;},
    cancelScheduledNotificationAsync:async id=>{scheduled.delete(id);},
  };
  const reminder = loader({'expo-notifications':notifications})('src/services/reminders.js');
  const visit={id:'v1',kind:'Open Jump',starts_at:new Date(Date.now()+10*86400000).toISOString(),reminder_hours:48};
  let result=await reminder.syncReminders([visit],'A'); assert.equal(result.v1,'scheduled');
  await reminder.syncReminders([visit],'A'); assert.equal(created,1);
  await reminder.syncReminders([{...visit,reminder_hours:24}],'A'); assert.equal(scheduled.size,1); assert.equal(created,2);
  await reminder.clearOtherOwnerReminders('A');assert.equal(scheduled.size,1);
  await reminder.clearOtherOwnerReminders('B');assert.equal(scheduled.size,0);
  result=await reminder.syncReminders([visit],'B');assert.equal(result.v1,'scheduled');
  granted=false;result=await reminder.syncReminders([visit],'B');assert.equal(result.v1,'permission');assert.equal(scheduled.size,0);
  granted=true;await reminder.syncReminders([visit],'B');await reminder.syncReminders([],'B');assert.equal(scheduled.size,0);
  result=await reminder.syncReminders([{...visit,starts_at:new Date(Date.now()-1000).toISOString()}],'B');assert.equal(result.v1,'elapsed');
  console.log('PASS: reminder deduplication, rescheduling, deletion, account isolation, offline-start preservation and permission denial.');

  const guestStore = new Map(); let writeFailure=false; let ctx;
  const reminderCalls=[];
  const providerMocks={
    '@react-native-async-storage/async-storage':{getItem:async k=>guestStore.get(k)||null,setItem:async(k,v)=>{if(writeFailure)throw Error('storage full');guestStore.set(k,v);}},
    'src/services/accounts.js':{accounts:null,accountsConfigured:false},
    'src/services/reminders.js':{
      requestReminderPermission:async()=>true,
      clearOtherOwnerReminders:async()=>{},
      syncReminders:async(items,owner)=>{reminderCalls.push({items,owner});return Object.fromEntries(items.map(v=>[v.id,v.reminder_hours?'scheduled':'off']));},
    },
  };
  let data=loader(providerMocks)('src/state/AppData.js');
  function Probe(){ctx=data.useAppData();return null;}
  let tree;
  await act(async()=>{tree=Renderer.create(React.createElement(data.AppDataProvider,null,React.createElement(Probe)));await flush();});
  assert.equal(ctx.loading,false);
  await act(async()=>{await ctx.saveVisit({...visit,reference:''});});
  assert.equal(ctx.visits.length,1);
  const guestId=ctx.visits[0].id;
  writeFailure=true;
  await act(async()=>{await assert.rejects(ctx.saveVisit({...visit,reference:''}),/storage full/);});
  assert.equal(ctx.visits.length,1);writeFailure=false;
  await act(async()=>{await ctx.saveVisit({...visit,reminder_hours:24,reference:''},guestId);});
  assert.equal(ctx.visits[0].reminder_hours,24);
  await act(async()=>{await ctx.removeVisit(guestId);});assert.equal(ctx.visits.length,0);
  await act(async()=>{await ctx.saveVisit({...visit,reference:''});});
  await act(async()=>tree.unmount());
  await act(async()=>{tree=Renderer.create(React.createElement(data.AppDataProvider,null,React.createElement(Probe)));await flush();});
  assert.equal(ctx.visits.length,1);
  await act(async()=>tree.unmount());
  console.log('PASS: guest create/edit/delete/reload and failed persistence does not report a saved visit.');

  let listener; let remoteError=false; let rpcError=false; let currentUser=null;
  const rows={A:[{...visit,id:'a',user_id:'A'}],B:[{...visit,id:'b',user_id:'B'}]};
  const client={
    auth:{
      onAuthStateChange:fn=>{listener=fn;return {data:{subscription:{unsubscribe(){}}}};},
      getSession:async()=>({data:{session:null}}),startAutoRefresh(){},stopAutoRefresh(){},
      signOut:async()=>{currentUser=null;listener('SIGNED_OUT',null);return {error:null};},
    },
    from:()=>({select:()=>({eq:(_k,id)=>({order:async()=>({data:rows[id]||[],error:remoteError?{message:'offline'}:null})})})}),
    rpc:async()=>({error:rpcError?{message:'deletion failed'}:null}),
  };
  const cloudMocks={...providerMocks,'src/services/accounts.js':{accounts:client,accountsConfigured:true}};
  data=loader(cloudMocks)('src/state/AppData.js');
  await act(async()=>{tree=Renderer.create(React.createElement(data.AppDataProvider,null,React.createElement(Probe)));await flush();});
  assert.equal(ctx.owner,'guest');assert.equal(ctx.visits.length,1);
  await act(async()=>{currentUser='A';listener('SIGNED_IN',{user:{id:'A'}});await flush();});
  assert.equal(ctx.visits[0].id,'a');
  await act(async()=>{currentUser='B';listener('SIGNED_IN',{user:{id:'B'}});await flush();});
  assert.equal(ctx.visits[0].id,'b'); assert(!ctx.visits.some(v=>v.id==='a'));
  remoteError=true;await act(async()=>{await ctx.refresh();});assert.equal(ctx.error,'offline');
  await act(async()=>{await assert.rejects(ctx.saveVisit({...visit,reference:''}),/Refresh/);});
  remoteError=false;await act(async()=>{await ctx.refresh();});
  rpcError=true;await act(async()=>{await assert.rejects(ctx.deleteAccount(),/./);});assert.equal(ctx.user.id,'B');
  rpcError=false;await act(async()=>{await ctx.deleteAccount();await flush();});assert.equal(ctx.user,null);assert.equal(ctx.visits.length,1);
  await act(async()=>tree.unmount());
  console.log('PASS: switching accounts hides other users, guest data remains separate, offline/error writes are blocked and failed deletion keeps the session.');

  let codeSent=0,verified=0; let verifyError=true;
  const accountClient={auth:{
    signInWithOtp:async({email,options})=>{assert.equal(email,'tester@example.com');assert.equal(options.shouldCreateUser,true);codeSent++;return {error:null};},
    verifyOtp:async()=>{verified++;return verifyError?{data:{},error:{message:'Invalid code'}}:{data:{session:{user:{id:'A'}}},error:null};},
  }};
  const accountData={user:null,authReady:true,authError:'',accountsConfigured:true,saving:false};
  const Account=loader({'src/state/AppData.js':{useAppData:()=>accountData},'src/services/accounts.js':{accounts:accountClient}})('src/screens/AccountScreen.js').default;
  await act(async()=>{tree=Renderer.create(React.createElement(Account,{navigation:{navigate(){}}}));});
  const input=label=>tree.root.findAllByType('TextInput').find(n=>n.props.accessibilityLabel===label);
  const button=label=>tree.root.findAllByType('TouchableOpacity').find(n=>n.findAllByType('Text').some(t=>t.props.children===label));
  await act(async()=>input('Email address').props.onChangeText(' Tester@Example.com '));
  await act(async()=>{await button('Email me a code').props.onPress();});assert.equal(codeSent,1);
  await act(async()=>input('Email verification code').props.onChangeText('123456'));
  await act(async()=>{await button('Verify & continue').props.onPress();});assert.equal(verified,1);assert(JSON.stringify(tree.toJSON()).includes('Invalid code'));
  assert(!JSON.stringify(tree.toJSON()).includes('Your profile has been saved'));
  verifyError=false;await act(async()=>{await button('Verify & continue').props.onPress();});assert.equal(verified,2);
  await act(async()=>tree.unmount());
  console.log('PASS: real OTP request/verification calls, normalized email and wrong-code handling (mocked backend).');

  const shellCode=fs.readFileSync(path.join(root,'src/components/LilyPadWebView.js'),'utf8');
  assert(!shellCode.includes('styles.host'));assert(shellCode.includes('Open in browser'));assert(shellCode.includes('Close form'));
  assert(!shellCode.includes('successPatterns'));
  const sql=fs.readFileSync(path.join(root,'supabase/setup.sql'),'utf8');
  assert(sql.includes('enable row level security'));assert(sql.includes('on delete cascade'));
  assert(sql.includes("security definer set search_path = ''"));assert(sql.includes('where id = auth.uid()'));
  console.log('PASS: host line removed, fallback retained, SQL ownership/deletion guards present (live RLS still requires integration testing).');
}
main().catch(error=>{console.error(error);process.exitCode=1;});
