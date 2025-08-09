import{_ as F,u as Q,r as f,s as J,n as p,E as u,w as Y,k as q,b as j,o as c,c as o,d as r,C as D,h as _,t as g,j as x,F as $,J as A,e as b,f as C,T as Z,i as G,g as W,S as h}from"./index-06309a7e.js";import{i as X,a as ee,g as se,c as te}from"./parkingLayoutInfo-f557e7fa.js";import{a as ae,g as ie}from"./parking-f1dd034f.js";import"./cacheManager-5937ebc8.js";const le={class:"parking-assistant"},ne={class:"chat-info"},ce={class:"message-count"},oe={key:0,class:"history-status"},de={class:"quick-actions"},re={key:0},ve={key:1},ue=["innerHTML"],pe={key:0},me={key:1},fe={class:"image-message"},he=["src","alt"],ye={key:0,class:"image-caption"},_e={key:2,class:"error-msg"},ge={key:"loading",class:"message-bubble assistant loading"},be={class:"input-controller"},H="chat_history",ke=`
<div class="fee-table-container">
  <h3>💰 停车场收费标准</h3>
  <div class="fee-table">
    <div class="fee-header">
      <div class="fee-cell header">车辆类型</div>
      <div class="fee-cell header">路内停车场</div>
      <div class="fee-cell header">路外地面停车场</div>
      <div class="fee-cell header">地下停车场</div>
    </div>
    
    <div class="fee-row">
      <div class="fee-cell type">小型车</div>
      <div class="fee-cell">
        <div class="fee-item">首30分钟免费</div>
        <div class="fee-item">白天(8:00-20:00)：首小时3元，后每半小时1元</div>
        <div class="fee-item">夜间(20:00-8:00)：每小时1元，夜间最高5元</div>
        <div class="fee-item">24小时最高15元</div>
        <div class="fee-item highlight">包月200元/辆</div>
      </div>
      <div class="fee-cell">
        <div class="fee-item">首1小时免费</div>
        <div class="fee-item">4小时内5元，4-8小时10元，24小时15元</div>
        <div class="fee-item highlight">包月180元/辆</div>
      </div>
      <div class="fee-cell">
        <div class="fee-item">首2小时免费</div>
        <div class="fee-item">4小时内4元，4-8小时8元，24小时12元</div>
        <div class="fee-item highlight">包月150元/辆</div>
      </div>
    </div>
    
    <div class="fee-row">
      <div class="fee-cell type">大型车</div>
      <div class="fee-cell">
        <div class="fee-item">首30分钟免费</div>
        <div class="fee-item">白天(8:00-20:00)：首小时4元，后每半小时2元</div>
        <div class="fee-item">夜间(20:00-8:00)：每小时2元，夜间最高8元</div>
        <div class="fee-item">24小时最高25元</div>
        <div class="fee-item highlight">包月300元/辆</div>
      </div>
      <div class="fee-cell">
        <div class="fee-item">首1小时免费</div>
        <div class="fee-item">4小时内7元，4-8小时14元，24小时20元</div>
        <div class="fee-item highlight">包月250元/辆</div>
      </div>
      <div class="fee-cell">
        <div class="fee-item">首2小时免费</div>
        <div class="fee-item">4小时内6元，4-8小时12元，24小时18元</div>
        <div class="fee-item highlight">包月220元/辆</div>
      </div>
    </div>
    
    <div class="fee-row">
      <div class="fee-cell type">新能源汽车</div>
      <div class="fee-cell">
        <div class="fee-item">当日首次2小时内免费(含充电)</div>
        <div class="fee-item">白天首小时2元，后每半小时1元</div>
        <div class="fee-item">夜间每小时1元</div>
        <div class="fee-item">24小时最高12元</div>
        <div class="fee-item highlight">包月150元/辆</div>
      </div>
      <div class="fee-cell">
        <div class="fee-item">首2小时免费</div>
        <div class="fee-item">4小时内4元，4-8小时8元，24小时12元</div>
        <div class="fee-item highlight">包月120元/辆</div>
      </div>
      <div class="fee-cell">
        <div class="fee-item">首2小时免费</div>
        <div class="fee-item">4小时内3元，4-8小时6元，24小时10元</div>
        <div class="fee-item highlight">包月100元/辆</div>
      </div>
    </div>
  </div>
</div>`,we={__name:"Chat",setup(xe){const k=Q(),v=f(!0),d=f(""),y=f(!1),l=f([{role:"assistant",type:"text",content:`<div class="welcome-message">
      <h3>👋 您好！我是智慧停车助手</h3>
      <p>我可以为您提供以下服务：</p>
      <div class="service-list">
        <div class="service-item">
          <span class="service-icon">🅿️</span>
          <span>实时查询车位状态</span>
        </div>
        <div class="service-item">
          <span class="service-icon">⏰</span>
          <span>预约停车位</span>
        </div>
        <div class="service-item">
          <span class="service-icon">🗺️</span>
          <span>导航至空闲车位</span>
        </div>
        <div class="service-item">
          <span class="service-icon">📊</span>
          <span>查看实时停车场数据</span>
        </div>
      </div>
      <p class="help-text">请问需要什么帮助？</p>
    </div>`}]),n=f(null),w=f(null),z=f(!1);function E(){try{const s=p();if(s){const e=`${H}_${s}`;localStorage.setItem(e,JSON.stringify(l.value))}}catch(s){console.error("保存聊天记录失败:",s)}}function M(){try{const s=p();if(s){const e=`${H}_${s}`,t=localStorage.getItem(e);if(t){const a=JSON.parse(t);return a.length>50&&a.splice(0,a.length-50),l.value=a,z.value=!0,!0}}}catch(s){console.error("加载聊天记录失败:",s)}return z.value=!1,!1}function T(){try{const s=p();if(s){const e=`${H}_${s}`;localStorage.removeItem(e)}l.value=[{role:"assistant",type:"text",content:`<div class="welcome-message">
          <h3>👋 您好！我是智慧停车助手</h3>
          <p>我可以为您提供以下服务：</p>
          <div class="service-list">
            <div class="service-item">
              <span class="service-icon">🅿️</span>
              <span>实时查询车位状态</span>
            </div>
            <div class="service-item">
              <span class="service-icon">⏰</span>
              <span>预约停车位</span>
            </div>
            <div class="service-item">
              <span class="service-icon">🗺️</span>
              <span>导航至空闲车位</span>
            </div>
            <div class="service-item">
              <span class="service-icon">📊</span>
              <span>查看实时停车场数据</span>
            </div>
          </div>
          <p class="help-text">请问需要什么帮助？</p>
        </div>`}]}catch(s){console.error("清除聊天记录失败:",s)}}async function L(){try{if(!p()){console.error("未登录，无法获取停车场数据");return}const e=await ae();e&&e.success?n.value=e.data:(console.error("获取停车场数据失败：API返回失败"),n.value=null)}catch(s){console.error("获取停车场数据失败:",s),n.value=null}}async function O(){try{const s=p();if(!s){console.error("未登录，无法获取用户车牌信息");return}const e=await fetch("/api/chat/user-plates",{headers:{Authorization:`Bearer ${s}`,"Content-Type":"application/json"}});if(!e.ok){if(e.status===401){u.error("登录已过期，请重新登录"),k.push("/login");return}throw new Error(`请求失败: ${e.status}`)}const t=await e.json();t.success&&(w.value=t.data)}catch(s){console.error("获取用户车牌信息失败:",s)}}J(()=>{if(!p()){u.error("请先登录"),k.push("/login");return}M()||(l.value=[{role:"assistant",type:"text",content:`<div class="welcome-message">
          <h3>👋 您好！我是智慧停车助手</h3>
          <p>我可以为您提供以下服务：</p>
          <div class="service-list">
            <div class="service-item">
              <span class="service-icon">🅿️</span>
              <span>实时查询车位状态</span>
            </div>
            <div class="service-item">
              <span class="service-icon">⏰</span>
              <span>预约停车位</span>
            </div>
            <div class="service-item">
              <span class="service-icon">🗺️</span>
              <span>导航至空闲车位</span>
            </div>
            <div class="service-item">
              <span class="service-icon">📊</span>
              <span>查看实时停车场数据</span>
            </div>
          </div>
          <p class="help-text">请问需要什么帮助？</p>
        </div>`}]),L(),O()}),Y(l,()=>{E()},{deep:!0}),q(()=>{E()}),window.clearChatHistory=T,window.exportChatHistory=K;const I=[{id:1,icon:h,label:"查车位",command:"显示当前空闲车位"},{id:2,icon:h,label:"预约",command:"我要预约停车位"},{id:3,icon:h,label:"车牌",command:"查看我的车牌信息"},{id:4,icon:h,label:"收费",command:"查看收费标准"},{id:5,icon:h,label:"布局图",command:"查看停车场布局图"},{id:6,icon:h,label:"清除记录",command:"clear_history"}];function N(s){if(s==="clear_history"){u.success("聊天记录已清除"),T();return}d.value=s,S()}function P(s){return["空闲车位","车位空闲","剩余车位","可用车位","停车位分布","车位分布","停车场分布","各区车位","A区","B区","C区","D区","E区","F区","停车场状态","车位状态"].some(t=>s.includes(t))}function R(s){return["车牌","我的车牌","绑定车牌","车牌信息","车牌号","车牌号码"].some(t=>s.includes(t))}function B(s){return s.includes("收费标准")||s.includes("停车收费")||s.includes("停车费")}async function S(){if(!d.value.trim())return;if(!p()){u.error("登录已过期，请重新登录"),k.push("/login");return}l.value.push({role:"user",type:"text",content:d.value}),y.value=!0;try{if(await L(),await O(),B(d.value))l.value.push({role:"assistant",type:"text",content:ke}),v.value=!0;else if(X(d.value))l.value.push({role:"assistant",type:"image",content:"/src/assets/images/bujutu.png",alt:"龙跃园区停车场布局图",caption:"🗺️ 龙跃园区停车场布局图 - 包含A、B、C、D、E、F六个区域及新能源充电区域"}),v.value=!0;else if(ee(d.value)){if(n.value&&n.value.zone_stats){const e=se(n.value.zone_stats);l.value.push({role:"assistant",type:"text",content:e})}else l.value.push({role:"assistant",type:"text",content:"抱歉，暂时无法获取实时车位状态信息，请稍后再试。"});v.value=!0}else if(R(d.value)){if(w.value&&w.value.license_plates){const e=w.value.license_plates;if(e.length>0){let t=`<div class="plate-info">
            <h3>🚗 您的车牌信息</h3>
            <div class="plate-list">`;e.forEach((a,i)=>{const m=a.is_default?" (默认)":"";t+=`
              <div class="plate-item ${a.is_default?"default":""}">
                <div class="plate-number">${a.plate_number}</div>
                <div class="plate-status">${m}</div>
              </div>`}),t+=`
            </div>
            <div class="plate-tip">
              <p>💡 提示：预约车位时会使用您的默认车牌，如需更换请前往车牌管理页面设置。</p>
            </div>
          </div>`,l.value.push({role:"assistant",type:"text",content:t})}else l.value.push({role:"assistant",type:"text",content:`<div class="no-plate-warning">
              <div class="warning-icon">⚠️</div>
              <h3>您还没有绑定车牌</h3>
              <p>请先前往"车牌管理"页面绑定车牌，然后才能预约车位。</p>
              <div class="action-buttons">
                <button class="action-btn primary" onclick="window.location.href='/user/plates'">
                  前往车牌管理
                </button>
              </div>
            </div>`})}else l.value.push({role:"assistant",type:"error",content:`<div class="error-message">
              <div class="error-icon">❌</div>
              <h3>获取车牌信息失败</h3>
              <p>请稍后再试或联系客服</p>
            </div>`});v.value=!0}else if(P(d.value)){if(n.value){let e=`<div class="parking-stats">
          <h3>📊 实时停车场数据</h3>
          
          <div class="stats-overview">
            <div class="stat-item">
              <div class="stat-number">${n.value.total_spots}</div>
              <div class="stat-label">总车位</div>
            </div>
            <div class="stat-item available">
              <div class="stat-number">${n.value.available_spots}</div>
              <div class="stat-label">可用车位</div>
            </div>
            <div class="stat-item occupied">
              <div class="stat-number">${n.value.occupied_spots}</div>
              <div class="stat-label">已占用</div>
            </div>
            <div class="stat-item reserved">
              <div class="stat-number">${n.value.reserved_spots}</div>
              <div class="stat-label">已预约</div>
            </div>
            <div class="stat-item utilization">
              <div class="stat-number">${n.value.utilization_rate}%</div>
              <div class="stat-label">使用率</div>
            </div>
          </div>
          
          <div class="zone-stats">
            <h4>🏢 各分区情况</h4>
            <div class="zone-grid">`;Object.entries(n.value.zone_stats).forEach(([t,a])=>{a.total>0&&(e+=`
              <div class="zone-item">
                <div class="zone-name">${t}区</div>
                <div class="zone-details">
                  <span class="detail-item">总计: ${a.total}</span>
                  <span class="detail-item available">可用: ${a.available}</span>
                  <span class="detail-item occupied">占用: ${a.occupied}</span>
                  <span class="detail-item reserved">预约: ${a.reserved}</span>
                </div>
              </div>`)}),e+=`
            </div>
          </div>
          
          <div class="type-stats">
            <h4>🚙 各类型车位</h4>
            <div class="type-grid">`,Object.entries(n.value.type_stats).forEach(([t,a])=>{a.total>0&&(e+=`
              <div class="type-item">
                <div class="type-name">${t}</div>
                <div class="type-details">
                  <span class="detail-item">总计: ${a.total}</span>
                  <span class="detail-item available">可用: ${a.available}</span>
                  <span class="detail-item occupied">占用: ${a.occupied}</span>
                  <span class="detail-item reserved">预约: ${a.reserved}</span>
                </div>
              </div>`)}),e+=`
            </div>
          </div>
        </div>`,l.value.push({role:"assistant",type:"text",content:e})}else{const e=await ie({per_page:100});if(e&&Array.isArray(e.data)){const t={};e.data.forEach(i=>{t[i.zone]||(t[i.zone]={total:0,free:0}),t[i.zone].total++,i.status==="空闲"&&t[i.zone].free++});let a=`<div class="parking-stats">
              <h3>📊 各分区车位情况</h3>
              <div class="zone-grid">`;Object.entries(t).forEach(([i,m])=>{a+=`
                <div class="zone-item">
                  <div class="zone-name">${i}区</div>
                  <div class="zone-details">
                    <span class="detail-item">总数: ${m.total}</span>
                    <span class="detail-item available">空闲: ${m.free}</span>
                  </div>
                </div>`}),a+=`
              </div>
            </div>`,l.value.push({role:"assistant",type:"text",content:a})}else l.value.push({role:"assistant",type:"error",content:`<div class="error-message">
              <div class="error-icon">❌</div>
              <h3>获取车位信息失败</h3>
              <p>请稍后再试或联系客服</p>
            </div>`})}v.value=!0}else{const e=await te(l.value.map(t=>({role:t.role,content:t.content})));l.value.push({role:"assistant",type:"text",content:e}),v.value=!0}}catch(e){if(console.error("聊天错误:",e),e.message.includes("登录")||e.message.includes("401")){u.error("登录已过期，请重新登录"),k.push("/login");return}l.value.push({role:"assistant",type:"error",content:`<div class="error-message">
        <div class="error-icon">⚠️</div>
        <h3>对话出错</h3>
        <p>请稍后再试或联系客服</p>
      </div>`}),v.value=!1}d.value="",y.value=!1}function U(){p()?u.success("已登录，Token有效"):u.error("未登录或Token已过期")}function V(s){s.preventDefault();const e=document.createElement("div");e.className="context-menu",e.innerHTML=`
    <div class="menu-item" onclick="clearChatHistory()">
      🗑️ 清除聊天记录
    </div>
    <div class="menu-item" onclick="exportChatHistory()">
      📤 导出聊天记录
    </div>
  `,e.style.position="fixed",e.style.left=s.clientX+"px",e.style.top=s.clientY+"px",e.style.zIndex="9999",document.body.appendChild(e);const t=()=>{document.body.removeChild(e),document.removeEventListener("click",t)};setTimeout(()=>{document.addEventListener("click",t)},100)}function K(){try{const s={timestamp:new Date().toISOString(),messages:l.value},e=new Blob([JSON.stringify(s,null,2)],{type:"application/json"}),t=URL.createObjectURL(e),a=document.createElement("a");a.href=t,a.download=`chat_history_${new Date().toISOString().split("T")[0]}.json`,a.click(),URL.revokeObjectURL(t),u.success("聊天记录已导出")}catch(s){console.error("导出聊天记录失败:",s),u.error("导出失败")}}return(s,e)=>{const t=j("el-button"),a=j("el-input");return c(),o("div",le,[r("header",null,[r("div",{class:D(["status-indicator",{online:v.value,offline:!v.value}])},[e[1]||(e[1]=r("span",{class:"dot"},null,-1)),_(" "+g(v.value?"在线服务中":"离线模式"),1)],2),r("div",ne,[r("span",ce,g(l.value.length)+" 条消息",1),z.value?(c(),o("span",oe,"已保存历史记录")):x("",!0)])]),r("div",de,[(c(),o($,null,A(I,i=>b(t,{key:i.id,type:"primary",size:"small",onClick:m=>N(i.command),icon:i.icon,round:""},{default:C(()=>[_(g(i.label),1)]),_:2},1032,["onClick","icon"])),64)),b(t,{type:"info",size:"small",onClick:U,round:""},{default:C(()=>e[2]||(e[2]=[_("检查登录")])),_:1,__:[2]})]),r("div",{class:"message-flow",onContextmenu:G(V,["prevent"])},[b(Z,{name:"fade",tag:"div"},{default:C(()=>[(c(!0),o($,null,A(l.value,(i,m)=>(c(),o("div",{key:m,class:D(["message-bubble",i.role])},[i.type==="text"?(c(),o($,{key:0},[i.role==="user"?(c(),o("span",re,"我：")):(c(),o("span",ve,"助手：")),r("span",{innerHTML:i.content},null,8,ue)],64)):i.type==="image"?(c(),o($,{key:1},[i.role==="user"?(c(),o("span",pe,"我：")):(c(),o("span",me,"助手：")),r("div",fe,[r("img",{src:i.content,alt:i.alt||"图片",class:"message-image"},null,8,he),i.caption?(c(),o("div",ye,g(i.caption),1)):x("",!0)])],64)):i.type==="error"?(c(),o("span",_e,"⚠️ "+g(i.content),1)):x("",!0)],2))),128)),y.value?(c(),o("div",ge,e[3]||(e[3]=[r("span",{class:"dot-pulse"},null,-1),_(" 思考中... ")]))):x("",!0)]),_:1})],32),r("div",be,[b(a,{modelValue:d.value,"onUpdate:modelValue":e[0]||(e[0]=i=>d.value=i),placeholder:"请输入您的问题...",onKeyup:W(S,["enter"]),disabled:y.value,clearable:""},null,8,["modelValue","disabled"]),b(t,{class:"pretty-btn",type:"primary",disabled:y.value||!d.value.trim(),onClick:S,icon:"el-icon-s-promotion"},{default:C(()=>e[4]||(e[4]=[_("发送")])),_:1,__:[4]},8,["disabled"])])])}}},He=F(we,[["__scopeId","data-v-566c5e6b"]]);export{He as default};
