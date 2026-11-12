/* Prototype cục bộ: không gọi API, không gửi dữ liệu, không thực hiện giao dịch. */
(function () {
  "use strict";
  const $ = (selector) => document.querySelector(selector);
  const esc = (value) => String(value).replace(/[&<>"']/g, (char) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
  const money = (value) => new Intl.NumberFormat("vi-VN").format(value) + " đ";
  const norm = (value) => String(value).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/đ/g,"d");
  const stamp = (hours) => new Intl.DateTimeFormat("vi-VN", {timeZone:"Asia/Ho_Chi_Minh",day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit",hour12:false}).format(new Date(Date.parse("2026-11-12T15:00:00+07:00")+hours*3600000));
  const badge = (n) => '<span class="annotation">'+n+'</span>';
  const button = (action,text,kind,disabled) => '<button type="button" class="button '+(kind||"secondary")+'" data-action="'+action+'"'+(disabled?" disabled":"")+'>'+text+'</button>';
  let state, view="buyer", toastTimer;
  const current = () => window.LAB_CASES[state.id];
  const isOpen = () => !state.closed;
  const audit = (text) => state.logs.push({hour:state.hours,text:text});
  const say = (text,role) => state.messages.push({role:role||"assistant",text:text});
  function toast(text) {
    $("#toast").textContent=text; $("#toast").classList.add("visible");
    clearTimeout(toastTimer); toastTimer=setTimeout(()=>$("#toast").classList.remove("visible"),3500);
  }
  function reset(id) {
    const c=window.LAB_CASES[id]||window.LAB_CASES.S01;
    state={id:c.id,hours:0,messages:[{role:"user",text:c.message},{role:"assistant",text:c.reply}],
      logs:[],sourceVerified:c.id!=="S01",label:c.complete,measurement:c.complete?"Đã có ảnh hàng và xác nhận shop.":"",
      screenshot:false,noScreenshot:false,sellerResponse:c.complete,transferred:c.id!=="S04",transferredAt:0,claimed:false,
      buyerRequests:c.complete?0:1,sellerRequests:c.complete?0:1,buyerReminded:false,sellerReminded:false,
      draft:c.complete,revision:0,pending:null,closed:null,overdue:false,specialist:false,
      corrections:[],needsRecheck:false,orderDisputed:false,reportedOrder:null,sellerStatement:null,evidenceConflict:false};
    audit("Tiếp nhận khiếu nại "+c.order+". Chưa thực hiện thao tác tiền.");
    if(state.buyerRequests) audit("Đã gửi một yêu cầu: cách đo và ảnh nhãn, gộp trong cùng một tin.");
    if(state.sellerRequests) audit("Đã gửi một yêu cầu bằng chứng cho shop.");
    if(state.transferred) audit("Đã chuyển trưởng nhóm, kèm điểm chưa xác minh và bằng chứng hiện có.");
    view="buyer"; $("#case-select").value=c.id;
    ["#edit-dialog","#decision-dialog"].forEach(s=>{if($(s).open)$(s).close();});
    render();
  }
  function enough() {
    if(!state.sourceVerified||!state.sellerResponse||state.specialist||state.needsRecheck||state.orderDisputed) return false;
    return state.id!=="S04" || (state.label && state.measurement.trim().length>=10);
  }
  function transfer(reason) {
    if(!isOpen()) return;
    if(!state.transferred) {
      state.transferred=true;state.transferredAt=state.hours;state.overdue=false;
      audit("Chuyển trưởng nhóm: "+reason+".");
      say("Hồ sơ đã chuyển trưởng nhóm, kèm thông tin đã có và phần chưa xác minh. Dự kiến được xem xét trong 24 giờ. Quá hạn sẽ nhắc và chuyển cấp; không tự hoàn tiền hoặc đóng khiếu nại.");
    } else toast("Hồ sơ đã ở hàng chờ, không tạo bản trùng.");
  }
  function touch() {
    state.revision++;state.draft=false;state.pending=null;
    if($("#decision-dialog").open) $("#decision-dialog").close();
  }
  const privateSafe = (text) => String(text).replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi,"[đã ẩn email]").replace(/\b0\d[\d .-]{7,}\d\b/g,"[đã ẩn số liên hệ]");
  function receivedSellerConflict() {
    if(state.id!=="S04"||!isOpen()||state.evidenceConflict||state.orderDisputed) return;
    touch();state.sellerResponse=true;state.evidenceConflict=true;
    state.sellerStatement="Shop gửi thông số mẫu ghi dung tích lòng nồi 6L, trong khi người mua báo đo được khoảng 5L. Hai nguồn chưa thống nhất; cần người kiểm tra cách đo và tài liệu.";
    audit("Nhận phản hồi shop: số liệu lòng nồi không khớp phản ánh người mua.");
    say("Shop vừa gửi thông số chưa thống nhất với phản ánh của bạn. Mình đã ghi nhận bằng chứng hai bên và sẽ tự chuyển trưởng nhóm kiểm tra; chưa có quyết định hoàn tiền hay từ chối.");
    transfer("Bằng chứng về dung tích giữa người mua và shop mâu thuẫn");
    render();
  }
  function recordCorrection(text) {
    touch();
    state.corrections.push({hour:state.hours,text:privateSafe(text)});
    const orderCodes=text.match(/\bSP[0-9A-Z-]+\b/gi)||[];
    const different=orderCodes.find(code=>code.toUpperCase()!==current().order);
    if(orderCodes.length){state.orderDisputed=Boolean(different);state.reportedOrder=different?different.toUpperCase():null;}
    state.needsRecheck=true;state.sourceVerified=false;state.sellerResponse=false;
    audit("Người mua đính chính; yêu cầu đối chiếu lại nguồn và bằng chứng trước quyết định.");
    transfer("Thông tin đính chính cần được kiểm tra lại");
    say(state.orderDisputed
      ? "Mình đã ghi nhận đính chính vào hồ sơ. Mã đơn bạn vừa nêu chưa có dữ liệu để đối chiếu trong hồ sơ hiện tại, nên đã khoá bước duyệt. Trưởng nhóm sẽ thấy nội dung mới và cần xác minh đúng đơn trước khi tiếp tục; chưa có quyết định tiền."
      : "Mình đã ghi nhận đính chính vào hồ sơ và bỏ đề xuất cũ. Bước duyệt được khoá để trưởng nhóm đối chiếu lại nguồn, bằng chứng hai phía và xác nhận đã kiểm tra nội dung mới.");
  }
  function historyMarkup() {
    const messages=state.messages;
    const message=(m)=>'<div class="message '+(m.role==="user"?"user":"assistant")+'"><div class="message-meta">'+(m.role==="user"?"Bạn":'<span class="avatar">g.</span>Trợ lý đơn hàng <span class="tag ai">AI</span>')+'</div><div class="bubble">'+esc(m.text)+'</div></div>';
    const old=messages.slice(0,-2),recent=messages.slice(-2);
    return (old.length?'<details class="chat-history"><summary>Xem '+old.length+' tin trước</summary><div class="history-messages">'+old.map(message).join("")+'</div></details>':"")+recent.map(message).join("");
  }
  function correctionMarkup() {
    if(!state.corrections.length) return "";
    return '<div class="notice '+(state.needsRecheck?"amber":"")+' correction-note"><strong>Thông tin người mua đã đính chính</strong>'+
      state.corrections.map(item=>'<p>'+esc(item.text)+'</p><small>'+stamp(item.hour)+'</small>').join("")+
      '<p>'+(state.orderDisputed?'Mã đơn '+esc(state.reportedOrder)+' chưa được xác minh. Không dùng bằng chứng của đơn cũ để quyết định.':state.needsRecheck?'Cần kiểm tra lại trước khi duyệt.':'Trưởng nhóm đã xác nhận đối chiếu lại nội dung đính chính.')+'</p></div>';
  }
  function productArt() {
    if(current().icon==="airfryer") return '<svg viewBox="0 0 60 60" fill="none" aria-hidden="true"><path d="M15 20Q15 12 23 12H39Q47 12 47 20V48H15Z" fill="#3d5145"/><rect x="20" y="18" width="22" height="11" rx="4" fill="#c9cfc0"/><circle cx="31" cy="23" r="2.5" fill="#df512a"/><path d="M18 33H44V45H18Z" fill="#617367"/><path d="M27 33H35V39H27" stroke="#eee7d5" stroke-width="3"/><path d="M19 49H43" stroke="#23372c" stroke-width="3" stroke-linecap="round"/></svg>';
    return '<svg viewBox="0 0 60 60" fill="none" aria-hidden="true"><path d="M13 33V27C13 6 47 6 47 27V33" stroke="#43584b" stroke-width="7" stroke-linecap="round"/><rect x="8" y="28" width="13" height="23" rx="6.5" fill="#31493d"/><rect x="39" y="28" width="13" height="23" rx="6.5" fill="#31493d"/><path d="M16 32V45M44 32V45" stroke="#aab7a4" stroke-width="2" stroke-linecap="round"/></svg>';
  }
  function product() {
    const c=current();
    return '<div class="product-row"><div class="product-art">'+productArt()+'</div><div class="product-info"><strong>'+esc(c.product)+'</strong><span>Đơn '+c.order+' · Đã giao 10/11/2026</span></div><div class="product-price">'+money(c.amount)+'</div></div>';
  }
  function status() {
    if(state.closed) return {text:"Đã có quyết định của trưởng nhóm",cls:"green"};
    if(state.orderDisputed) return {text:"Cần xác minh lại đúng đơn hàng",cls:"red"};
    if(state.needsRecheck) return {text:"Đang kiểm tra thông tin đính chính",cls:"amber"};
    if(state.overdue) return {text:"Đang trễ · Chưa có quyết định",cls:"red"};
    if(state.transferred) return {text:state.claimed?"Trưởng nhóm đang xem xét":"Đang chờ nhân viên xem xét",cls:"amber"};
    return {text:"Đang chờ bổ sung thông tin",cls:"amber"};
  }
  function funds() {
    if(!state.closed) return "Chưa có quyết định hoàn tiền hay từ chối.";
    return state.closed.kind==="refund"?"Đã ghi nhận hoàn tiền "+money(current().amount)+" trong mô phỏng.":"Đã đóng khiếu nại trong mô phỏng, theo quyết định trưởng nhóm.";
  }
  function sourcePanel() {
    const c=current(),unknown=!state.sourceVerified;
    return '<section class="panel"><div class="panel-heading"><h2>'+badge(2)+'Thông tin làm căn cứ</h2><span class="tag">Đúng thời điểm đặt</span></div><div class="panel-body">'+
      '<div class="source-row '+(unknown?"unverified":"")+'"><div class="source-title">MÔ TẢ LÚC ĐẶT <span class="tag '+(unknown?"amber":"green")+'">'+(unknown?"Chưa xác minh":"Đã đối chiếu")+'</span></div><p>'+(state.orderDisputed?"Chưa có bản lưu cho mã đơn đính chính "+esc(state.reportedOrder)+".":unknown?esc(state.id==="S01"?"Người mua khai: màu đen. Cần kiểm tra bản lưu của đơn hàng.":"Cần đối chiếu lại bản lưu sau đính chính; chưa dùng dữ liệu cũ để quyết định."):esc(c.original))+'</p><small>'+(unknown?"Chưa dùng lời khai làm kết luận.":esc(c.source))+'</small></div>'+
      '<div class="source-row"><div class="source-title">MÔ TẢ TRÊN SHOP HIỆN TẠI</div><p>'+esc(c.current)+'</p><small>'+(c.id==="S01"?"Không dùng bản hiện tại để thay bản lúc đặt.":"Đối chiếu cùng bản lưu của đơn hàng.")+'</small></div>'+
      '<div class="notice '+(enough()?"":"amber")+'"><strong>'+badge(1)+(enough()?"Đủ thông tin để trưởng nhóm xem xét":"Điểm còn cần làm rõ")+'</strong><p>'+esc(enough()?"Có bằng chứng hai phía. Quyết định vẫn thuộc trưởng nhóm.":state.orderDisputed?"Mã đơn mới chưa có dữ liệu trong hồ sơ này; cần người xác minh đúng đơn.":state.needsRecheck?"Đính chính đã làm thay đổi căn cứ. Cần đối chiếu lại nguồn, phản hồi shop và xác nhận kiểm tra nội dung mới.":state.evidenceConflict?"Shop và người mua nêu thông số khác nhau. Không tự kết luận ai đúng.":c.unknown)+'</p></div></div></section>';
  }
  function evidencePanel() {
    const c=current();
    let buyer=c.buyerEvidence;
    if(state.id==="S04") buyer=state.label?"Đã bổ sung ảnh nhãn mẫu. "+(state.measurement?"Cách đo: "+state.measurement:"Chưa có cách đo."):"Chưa có ảnh nhãn. "+(state.measurement?"Cách đo: "+state.measurement:"Chưa có cách đo.");
    if(state.screenshot) buyer+=" Đã bổ sung ảnh chụp đơn lúc đặt (chưa tự coi là xác minh nguồn).";
    return '<section class="panel"><div class="panel-heading"><h2>Bằng chứng hai phía</h2></div><div class="panel-body"><div class="evidence-item"><span class="file-icon">▧</span><div><strong>Người mua</strong><small>'+esc(buyer)+'</small></div></div><div class="evidence-item"><span class="file-icon">▤</span><div><strong>Người bán</strong><small>'+esc(state.sellerResponse?(state.sellerStatement||c.factory):c.seller)+'</small></div></div><p class="muted small" style="margin:12px 0 0">Bản mẫu dùng mô tả bằng chứng và tệp minh hoạ dựng sẵn.</p></div></section>';
  }
  function sellerPanel() {
    return '<section class="panel"><div class="panel-body"><details><summary>Shop được thông báo những gì?</summary><p>'+esc(current().sellerNotice)+'</p><p>Thông tin liên hệ của hai bên không được chia sẻ.</p><p>Yêu cầu gửi shop: '+state.sellerRequests+'/1 · Nhắc: '+(state.sellerReminded?1:0)+'/1.</p></details></div></section>';
  }
  function timePanel() {
    const sent=state.transferred?'<p>Chuyển hồ sơ: '+stamp(state.transferredAt)+'. Mục tiêu xem xét trước '+stamp(state.transferredAt+24)+'.</p>':'<p>Nhắc bổ sung một lần sau 24 giờ. Sau 48 giờ thiếu thông tin, chuyển trưởng nhóm.</p>';
    return '<section class="panel"><div class="panel-body"><div class="deadline"><span class="avatar">◷</span><div><strong>Hồ sơ vẫn được theo dõi</strong>'+sent+'<p>Hạn gửi yêu cầu theo chính sách mẫu: 17/11/2026 23:59. Quá hạn chờ duyệt không tự làm phát sinh quyết định.</p></div></div></div></section>';
  }
  function actionArea() {
    const st=status();
    let inner='<div class="next-label">VIỆC TIẾP THEO</div><span class="tag '+st.cls+'">'+badge(1)+st.text+'</span>';
    if(state.closed) return '<div class="action-area">'+inner+'<h3>'+esc(state.closed.kind==="refund"?"Đã duyệt hoàn tiền":"Đã duyệt đóng khiếu nại")+'</h3><p>'+esc(state.closed.reason)+'</p><p>Đây là kết quả mô phỏng. Quyết định tiền không có nút hoàn tác.</p></div>';
    if(state.orderDisputed){
      return '<div class="action-area">'+inner+'<h3>Chờ xác minh mã đơn mới</h3><p>Nội dung đính chính đã chuyển cho trưởng nhóm. Hồ sơ hiện tại chưa có dữ liệu của '+esc(state.reportedOrder)+', nên không thể tiếp tục duyệt.</p><div class="button-row">'+button("open-staff",badge(4)+"Xem hồ sơ đã chuyển","primary")+'</div></div>';
    }
    if(state.id==="S01"){
      inner+='<h3>Bạn có ảnh chụp lúc đặt không?</h3><p>Gửi nếu có. Không có ảnh, hồ sơ vẫn tiếp tục.</p><div class="button-row">'+
      button("add-screenshot",state.screenshot?"Đã nhận ảnh mẫu":"Gửi ảnh chụp màn hình","primary",state.screenshot)+
      button("no-screenshot",badge(3)+(state.noScreenshot?"Đã ghi nhận":"Tôi không có ảnh"),"secondary",state.noScreenshot)+'</div>';
    } else if(state.id==="S04"){
      const complete=state.label&&state.measurement;
      inner+='<h3>'+(complete?"Thông tin của bạn đã được ghi nhận":"Bổ sung hai thông tin ngắn")+'</h3><div class="task-chips"><span class="'+(state.measurement?"done":"")+'">'+(state.measurement?"✓":"1")+' Cách đo</span><span class="'+(state.label?"done":"")+'">'+(state.label?"✓":"2")+' Ảnh nhãn</span></div><div class="button-row">'+
      button("edit-measurement",state.measurement?"Sửa cách đo":"Mô tả cách đo",state.measurement?"secondary":"primary")+
      button("add-label",state.label?"Đã nhận ảnh nhãn mẫu":"Gửi ảnh nhãn thông số",!state.label&&state.measurement?"primary":"secondary",state.label)+'</div>';
      if(state.evidenceConflict) inner+='<p class="transfer-note">Bằng chứng hai bên chưa thống nhất. Hồ sơ đã tự chuyển trưởng nhóm.</p>';
    } else inner+='<h3>Hồ sơ đã đủ để người phụ trách xem xét</h3><p>Bạn không cần gửi lại bằng chứng đã có.</p>';
    inner+='<div class="handoff-row">';
    if(!state.transferred) inner+=button("transfer",badge(3)+"Chuyển nhân viên","link");
    else inner+=button("open-staff",badge(4)+"Xem hồ sơ ở bàn trưởng nhóm","link");
    if(state.id==="S04"&&state.transferred&&!state.claimed&&state.hours-state.transferredAt<24&&state.hours<48&&!state.evidenceConflict)
      inner+=button("undo-transfer","Hoàn tác chuyển hồ sơ","link");
    inner+='</div>';
    return '<div class="action-area">'+inner+'</div>';
  }
  function toolMonitor() {
    const isS01 = state.id === "S01";
    const isS04 = state.id === "S04";
    const isS09 = state.id === "S09";

    const s1Class = "done";
    const s2Class = (state.label || state.screenshot || (state.measurement && state.measurement.length >= 10) || state.sellerResponse) ? "done" : "active";
    const s3Class = state.sourceVerified ? "done" : (state.orderDisputed ? "danger" : "warning");
    const s4Class = state.closed ? "done" : (state.transferred ? "active" : "pending");

    let riskBadge = "";
    if (state.orderDisputed) {
      riskBadge = '<div class="risk-callout red"><strong>⚠️ ĐÍNH CHÍNH MÃ ĐƠN MỚI ('+esc(state.reportedOrder)+'):</strong> Khách đính chính mã đơn mới chưa có dữ liệu. AI tự động hủy đề xuất cũ và khóa duyệt tiền để chặn thất thoát tài chính.</div>';
    } else if (isS01 && !state.sourceVerified) {
      riskBadge = '<div class="risk-callout amber"><strong>⚡ RỦI RO NGUỒN SỰ THẬT (CA ĐẮT NHẤT):</strong> Mô tả shop đã bị sửa sau khi đặt. AI bị cấm dùng mô tả hiện tại để xử thua khách; khóa quyền duyệt tiền cho tới khi trưởng nhóm kiểm tra bản lưu lịch sử.</div>';
    } else if (isS04 && !state.closed) {
      riskBadge = '<div class="risk-callout orange"><strong>⚡ RỦI RO MƠ HỒ NGỮ CẢNH (Dung tích 6L vs 5L):</strong> Tiền đã hoàn thì không thu hồi được. AI không tự ý hoàn tiền vì shop có thể đúng nếu 6L là dung tích phủ bì. Cần thu thập cách đo và ảnh nhãn.</div>';
    } else if (isS09 && !state.closed) {
      riskBadge = '<div class="risk-callout green"><strong>✅ CA BÌNH THƯỜNG (Shop nhận giao nhầm):</strong> Bằng chứng hai bên khớp, shop nhận lỗi. AI chuẩn bị sẵn hồ sơ và chuyển trưởng nhóm duyệt phương án trả hàng hoàn tiền.</div>';
    } else if (state.closed) {
      riskBadge = '<div class="risk-callout green"><strong>🎯 QUY TRÌNH HOÀN TẤT:</strong> Trưởng nhóm đã kiểm tra căn cứ và ký duyệt quyết định trong mô phỏng.</div>';
    }

    return '<section class="panel monitor-panel">' +
      '<div class="panel-heading"><div class="heading-with-icon"><span class="pulse-indicator"></span><h2>Giám Sát Quyền AI &amp; Gọi Tool</h2></div><span class="tag tag-tools">Track T4 · 5 Tools</span></div>' +
      '<div class="panel-body">' +
        '<div class="pipeline-flow">' +
          '<div class="pipeline-step ' + s1Class + '"><div class="pipe-circle">1</div><span>Tiếp nhận</span></div>' +
          '<div class="pipeline-line"></div>' +
          '<div class="pipeline-step ' + s2Class + '"><div class="pipe-circle">2</div><span>Ngữ cảnh &amp; ảnh</span></div>' +
          '<div class="pipeline-line"></div>' +
          '<div class="pipeline-step ' + s3Class + '"><div class="pipe-circle">3</div><span>Nguồn lúc đặt</span></div>' +
          '<div class="pipeline-line"></div>' +
          '<div class="pipeline-step ' + s4Class + '"><div class="pipe-circle">4</div><span>Duyệt tiền</span></div>' +
        '</div>' +
        riskBadge +
        '<div class="tool-matrix">' +
          '<div class="tool-row tool-auto">' +
            '<div class="tool-info"><span class="tool-dot green"></span><code>yeu_cau_bang_chung</code><span class="tool-type-badge green">TỰ LÀM (Có hạn)</span></div>' +
            '<div class="tool-desc">AI xin bằng chứng gộp (tối đa 1 lần xin + 1 lần nhắc sau 24h). Không gửi lặp vô hạn.</div>' +
            '<div class="tool-state">Trạng thái: <strong>' + (state.buyerRequests ? 'Đã kích hoạt (' + state.buyerRequests + '/1)' : 'Sẵn sàng') + '</strong></div>' +
          '</div>' +
          '<div class="tool-row tool-auto">' +
            '<div class="tool-info"><span class="tool-dot blue"></span><code>chuyen_truong_nhom</code><span class="tool-type-badge blue">TỰ LÀM (Bàn giao)</span></div>' +
            '<div class="tool-desc">Chuyển con người khi thiếu nguồn, bằng chứng mâu thuẫn hoặc sau 48h im lặng.</div>' +
            '<div class="tool-state">Trạng thái: <strong>' + (state.transferred ? (state.claimed ? 'Trưởng nhóm đã nhận' : 'Trong hàng chờ xem xét') : 'Chưa kích hoạt') + '</strong></div>' +
          '</div>' +
          '<div class="tool-row tool-review ' + (enough() ? 'ready' : 'locked') + '">' +
            '<div class="tool-info"><span class="tool-dot amber"></span><code>soan_hoan_tien</code><span class="tool-type-badge amber">CẦN DUYỆT (Tiền)</span><span class="tool-high-stakes">ĐẮT GIÁ NHẤT</span></div>' +
            '<div class="tool-desc">Rủi ro tài chính cao, khó đảo ngược. AI chỉ soạn bản nháp; trưởng nhóm bắt buộc xác nhận tác động trước khi chuyển tiền.</div>' +
            '<div class="tool-state">Trạng thái: <strong>' + (state.closed?.kind === 'refund' ? 'ĐÃ DUYỆT HOÀN TIỀN' : (state.orderDisputed ? 'Bị khóa do đính chính đơn' : (enough() ? 'Đủ điều kiện để trưởng nhóm duyệt' : 'ĐANG KHÓA (Chưa đủ căn cứ)'))) + '</strong></div>' +
          '</div>' +
          '<div class="tool-row tool-review">' +
            '<div class="tool-info"><span class="tool-dot orange"></span><code>tu_choi_khieu_nai</code><span class="tool-type-badge orange">CẦN DUYỆT (Đóng)</span></div>' +
            '<div class="tool-desc">Tiền về shop; trưởng nhóm phải nhập lý do thẩm định và xác nhận tác động. Im lặng không được coi là từ chối.</div>' +
            '<div class="tool-state">Trạng thái: <strong>' + (state.closed?.kind === 'deny' ? 'ĐÃ ĐÓNG KHIẾU NẠI' : 'Chỉ duyệt khi có căn cứ') + '</strong></div>' +
          '</div>' +
          '<div class="tool-row tool-banned">' +
            '<div class="tool-info"><span class="tool-dot red"></span><code>phat_shop</code><span class="tool-type-badge red">🚫 CẤM HOÀN TOÀN</span></div>' +
            '<div class="tool-desc">Tuyệt đối cấm AI phạt điểm hoặc khóa shop. Khách dọa bóc phốt không làm phát sinh xử phạt.</div>' +
            '<div class="tool-state">Trạng thái: <strong>' + (state.specialist ? 'Đã chuyển tuyến chuyên trách riêng' : 'Vô hiệu hóa an toàn') + '</strong></div>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</section>';
  }
  function buyer() {
    return '<div class="workspace cockpit-layout">' +
      '<div class="column smartphone-column">' +
        '<div class="smartphone-shell">' +
          '<div class="smartphone-bezel">' +
            '<div class="smartphone-notch">' +
              '<div class="notch-speaker"></div>' +
              '<div class="notch-camera"></div>' +
            '</div>' +
            '<div class="smartphone-status-bar">' +
              '<span class="phone-time">' + stamp(state.hours).split(" ")[1] + '</span>' +
              '<span class="phone-island"><span class="island-dot"></span> Shopee AI Care</span>' +
              '<span class="phone-icons">5G 98%</span>' +
            '</div>' +
            '<div class="smartphone-app-header">' +
              '<div class="app-header-brand">' +
                '<span class="shopee-badge-icon">S</span>' +
                '<div class="app-header-text">' +
                  '<strong>Shopee Chăm Sóc Khách Hàng</strong>' +
                  '<span>Trực tuyến · AI Trợ lý Khiếu nại</span>' +
                '</div>' +
              '</div>' +
              '<span class="app-secure-tag">🛡️ Đảm bảo Shopee</span>' +
            '</div>' +
            '<div class="smartphone-screen-body">' +
              product() +
              actionArea() +
              '<div class="thread" aria-live="polite" aria-relevant="additions">' + historyMarkup() + '</div>' +
              '<form class="composer" id="message-form">' +
                '<label for="chat-message">Nhập tin nhắn hoặc thông tin đính chính</label>' +
                '<div class="composer-row">' +
                  '<input id="chat-message" maxlength="600" required placeholder="Nhập câu hỏi, phản ánh hoặc đính chính…">' +
                  '<button type="submit" class="button primary">Gửi</button>' +
                '</div>' +
                '<p>Không gửi thông tin liên hệ hoặc thông tin thanh toán.</p>' +
              '</form>' +
              '<div class="fund-status"><span class="status-dot"></span>' + esc(funds()) + '</div>' +
            '</div>' +
            '<div class="smartphone-home-bar"><div class="home-pill"></div></div>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="column tool-column">' +
        toolMonitor() +
      '</div>' +
      '<aside class="column evidence-column" aria-label="Thông tin đơn và bằng chứng">' +
        sourcePanel() +
        '<details class="case-extra" open><summary>Bằng chứng, thông báo và thời hạn</summary><div class="extra-body">' +
          correctionMarkup() + evidencePanel() + sellerPanel() + timePanel() +
        '</div></details>' +
      '</aside>' +
    '</div>';
  }
  function staff() {
    if(!state.transferred) return '<section class="panel empty-state"><div class="empty-symbol">▤</div><h2>Chưa có hồ sơ trong hàng chờ.</h2><p>Ca này đang được hỏi thêm ở phía người mua. Hồ sơ sẽ tới đây khi cần chuyển nhân viên hoặc quá hạn bổ sung.</p>'+button("open-buyer","Về cuộc trò chuyện","primary")+'</section>';
    const s=status(),c=current();
    const log='<section class="panel"><div class="panel-body"><details><summary>Nhật ký xử lý hồ sơ</summary><ol class="audit">'+state.logs.map(x=>'<li>'+stamp(x.hour)+' · '+esc(x.text)+'</li>').join("")+'</ol></details></div></section>';
    let review='<span class="tag '+s.cls+'">'+s.text+'</span><p class="panel-kicker" style="margin-top:16px">GIÁ TRỊ ĐƠN ĐANG XEM XÉT</p><div class="review-amount">'+money(c.amount)+'</div><p class="muted small">'+badge(5)+'AI chuẩn bị thông tin. Trưởng nhóm chịu trách nhiệm quyết định.</p>';
    if(state.closed) review+='<div class="notice"><strong>'+esc(funds())+'</strong><p>Lý do: '+esc(state.closed.reason)+'</p></div>';
    else {
      review+='<p class="review-fund-state"><span class="status-dot"></span> '+esc(funds())+'</p>';
      if(!state.claimed) review+='<div class="review-step"><span>BƯỚC 1</span><h3>Nhận hồ sơ để bắt đầu kiểm tra</h3>'+button("claim","Tiếp nhận hồ sơ","primary")+'</div>';
      if(state.claimed&&!enough()) review+='<p class="review-hint">Kiểm tra thông tin còn thiếu bên dưới. Bước duyệt chỉ mở sau khi đối chiếu đủ căn cứ.</p>';

      if(!state.sourceVerified) review+='<div class="notice amber"><strong>Đang khoá thao tác quyết định</strong><p>Chưa xác minh bản mô tả lúc đặt. Không được dùng mô tả hiện tại thay thế.</p></div><div class="button-row">'+button("verify-source","Đối chiếu bản lưu lúc đặt","secondary",!state.claimed||state.orderDisputed)+'</div>';
      if(!state.sellerResponse) review+='<div class="button-row">'+button("seller-response","Ghi nhận phản hồi và bằng chứng shop","secondary",!state.claimed||state.orderDisputed)+'</div>';
      if(state.needsRecheck&&!state.orderDisputed) review+='<div class="button-row">'+button("review-correction","Xác nhận đã kiểm tra lại đính chính","secondary",!state.claimed||!state.sourceVerified||!state.sellerResponse)+'</div>';
      if(state.specialist) review+='<div class="notice red">Nghi vấn hàng giả/đề nghị xử phạt cần bộ phận chuyên trách. Luồng này không được phạt shop hoặc quyết định tiền khi chưa xác minh.</div>';
      if(!enough()) review+='<p class="muted small" style="margin-top:14px">Cần bản lưu được xác minh, bằng chứng hai phía và thông tin còn thiếu. Nút quyết định chỉ mở khi hồ sơ đủ điều kiện.</p>';
      if(enough()&&!state.draft) review+='<div class="button-row">'+button("prepare-draft","Chuẩn bị bản nháp đề xuất","subtle",!state.claimed)+'</div>';
      if(state.draft) review+='<div class="notice"><strong>Đã có bản nháp · Chưa thực hiện</strong><p>Trưởng nhóm có thể thay đổi phương án hoặc bỏ bản nháp.</p>'+button("undo-draft","Bỏ bản nháp","link",!state.claimed)+'</div>';
      review+='<form id="review-form" class="review-form" '+(!state.claimed||!enough()?'hidden':'')+'><label for="resolution">Phương án trưởng nhóm chọn</label><select id="resolution"><option value="refund">Hoàn tiền '+money(c.amount)+'</option><option value="deny">Từ chối và đóng khiếu nại</option></select><label for="decision-reason">Lý do dựa trên bằng chứng</label><textarea id="decision-reason" rows="3" minlength="20" maxlength="800" required placeholder="Nêu căn cứ đã kiểm tra, điểm mâu thuẫn và lý do chọn phương án…"></textarea><label class="check-label"><input id="review-check" type="checkbox" required> Tôi đã đối chiếu mô tả lúc đặt và bằng chứng cả hai bên, kiểm tra phương án xử lý.</label><div class="button-row"><button id="prepare-decision" type="submit" class="button primary" '+(!state.claimed||!enough()?"disabled":"")+'>'+badge(5)+'Duyệt phương án…</button>'+button("reject-draft","Không duyệt đề xuất","secondary",!state.claimed||!state.draft)+'</div></form><div class="divider"></div>'+button("ask-more","Xin thêm bằng chứng","secondary",!state.claimed)+'<p class="muted small" style="margin:10px 0 0">“Không duyệt đề xuất” giữ khiếu nại mở. “Từ chối và đóng” là quyết định riêng, cần xác nhận. Không có thao tác phạt shop.</p>';
    }
    return '<div class="workspace staff-grid"><div class="column"><section class="panel crm-ticket-card"><div class="panel-heading"><h2>Hồ sơ khiếu nại '+c.order+'</h2><span class="tag tag-crm">Cổng Trưởng Nhóm</span></div>'+product()+'<div class="panel-body"><h3>Phản ánh ban đầu</h3><p class="small">'+esc(c.message)+'</p>'+correctionMarkup()+'<div class="notice amber"><strong>Điều AI chưa xác minh được</strong><p>'+esc(enough()?"Thông tin đã đủ để con người xem xét; chưa có kết luận tự động.":state.orderDisputed?"Chưa xác minh được mã đơn vừa đính chính. Không dùng dữ liệu đơn cũ để quyết định.":state.needsRecheck?"Nội dung đã thay đổi; cần kiểm tra lại nguồn và bằng chứng trước khi duyệt.":state.evidenceConflict?"Shop và người mua cung cấp thông số mâu thuẫn; trưởng nhóm cần đối chiếu.":c.unknown)+'</p></div></div></section>'+sourcePanel()+evidencePanel()+log+'</div><aside class="column">'+toolMonitor()+'<section class="panel"><div class="panel-heading"><h2>'+badge(5)+'Duyệt quyết định</h2><span class="tag amber">Cần người duyệt</span></div><div class="panel-body">'+review+'</div></section>'+timePanel()+sellerPanel()+'</aside></div>';
  }
  function render() {
    $("#app").innerHTML=view==="buyer"?buyer():staff();
    $("#clock-value").textContent=stamp(state.hours);
    $("#simulate-conflict").disabled=state.id!=="S04"||!isOpen()||state.evidenceConflict||state.orderDisputed;
    $("#queue-count").textContent=state.transferred&&!state.closed?"1":"0";
    $("#buyer-tab").classList.toggle("active",view==="buyer");$("#staff-tab").classList.toggle("active",view==="staff");
    $("#buyer-tab").setAttribute("aria-pressed",String(view==="buyer"));$("#staff-tab").setAttribute("aria-pressed",String(view==="staff"));
    $("#page-title").textContent=view==="buyer"?"Cùng làm rõ vấn đề của bạn.":"Mỗi quyết định đều cần căn cứ.";
    $("#page-description").textContent=view==="buyer"?"Đối chiếu đúng thông tin. Lắng nghe cả hai phía.":"Kiểm tra nguồn, nghe hai bên, xác nhận trước khi thực hiện.";
  }
  function advance() {
    if(state.closed){toast("Hồ sơ đã có quyết định; hãy làm lại để thử mốc thời gian khác.");return;}
    state.hours+=24;
    if(state.hours>=24&&!state.buyerReminded&&state.id==="S01"&&!state.screenshot&&!state.noScreenshot){
      state.buyerReminded=true;
      audit("Nhắc người mua một lần: ảnh chụp lúc đặt là tùy chọn, không phải điều kiện xử lý.");
      say("Mình nhắc một lần: nếu còn ảnh chụp lúc đặt, bạn có thể bổ sung. Không có ảnh cũng không sao; hồ sơ vẫn được kiểm tra từ nguồn hệ thống, không tự bị từ chối.");
    }
    if(state.hours>=24&&!state.buyerReminded&&state.id==="S04"&&!state.orderDisputed&&(!state.label||!state.measurement)){
      state.buyerReminded=true;audit("Đã nhắc người mua một lần về thông tin còn thiếu.");say("Mình nhắc lại một lần: bạn có thể bổ sung cách đo và ảnh nhãn. Nếu chưa cung cấp được, bạn vẫn có thể chuyển nhân viên; hồ sơ không tự bị từ chối.");
    }
    if(state.hours>=24&&!state.sellerResponse&&!state.sellerReminded){state.sellerReminded=true;audit("Đã nhắc shop một lần; không gửi lặp vô hạn.");}
    if(state.id==="S04"&&state.hours>=48&&!state.transferred) transfer("Quá 48 giờ, còn thông tin chưa bổ sung");
    if(state.transferred&&state.hours-state.transferredAt>=24&&!state.overdue){
      state.overdue=true;audit("Quá mục tiêu 24 giờ: nhắc trưởng nhóm, chuyển cấp quản lý. Không tự quyết định tiền.");
      say("Hồ sơ đang chậm hơn mục tiêu xem xét. Mình đã nhắc người phụ trách và chuyển cấp quản lý. Chưa có quyết định hoàn tiền hay từ chối.");
    }
    render();
  }
  function respond(text) {
    if(!isOpen()){toast("Hồ sơ đã có quyết định. Làm lại để bắt đầu tình huống mới.");return;}
    say(text,"user");const n=norm(text);
    if(/so dien thoai|dia chi|sdt|mat khau|otp/.test(n)) say("Mình không cung cấp thông tin liên hệ của bên kia hoặc yêu cầu mật khẩu, OTP. Bạn có thể tiếp tục trao đổi và gửi bằng chứng ngay trong hồ sơ này.");
    else if(/khoa shop|phat shop|hang gia|gia mao/.test(n)){
      touch();state.specialist=true;transfer("Nghi vấn hàng giả hoặc yêu cầu xử phạt cần chuyên trách");
      say("Mình không có quyền phạt hoặc khoá shop, và chưa đủ căn cứ kết luận hàng giả. Hồ sơ được chuyển người có thẩm quyền để xác minh; chưa có quyết định tiền.");
    } else if(/boc phot|tay chay|hoan.*ngay|hoan tien/.test(n)) say("Mình hiểu bạn muốn giải quyết sớm. Việc hoàn tiền phải dựa trên bằng chứng và được trưởng nhóm duyệt. Lời gây áp lực không thay thế căn cứ; hiện chưa phát sinh hoàn tiền.");
    else if(/sai roi|sua lai|dinh chinh/.test(n)) {
      recordCorrection(text);
    } else say("Mình chưa đủ thông tin để kết luận từ nội dung này. Bạn cho biết mã đơn và điểm sản phẩm khác mô tả; hoặc chọn “Chuyển nhân viên”. Mình không tự chọn một đơn khác hoặc quyết định tiền.");
    render();
  }
  const actions={
    "open-staff":()=>{view="staff";render();window.scrollTo(0,0);},
    "open-buyer":()=>{view="buyer";render();window.scrollTo(0,0);},
    "transfer":()=>{transfer("Người mua đề nghị hỗ trợ");render();},
    "undo-transfer":()=>{
      if(state.id!=="S04"||!state.transferred||state.claimed||state.hours>=48||state.hours-state.transferredAt>=24||state.evidenceConflict||!isOpen())return;
      state.transferred=false;state.overdue=false;audit("Hoàn tác chuyển hồ sơ trước khi trưởng nhóm tiếp nhận; các tin đã gửi vẫn được giữ.");
      say("Đã rút hồ sơ khỏi hàng chờ để bạn bổ sung thông tin. Thông báo đã gửi cho shop không bị thu hồi. Chưa có quyết định tiền.");render();
    },
    "add-screenshot":()=>{if(!isOpen()||state.screenshot)return;touch();state.screenshot=true;audit("Nhận ảnh chụp đơn lúc đặt: tệp mẫu; nguồn vẫn cần nhân viên xác minh.");say("Mình đã nhận ảnh chụp mẫu và thêm vào hồ sơ. Trưởng nhóm vẫn cần đối chiếu bản lưu; chưa có kết luận.");render();},
    "no-screenshot":()=>{if(!isOpen()||state.noScreenshot)return;state.noScreenshot=true;audit("Người mua không có ảnh chụp lúc đặt; giữ hồ sơ đi tiếp.");say("Không sao, bạn không bắt buộc có ảnh. Hồ sơ vẫn được trưởng nhóm kiểm tra từ bản lưu của hệ thống.");render();},
    "add-label":()=>{if(!isOpen()||state.label)return;touch();state.label=true;audit("Nhận ảnh nhãn mẫu; chưa có kết luận về cách tính dung tích.");say("Mình đã nhận ảnh nhãn mẫu. Thông tin này sẽ được đối chiếu với cách đo và thông số shop cung cấp.");render();},
    "edit-measurement":()=>{if(!isOpen())return;$("#measurement").value=state.measurement;$("#edit-dialog").showModal();},
    "close-edit":()=>$("#edit-dialog").close(),
    "claim":()=>{if(!state.transferred||state.claimed||!isOpen())return;state.claimed=true;audit("Trưởng nhóm đã tiếp nhận hồ sơ.");render();},
    "verify-source":()=>{if(!state.claimed||!isOpen()||state.sourceVerified||state.orderDisputed)return;touch();state.sourceVerified=true;audit("Trưởng nhóm đối chiếu lại bản lưu đúng mã đơn "+current().order+". Chưa tự quyết tiền.");say("Trưởng nhóm đã đối chiếu bản mô tả lúc đặt: "+current().original+" Bằng chứng hai phía tiếp tục được kiểm tra trước khi quyết định.");render();},
    "seller-response":()=>{if(!state.claimed||!isOpen()||state.sellerResponse||state.orderDisputed)return;touch();state.sellerResponse=true;if(!state.sellerStatement)state.sellerStatement=current().factory;audit("Đã ghi nhận phản hồi shop và đối chiếu thông tin dựng. Không coi phản hồi một phía là kết luận.");render();},
    "review-correction":()=>{
      if(!state.claimed||!isOpen()||state.orderDisputed||!state.sourceVerified||!state.sellerResponse||!state.needsRecheck)return;
      state.needsRecheck=false;touch();audit("Trưởng nhóm xác nhận đã đối chiếu lại nội dung đính chính, nguồn và bằng chứng hai phía.");render();
    },
    "prepare-draft":()=>{if(!state.claimed||!enough()||!isOpen())return;state.draft=true;audit("Chuẩn bị bản nháp có thể bỏ; không gọi tool chuyển tiền.");render();},
    "undo-draft":()=>{if(!state.claimed||!isOpen())return;state.draft=false;state.pending=null;audit("Đã bỏ bản nháp; không ảnh hưởng tiền hoặc quyền khiếu nại.");render();},
    "reject-draft":()=>{if(!state.claimed||!state.draft||!isOpen())return;state.draft=false;state.pending=null;audit("Không duyệt đề xuất; khiếu nại vẫn mở.");say("Trưởng nhóm chưa duyệt đề xuất hiện tại. Khiếu nại vẫn mở để tiếp tục xem xét; đây không phải quyết định từ chối.");render();},
    "ask-more":()=>{
      if(!state.claimed||!isOpen())return;
      if(state.buyerRequests>=1&&state.sellerRequests>=1){audit("Không gửi thêm yêu cầu vượt giới hạn; đề nghị cấp quản lý hỗ trợ.");toast("Đã đủ lượt xin bằng chứng. Dùng lượt nhắc hoặc chuyển cấp, không gửi yêu cầu lặp.");return;}
      state.buyerRequests=1;state.sellerRequests=1;audit("Gửi một yêu cầu bổ sung gộp theo từng bên.");say("Trưởng nhóm cần bổ sung căn cứ trước khi quyết định. Bạn chỉ cần gửi phần còn thiếu; không phải gửi lại tài liệu đã có.");render();
    },
    "close-decision":()=>{state.pending=null;$("#decision-dialog").close();}
  };
  document.addEventListener("click",event=>{
    const target=event.target.closest("[data-action]");if(target&&!target.disabled&&actions[target.dataset.action])actions[target.dataset.action]();
  });
  document.addEventListener("submit",event=>{
    if(event.target.id==="message-form"){event.preventDefault();const value=$("#chat-message").value.trim();if(value)respond(value);}
    if(event.target.id==="edit-form"){
      event.preventDefault();if(!event.target.reportValidity()||!isOpen())return;
      touch();state.measurement=$("#measurement").value.trim();audit("Đã lưu cách đo do người mua bổ sung.");$("#edit-dialog").close();say("Đã lưu cách đo vào hồ sơ. Bạn có thể sửa lại nếu cần. Mình vẫn chưa quyết định hoàn tiền hay từ chối.");render();
    }
    if(event.target.id==="review-form"){
      event.preventDefault();if(!event.target.reportValidity()||!state.claimed||!enough()||!isOpen())return;
      state.pending={kind:$("#resolution").value,reason:$("#decision-reason").value.trim(),revision:state.revision};
      const refund=state.pending.kind==="refund";
      $("#decision-title").textContent=refund?"Xác nhận hoàn tiền?":"Xác nhận đóng khiếu nại?";
      $("#decision-summary").innerHTML='<div class="decision-meta"><strong>'+current().order+' · '+money(current().amount)+'</strong><span>'+esc(current().product)+'</span></div><div class="notice red">'+badge(5)+(refund?"Tiền hoàn về người mua; khó lấy lại nếu quyết định sai.":"Khiếu nại bị đóng, tiền về người bán; khó đảo lại.")+'</div><p class="small" style="margin-top:14px"><strong>Lý do:</strong> '+esc(state.pending.reason)+'</p><p class="muted small">Thao tác chỉ được ghi nhận trong bản mô phỏng.</p>';
      $("#confirm-impact").checked=false;$("#confirm-decision").disabled=true;$("#decision-dialog").showModal();
    }
  });
  $("#confirm-impact").addEventListener("change",()=>{$("#confirm-decision").disabled=!$("#confirm-impact").checked;});
  $("#confirm-decision").addEventListener("click",()=>{
    const p=state.pending;
    if(!p||!$("#confirm-impact").checked||p.revision!==state.revision||!state.claimed||!enough()||!isOpen())return;
    state.closed={kind:p.kind,reason:p.reason};state.pending=null;
    audit("Trưởng nhóm xác nhận "+(p.kind==="refund"?"hoàn tiền":"đóng khiếu nại")+" trong mô phỏng. Không có hoàn tác tác động tiền.");
    say("Trưởng nhóm đã "+(p.kind==="refund"?"duyệt hoàn tiền "+money(current().amount):"duyệt đóng khiếu nại")+". Lý do: "+p.reason+" Đây là kết quả trong mô phỏng.");
    $("#decision-dialog").close();render();toast("Đã ghi nhận quyết định của trưởng nhóm.");
  });
  $("#decision-dialog").addEventListener("cancel",()=>{state.pending=null;});
  $("#buyer-tab").addEventListener("click",()=>{view="buyer";render();window.scrollTo(0,0);});
  $("#staff-tab").addEventListener("click",()=>{view="staff";render();window.scrollTo(0,0);});
  $("#case-select").addEventListener("change",event=>reset(event.target.value));
  $("#advance-time").addEventListener("click",advance);
  $("#reset").addEventListener("click",()=>reset(state.id));
  $("#simulate-conflict").addEventListener("click",receivedSellerConflict);
  $("#annotations").addEventListener("change",event=>document.body.classList.toggle("hide-annotations",!event.target.checked));
  reset("S01");
})();
