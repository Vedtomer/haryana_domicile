import{r,j as e}from"./vendor-react-DNZ-wQbn.js";import{a as L,H as F}from"./vendor-inertia-CMSv1CFb.js";import{A as K}from"./AdminLayout-CRUngewq.js";import{a as y}from"./vendor-axios-CzApALvg.js";import"./ThemeToggle-C7YjLGmN.js";import"./app-Bikzi4gf.js";import"./app-CH_3ZP9q.js";function H(){const{currentService:v,coinCost:w=19,isAdmin:m=!1,apiUrl:A="",apiKey:S=""}=L().props,[l,p]=r.useState(""),[b,h]=r.useState(!1),[s,c]=r.useState(null),[u,n]=r.useState(null),f=v?.coin_cost??w??19,[C,o]=r.useState(!1),[g,_]=r.useState(A||"https://good-api-point.com/apis_partner/v1/aadhar_card_api/aadhar_to_name.php"),[j,X]=r.useState(S||""),[k,N]=r.useState(!1),[x,d]=r.useState(null),D=async t=>{t.preventDefault();const a=l.replace(/\D/g,"");if(a.length!==12){n("Please enter a valid 12-digit Aadhaar Number.");return}h(!0),n(null),c(null);try{const i=await y.post("/utilities/aadhar-to-name/search",{aadhar:a});i.data.success?c(i.data):n(i.data.message||"Details not found for this Aadhaar number.")}catch(i){const P=i.response?.data?.message||"An error occurred while fetching the details.";n(P)}finally{h(!1)}},I=async t=>{t.preventDefault(),N(!0),d(null);try{const a=await y.post("/utilities/aadhar-to-name/update-api",{api_url:g,api_key:j});a.data.success?(d({type:"success",text:a.data.message}),setTimeout(()=>o(!1),1200)):d({type:"error",text:a.data.message||"Failed to save settings."})}catch{d({type:"error",text:"Error saving settings."})}finally{N(!1)}},E=t=>t.replace(/\D/g,"").slice(0,12).replace(/(\d{4})(?=\d)/g,"$1 ");return e.jsxs(K,{header:e.jsxs("div",{className:"flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4",children:[e.jsxs("div",{children:[e.jsxs("h1",{className:"text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5",children:[e.jsx("span",{className:"material-symbols-outlined text-blue-600 dark:text-blue-400 text-3xl",children:"badge"}),"Aadhar To Name Search"]}),e.jsx("p",{className:"text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium mt-1",children:"Instantly retrieve Name & Mobile details using 12-digit Aadhaar Number"})]}),m&&e.jsxs("button",{type:"button",onClick:()=>o(!0),className:"inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-all shadow-sm self-start sm:self-auto cursor-pointer",children:[e.jsx("span",{className:"material-symbols-outlined text-base text-blue-600 dark:text-blue-400",children:"tune"}),"API Config (Admin)"]})]}),children:[e.jsx(F,{title:"Aadhar To Name"}),e.jsx("style",{children:`
                .npci-input {
                    background-color: #ffffff !important;
                    color: #0f172a !important;
                    border-color: #3b82f6 !important;
                    font-weight: 900 !important;
                    letter-spacing: 0.2em !important;
                }
                .dark .npci-input {
                    background-color: #1e293b !important;
                    color: #ffffff !important;
                    border-color: #60a5fa !important;
                }
                .npci-input::placeholder {
                    color: #94a3b8 !important;
                    opacity: 0.6;
                }
                .dark .npci-input::placeholder {
                    color: #94a3b8 !important;
                    opacity: 0.6;
                }
                .npci-label {
                    color: #0f172a !important;
                    font-weight: 900 !important;
                }
                .dark .npci-label {
                    color: #f8fafc !important;
                    font-weight: 900 !important;
                }
                .npci-subtext {
                    color: #475569 !important;
                    font-weight: 600 !important;
                }
                .dark .npci-subtext {
                    color: #cbd5e1 !important;
                    font-weight: 600 !important;
                }
                .npci-detail-title {
                    color: #0f172a !important;
                    font-weight: 900 !important;
                }
                .dark .npci-detail-title {
                    color: #ffffff !important;
                    font-weight: 900 !important;
                }
                .npci-detail-label {
                    color: #475569 !important;
                    font-weight: 800 !important;
                }
                .dark .npci-detail-label {
                    color: #94a3b8 !important;
                    font-weight: 800 !important;
                }
                .npci-detail-box {
                    background-color: #f8fafc !important;
                    border-color: #cbd5e1 !important;
                }
                .dark .npci-detail-box {
                    background-color: #1e293b !important;
                    border-color: #334155 !important;
                }
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    #name-printable-slip, #name-printable-slip * {
                        visibility: visible;
                    }
                    #name-printable-slip {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        background: #fff !important;
                        color: #000 !important;
                        padding: 20px;
                        margin: 0;
                        box-shadow: none !important;
                        border: 2px solid #000 !important;
                    }
                    .no-print {
                        display: none !important;
                    }
                }
            `}),e.jsxs("div",{className:"max-w-2xl mx-auto mt-6 px-4 space-y-6",children:[e.jsxs("div",{className:"bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-800 overflow-hidden no-print",children:[e.jsxs("div",{className:"p-6 sm:p-8",children:[e.jsx("div",{className:"flex items-center justify-center w-16 h-16 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 rounded-2xl mb-5 mx-auto border border-blue-200 dark:border-blue-900/50",children:e.jsx("span",{className:"material-symbols-outlined text-3xl",children:"badge"})}),e.jsx("h2",{className:"text-2xl font-black text-center text-slate-900 dark:text-white mb-2 tracking-tight",children:"Find Name from Aadhaar"}),e.jsx("p",{className:"text-center npci-subtext mb-6 text-sm",children:"Enter a 12-digit Aadhaar number to fetch the associated beneficiary name and mobile instantly."}),e.jsxs("form",{onSubmit:D,className:"space-y-5",children:[e.jsxs("div",{children:[e.jsxs("div",{className:"flex items-center justify-between mb-2",children:[e.jsx("label",{className:"block text-xs uppercase tracking-wider npci-label",children:"12-Digit Aadhaar Number"}),e.jsxs("span",{className:"text-xs font-bold font-mono px-2 py-0.5 rounded-md bg-blue-100 text-blue-900 dark:bg-blue-900/60 dark:text-blue-200",children:[l.length,"/12 Digits"]})]}),e.jsx("div",{className:"relative",children:e.jsx("input",{type:"text",maxLength:"14",value:E(l),onChange:t=>{const a=t.target.value.replace(/\D/g,"").slice(0,12);p(a)},placeholder:"XXXX XXXX XXXX",className:"npci-input w-full px-5 py-4 border-2 rounded-2xl focus:ring-4 focus:ring-blue-500/30 outline-none text-2xl font-black font-mono transition-all text-center shadow-sm"})})]}),e.jsx("button",{type:"submit",disabled:b||l.length!==12,className:"w-full py-4 px-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white font-black text-base sm:text-lg rounded-2xl shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 cursor-pointer",children:b?e.jsxs(e.Fragment,{children:[e.jsxs("svg",{className:"animate-spin h-6 w-6 text-white",fill:"none",viewBox:"0 0 24 24",children:[e.jsx("circle",{className:"opacity-25",cx:"12",cy:"12",r:"10",stroke:"currentColor",strokeWidth:"4"}),e.jsx("path",{className:"opacity-75",fill:"currentColor",d:"M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"})]}),e.jsx("span",{children:"Searching Aadhaar Gateway..."})]}):e.jsxs(e.Fragment,{children:[e.jsx("span",{className:"material-symbols-outlined font-bold",children:"search"}),e.jsxs("span",{children:["Find Details (",f," Coins)"]})]})})]}),u&&e.jsxs("div",{className:"mt-6 p-4 bg-red-50 dark:bg-red-950/60 border border-red-300 dark:border-red-800 rounded-2xl flex items-start gap-3",children:[e.jsx("span",{className:"material-symbols-outlined text-red-600 dark:text-red-400 shrink-0 mt-0.5",children:"error"}),e.jsxs("div",{children:[e.jsx("p",{className:"text-sm font-black text-red-900 dark:text-red-200",children:"Lookup Failed"}),e.jsx("p",{className:"text-xs text-red-700 dark:text-red-300 mt-0.5 font-bold",children:u})]})]})]}),e.jsxs("div",{className:"bg-slate-50 dark:bg-slate-800/80 p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 sm:px-8",children:[e.jsxs("div",{className:"flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200",children:[e.jsx("span",{className:"w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"}),"Live instant lookup"]}),e.jsxs("div",{className:"flex items-center gap-1.5 text-xs font-black text-amber-800 dark:text-amber-200 bg-amber-100 dark:bg-amber-950/80 px-3.5 py-1.5 rounded-full border border-amber-300 dark:border-amber-700",children:[e.jsx("span",{className:"material-symbols-outlined text-[15px]",children:"monetization_on"}),f," Coins"]})]})]}),s&&e.jsxs("div",{id:"name-printable-slip",className:"bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200",children:[e.jsxs("div",{className:"flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("div",{className:"w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-2xl shadow-md",children:"🪪"}),e.jsxs("div",{children:[e.jsx("h3",{className:"text-lg font-black text-slate-900 dark:text-white",children:"Aadhaar To Name Verification Report"}),e.jsxs("p",{className:"text-xs text-slate-600 dark:text-slate-300 font-medium",children:["Ref No: ",e.jsx("span",{className:"font-mono font-bold text-blue-600 dark:text-blue-400",children:s.application_no||"UID_VERIFICATION"})]})]})]}),e.jsxs("div",{className:"flex items-center gap-2 no-print",children:[e.jsxs("button",{type:"button",onClick:()=>window.print(),className:"px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer",children:[e.jsx("span",{className:"material-symbols-outlined text-base",children:"print"}),"Print Receipt"]}),e.jsx("button",{type:"button",onClick:()=>{c(null),p("")},className:"px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer",children:"New Search"})]})]}),e.jsxs("div",{className:"grid grid-cols-1 sm:grid-cols-2 gap-4",children:[e.jsxs("div",{className:"npci-detail-box p-4 rounded-2xl border",children:[e.jsx("span",{className:"text-xs uppercase tracking-wide npci-detail-label",children:"Beneficiary Name (English)"}),e.jsx("p",{className:"text-lg npci-detail-title mt-1",children:s.name||"Not Available"})]}),s.localName?e.jsxs("div",{className:"npci-detail-box p-4 rounded-2xl border",children:[e.jsx("span",{className:"text-xs uppercase tracking-wide npci-detail-label",children:"Beneficiary Name (Local)"}),e.jsx("p",{className:"text-lg npci-detail-title mt-1",children:s.localName})]}):e.jsxs("div",{className:"npci-detail-box p-4 rounded-2xl border",children:[e.jsx("span",{className:"text-xs uppercase tracking-wide npci-detail-label",children:"Aadhaar Number"}),e.jsx("p",{className:"text-lg font-mono npci-detail-title mt-1",children:s.uid||l})]}),e.jsxs("div",{className:"npci-detail-box p-4 rounded-2xl border",children:[e.jsx("span",{className:"text-xs uppercase tracking-wide npci-detail-label",children:"Linked Mobile Number"}),e.jsx("p",{className:"text-lg font-mono npci-detail-title mt-1",children:s.mobile||"Not Available"})]}),e.jsxs("div",{className:"npci-detail-box p-4 rounded-2xl border",children:[e.jsx("span",{className:"text-xs uppercase tracking-wide npci-detail-label",children:"Transaction ID"}),e.jsx("p",{className:"text-sm font-mono npci-detail-title mt-1",children:s.transaction_id||"N/A"})]})]}),e.jsxs("div",{className:"pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-slate-600 dark:text-slate-300 gap-2 font-medium",children:[e.jsxs("div",{children:["Verified On: ",e.jsx("span",{className:"font-bold text-slate-900 dark:text-white",children:s.checked_at||"Just Now"})]}),e.jsxs("div",{className:"text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1",children:[e.jsx("span",{className:"material-symbols-outlined text-[16px]",children:"check_circle"}),"Verified via Aadhaar API"]})]})]})]}),m&&C&&e.jsx("div",{className:"fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm",children:e.jsxs("div",{className:"bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150",children:[e.jsxs("div",{className:"flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4",children:[e.jsxs("div",{className:"flex items-center gap-2.5",children:[e.jsx("span",{className:"material-symbols-outlined text-blue-600 dark:text-blue-400 text-2xl",children:"settings"}),e.jsx("h3",{className:"text-lg font-black text-slate-900 dark:text-white",children:"Aadhar to Name API Settings"})]}),e.jsx("button",{type:"button",onClick:()=>o(!1),className:"p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800",children:e.jsx("span",{className:"material-symbols-outlined",children:"close"})})]}),x&&e.jsx("div",{className:`p-3 rounded-xl text-xs font-bold ${x.type==="success"?"bg-emerald-50 text-emerald-800 border border-emerald-200":"bg-red-50 text-red-800 border border-red-200"}`,children:x.text}),e.jsxs("form",{onSubmit:I,className:"space-y-4",children:[e.jsxs("div",{children:[e.jsx("label",{className:"block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 mb-1.5",children:"Endpoint URL"}),e.jsx("input",{type:"text",value:g,onChange:t=>_(t.target.value),placeholder:"https://good-api-point.com/apis_partner/v1/aadhar_card_api/aadhar_to_name.php",className:"w-full px-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono focus:border-blue-500 outline-none text-slate-900 dark:text-white",required:!0}),e.jsxs("p",{className:"text-[10px] text-slate-500 dark:text-slate-400 mt-1",children:["Query parameters ",e.jsx("code",{children:"apiKey"})," and ",e.jsx("code",{children:"uid"})," will be automatically passed."]})]}),e.jsxs("div",{children:[e.jsx("label",{className:"block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 mb-1.5",children:"Partner API Key"}),e.jsx("input",{type:"text",value:j,onChange:t=>X(t.target.value),placeholder:"Enter your API Key...",className:"w-full px-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono focus:border-blue-500 outline-none text-slate-900 dark:text-white"})]}),e.jsxs("div",{className:"flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800",children:[e.jsx("button",{type:"button",onClick:()=>o(!1),className:"px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 dark:text-slate-300 dark:hover:text-white",children:"Cancel"}),e.jsx("button",{type:"submit",disabled:k,className:"px-5 py-2.5 text-xs font-black text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md disabled:opacity-50 flex items-center gap-1.5 cursor-pointer",children:k?"Saving...":"Save Configuration"})]})]})]})})]})}export{H as default};
