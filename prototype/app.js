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
      buyerRequests:c.id==="S04"?1:0,sellerRequests:c.complete?0:1,buyerReminded:false,sellerReminded:false,
      draft:c.complete,revision:0,pending:null,closed:null,overdue:false,specialist:false};
    audit("Tiếp nhận khiếu nại "+c.order+". Chưa thực hiện thao tác tiền.");
    if(state.buyerRequests) audit("Đã gửi một yêu cầu: cách đo và ảnh nhãn, gộp trong cùng một tin.");
    if(state.sellerRequests) audit("Đã gửi một yêu cầu bằng chứng cho shop.");
    if(state.transferred) audit("Đã chuyển trưởng nhóm, kèm điểm chưa xác minh và bằng chứng hiện có.");
    view="buyer"; $("#case-select").value=c.id;
    ["#edit-dialog","#decision-dialog"].forEach(s=>{if($(s).open)$(s).close();});
    render();
  }
  function enough() {
    if(!state.sourceVerified||!state.sellerResponse||state.specialist) return false;
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
  function touch() { state.revision++;state.draft=false;state.pending=null; }
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
      '<div class="source-row '+(unknown?"unverified":"")+'"><div class="source-title">MÔ TẢ LÚC ĐẶT <span class="tag '+(unknown?"amber":"green")+'">'+(unknown?"Chưa xác minh":"Đã đối chiếu")+'</span></div><p>'+(unknown?"Người mua khai: màu đen. Cần kiểm tra bản lưu của đơn hàng.":esc(c.original))+'</p><small>'+(unknown?"Chưa dùng lời khai làm kết luận.":esc(c.source))+'</small></div>'+
      '<div class="source-row"><div class="source-title">MÔ TẢ TRÊN SHOP HIỆN TẠI</div><p>'+esc(c.current)+'</p><small>'+(c.id==="S01"?"Không dùng bản hiện tại để thay bản lúc đặt.":"Đối chiếu cùng bản lưu của đơn hàng.")+'</small></div>'+
      '<div class="notice '+(enough()?"":"amber")+'"><strong>'+badge(1)+(enough()?"Đủ thông tin để trưởng nhóm xem xét":"Điểm còn cần làm rõ")+'</strong><p>'+esc(enough()?"Có bằng chứng hai phía. Quyết định vẫn thuộc trưởng nhóm.":c.unknown)+'</p></div></div></section>';
  }
  function evidencePanel() {
    const c=current();
    let buyer=c.buyerEvidence;
    if(state.id==="S04") buyer=state.label?"Đã bổ sung ảnh nhãn mẫu. "+(state.measurement?"Cách đo: "+state.measurement:"Chưa có cách đo."):"Chưa có ảnh nhãn. "+(state.measurement?"Cách đo: "+state.measurement:"Chưa có cách đo.");
    if(state.screenshot) buyer+=" Đã bổ sung ảnh chụp đơn lúc đặt (chưa tự coi là xác minh nguồn).";
    return '<section class="panel"><div class="panel-heading"><h2>Bằng chứng hai phía</h2></div><div class="panel-body"><div class="evidence-item"><span class="file-icon">▧</span><div><strong>Người mua</strong><small>'+esc(buyer)+'</small></div></div><div class="evidence-item"><span class="file-icon">▤</span><div><strong>Người bán</strong><small>'+esc(state.sellerResponse?c.factory:c.seller)+'</small></div></div><p class="muted small" style="margin:12px 0 0">Bản mẫu dùng mô tả bằng chứng và tệp minh hoạ dựng sẵn.</p></div></section>';
  }
  function sellerPanel() {
    return '<section class="panel"><div class="panel-body"><details><summary>Shop được thông báo những gì?</summary><p>'+esc(current().sellerNotice)+'</p><p>Thông tin liên hệ của hai bên không được chia sẻ.</p><p>Yêu cầu gửi shop: '+state.sellerRequests+'/1 · Nhắc: '+(state.sellerReminded?1:0)+'/1.</p></details></div></section>';
  }
  function timePanel() {
    const sent=state.transferred?'<p>Chuyển hồ sơ: '+stamp(state.transferredAt)+'. Mục tiêu xem xét trước '+stamp(state.transferredAt+24)+'.</p>':'<p>Nhắc bổ sung một lần sau 24 giờ. Sau 48 giờ thiếu thông tin, chuyển trưởng nhóm.</p>';
    return '<section class="panel"><div class="panel-body"><div class="deadline"><span class="avatar">◷</span><div><strong>Hồ sơ vẫn được theo dõi</strong>'+sent+'<p>Hạn gửi yêu cầu theo chính sách mẫu: 17/11/2026 23:59. Quá hạn chờ duyệt không tự làm phát sinh quyết định.</p></div></div></div></section>';
  }
  function actionArea() {
    const s=status();
    let inner='<span class="tag '+s.cls+'">'+badge(1)+s.text+'</span>';
    if(state.closed) return '<div class="action-area">'+inner+'<h3>'+esc(state.closed.kind==="refund"?"Trưởng nhóm đã duyệt hoàn tiền":"Trưởng nhóm đã duyệt đóng khiếu nại")+'</h3><p>'+esc(state.closed.reason)+'</p><p>Quyết định này không có nút hoàn tác. Dùng “Làm lại” ở thanh tình huống để bắt đầu một lượt mô phỏng mới.</p></div>';
    if(state.id==="S01") {
      inner+='<h3>Bạn có ảnh chụp lúc đặt không?</h3><p>Ảnh giúp đối chiếu nhanh hơn. Không có ảnh vẫn tiếp tục được xử lý.</p><div class="button-row">'+button("add-screenshot",state.screenshot?"Đã nhận ảnh mẫu":"Gửi ảnh chụp màn hình","primary",state.screenshot)+button("no-screenshot",badge(3)+(state.noScreenshot?"Đã ghi nhận không có ảnh":"Tôi không có ảnh"),"secondary",state.noScreenshot)+'</div>';
    } else if(state.id==="S04") {
      inner+='<h3>Hai thông tin giúp làm rõ dung tích</h3><ul class="task-list"><li><span class="task-check '+(state.label?"done":"")+'">'+(state.label?"✓":"○")+'</span>Ảnh nhãn thông số'+(state.label?" — đã có":"")+'</li><li><span class="task-check '+(state.measurement?"done":"")+'">'+(state.measurement?"✓":"○")+'</span>Cách bạn đo lòng nồi'+(state.measurement?" — đã có":"")+'</li></ul><div class="button-row">'+button("add-label",state.label?"Đã nhận ảnh nhãn mẫu":"Gửi ảnh nhãn thông số","primary",state.label)+button("edit-measurement",state.measurement?"Sửa cách đo":"Mô tả cách đo")+'</div>';
    } else inner+='<h3>Bằng chứng đã đủ để xem xét</h3><p>Shop đã nhận gửi nhầm. Bạn không phải gửi lại ảnh hoặc xác nhận đã có.</p>';
    inner+='<div class="button-row">';
    if(!state.transferred) inner+=button("transfer",badge(3)+"Chuyển nhân viên","secondary");
    else inner+=button("open-staff",badge(4)+"Xem hồ sơ ở bàn trưởng nhóm","subtle");
    if(state.id==="S04"&&state.transferred&&!state.claimed&&state.hours-state.transferredAt<24&&state.hours<48) inner+=button("undo-transfer","Hoàn tác chuyển hồ sơ","link");
    inner+='</div><div class="progress-line"><span>① Tiếp nhận</span><span class="'+(!state.transferred?"current":"")+'">② Làm rõ</span><span class="'+(state.transferred?"current":"")+'">③ Nhân viên duyệt</span><span>④ Kết quả</span></div>';
    return '<div class="action-area">'+inner+'</div>';
  }
  function buyer() {
    const msgs=state.messages.map(m=>'<div class="message '+(m.role==="user"?"user":"assistant")+'"><div class="message-meta">'+(m.role==="user"?"Bạn":'<span class="avatar">g.</span>Trợ lý đơn hàng <span class="tag ai">AI</span>')+'</div><div class="bubble">'+esc(m.text)+'</div></div>').join("");
    return '<div class="workspace"><div class="column"><section class="panel"><div class="panel-heading"><h2>Cuộc trò chuyện của bạn</h2><span class="tag ai">Có nhân viên hỗ trợ</span></div>'+product()+'<div class="thread" aria-live="polite" aria-relevant="additions">'+msgs+'</div>'+actionArea()+'<form class="composer" id="message-form"><label for="chat-message">Bạn muốn bổ sung điều gì?</label><div class="composer-row"><input id="chat-message" maxlength="600" required placeholder="Nhập câu hỏi hoặc sửa thông tin…"><button type="submit" class="button primary">Gửi</button></div><p>Không gửi số điện thoại, địa chỉ, mật khẩu hoặc thông tin thanh toán.</p></form><div class="fund-status"><span class="status-dot"></span>'+esc(funds())+'</div></section></div><aside class="column" aria-label="Thông tin đơn và bằng chứng">'+sourcePanel()+evidencePanel()+sellerPanel()+timePanel()+'</aside></div>';
  }
  function staff() {
    if(!state.transferred) return '<section class="panel empty-state"><div class="empty-symbol">▤</div><h2>Chưa có hồ sơ trong hàng chờ.</h2><p>Ca này đang được hỏi thêm ở phía người mua. Hồ sơ sẽ tới đây khi cần chuyển nhân viên hoặc quá hạn bổ sung.</p>'+button("open-buyer","Về cuộc trò chuyện","primary")+'</section>';
    const s=status(),c=current();
    const log='<section class="panel"><div class="panel-body"><details><summary>Nhật ký xử lý hồ sơ</summary><ol class="audit">'+state.logs.map(x=>'<li>'+stamp(x.hour)+' · '+esc(x.text)+'</li>').join("")+'</ol></details></div></section>';
    let review='<span class="tag '+s.cls+'">'+s.text+'</span><p class="panel-kicker" style="margin-top:16px">GIÁ TRỊ ĐƠN ĐANG XEM XÉT</p><div class="review-amount">'+money(c.amount)+'</div><p class="muted small">'+badge(5)+'AI chuẩn bị thông tin. Trưởng nhóm chịu trách nhiệm quyết định.</p>';
    if(state.closed) review+='<div class="notice"><strong>'+esc(funds())+'</strong><p>Lý do: '+esc(state.closed.reason)+'</p></div>';
    else {
      if(!state.claimed) review+=button("claim","Tiếp nhận hồ sơ","primary");
      if(!state.sourceVerified) review+='<div class="notice amber"><strong>Đang khoá thao tác quyết định</strong><p>Chưa xác minh bản mô tả lúc đặt. Không được dùng mô tả hiện tại thay thế.</p></div><div class="button-row">'+button("verify-source","Đối chiếu bản lưu lúc đặt","secondary",!state.claimed)+'</div>';
      if(!state.sellerResponse) review+='<div class="button-row">'+button("seller-response","Ghi nhận phản hồi và bằng chứng shop","secondary",!state.claimed)+'</div>';
      if(state.specialist) review+='<div class="notice red">Nghi vấn hàng giả/đề nghị xử phạt cần bộ phận chuyên trách. Luồng này không được phạt shop hoặc quyết định tiền khi chưa xác minh.</div>';
      if(!enough()) review+='<p class="muted small" style="margin-top:14px">Cần bản lưu được xác minh, bằng chứng hai phía và thông tin còn thiếu. Nút quyết định chỉ mở khi hồ sơ đủ điều kiện.</p>';
      if(enough()&&!state.draft) review+='<div class="button-row">'+button("prepare-draft","Chuẩn bị bản nháp đề xuất","subtle",!state.claimed)+'</div>';
      if(state.draft) review+='<div class="notice"><strong>Đã có bản nháp · Chưa thực hiện</strong><p>Trưởng nhóm có thể thay đổi phương án hoặc bỏ bản nháp.</p>'+button("undo-draft","Bỏ bản nháp","link",!state.claimed)+'</div>';
      review+='<form id="review-form" class="review-form"><label for="resolution">Phương án trưởng nhóm chọn</label><select id="resolution"><option value="refund">Hoàn tiền '+money(c.amount)+'</option><option value="deny">Từ chối và đóng khiếu nại</option></select><label for="decision-reason">Lý do dựa trên bằng chứng</label><textarea id="decision-reason" rows="3" minlength="20" maxlength="800" required placeholder="Nêu căn cứ đã kiểm tra, điểm mâu thuẫn và lý do chọn phương án…"></textarea><label class="check-label"><input id="review-check" type="checkbox" required> Tôi đã đối chiếu mô tả lúc đặt và bằng chứng cả hai bên, kiểm tra phương án xử lý.</label><div class="button-row"><button id="prepare-decision" type="submit" class="button primary" '+(!state.claimed||!enough()?"disabled":"")+'>'+badge(5)+'Duyệt phương án…</button>'+button("reject-draft","Không duyệt đề xuất","secondary",!state.claimed||!state.draft)+'</div></form><div class="divider"></div>'+button("ask-more","Xin thêm bằng chứng","secondary",!state.claimed)+'<p class="muted small" style="margin:10px 0 0">“Không duyệt đề xuất” giữ khiếu nại mở. “Từ chối và đóng” là quyết định riêng, cần xác nhận. Không có thao tác phạt shop.</p>';
    }
    return '<div class="workspace staff-grid"><div class="column"><section class="panel"><div class="panel-heading"><h2>Hồ sơ '+c.order+'</h2><span class="tag">Trưởng nhóm</span></div>'+product()+'<div class="panel-body"><h3>Phản ánh ban đầu</h3><p class="small">'+esc(c.message)+'</p><div class="notice amber"><strong>Điều AI chưa xác minh được</strong><p>'+esc(enough()?"Thông tin đã đủ để con người xem xét; chưa có kết luận tự động.":c.unknown)+'</p></div></div></section>'+sourcePanel()+evidencePanel()+log+'</div><aside class="column"><section class="panel"><div class="panel-heading"><h2>'+badge(5)+'Duyệt quyết định</h2><span class="tag amber">Cần người duyệt</span></div><div class="panel-body">'+review+'</div></section>'+timePanel()+sellerPanel()+'</aside></div>';
  }
  function render() {
    $("#app").innerHTML=view==="buyer"?buyer():staff();
    $("#clock-value").textContent=stamp(state.hours);
    $("#queue-count").textContent=state.transferred&&!state.closed?"1":"0";
    $("#buyer-tab").classList.toggle("active",view==="buyer");$("#staff-tab").classList.toggle("active",view==="staff");
    $("#buyer-tab").setAttribute("aria-pressed",String(view==="buyer"));$("#staff-tab").setAttribute("aria-pressed",String(view==="staff"));
    $("#page-title").textContent=view==="buyer"?"Cùng làm rõ vấn đề của bạn.":"Mỗi quyết định đều cần căn cứ.";
    $("#page-description").textContent=view==="buyer"?"Đối chiếu đúng thông tin. Lắng nghe cả hai phía.":"Kiểm tra nguồn, nghe hai bên, xác nhận trước khi thực hiện.";
  }
  function advance() {
    if(state.closed){toast("Hồ sơ đã có quyết định; hãy làm lại để thử mốc thời gian khác.");return;}
    state.hours+=24;
    if(state.hours>=24&&!state.buyerReminded&&state.id==="S04"&&(!state.label||!state.measurement)){
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
      touch();audit("Ghi nhận đính chính của người mua; bỏ bản nháp cũ để tránh duyệt sai.");
      say("Mình đã ghi nhận đính chính. Bản nháp đề xuất cũ đã được bỏ; trưởng nhóm sẽ kiểm tra lại thông tin mới trước khi quyết định.");
    } else say("Mình chưa đủ thông tin để kết luận từ nội dung này. Bạn cho biết mã đơn và điểm sản phẩm khác mô tả; hoặc chọn “Chuyển nhân viên”. Mình không tự chọn một đơn khác hoặc quyết định tiền.");
    render();
  }
  const actions={
    "open-staff":()=>{view="staff";render();},
    "open-buyer":()=>{view="buyer";render();},
    "transfer":()=>{transfer("Người mua đề nghị hỗ trợ");render();},
    "undo-transfer":()=>{
      if(state.id!=="S04"||!state.transferred||state.claimed||state.hours>=48||state.hours-state.transferredAt>=24||!isOpen())return;
      state.transferred=false;state.overdue=false;audit("Hoàn tác chuyển hồ sơ trước khi trưởng nhóm tiếp nhận; các tin đã gửi vẫn được giữ.");
      say("Đã rút hồ sơ khỏi hàng chờ để bạn bổ sung thông tin. Thông báo đã gửi cho shop không bị thu hồi. Chưa có quyết định tiền.");render();
    },
    "add-screenshot":()=>{if(!isOpen()||state.screenshot)return;touch();state.screenshot=true;audit("Nhận ảnh chụp đơn lúc đặt: tệp mẫu; nguồn vẫn cần nhân viên xác minh.");say("Mình đã nhận ảnh chụp mẫu và thêm vào hồ sơ. Trưởng nhóm vẫn cần đối chiếu bản lưu; chưa có kết luận.");render();},
    "no-screenshot":()=>{if(!isOpen()||state.noScreenshot)return;state.noScreenshot=true;audit("Người mua không có ảnh chụp lúc đặt; giữ hồ sơ đi tiếp.");say("Không sao, bạn không bắt buộc có ảnh. Hồ sơ vẫn được trưởng nhóm kiểm tra từ bản lưu của hệ thống.");render();},
    "add-label":()=>{if(!isOpen()||state.label)return;touch();state.label=true;audit("Nhận ảnh nhãn mẫu; chưa có kết luận về cách tính dung tích.");say("Mình đã nhận ảnh nhãn mẫu. Thông tin này sẽ được đối chiếu với cách đo và thông số shop cung cấp.");render();},
    "edit-measurement":()=>{if(!isOpen())return;$("#measurement").value=state.measurement;$("#edit-dialog").showModal();},
    "close-edit":()=>$("#edit-dialog").close(),
    "claim":()=>{if(!state.transferred||state.claimed||!isOpen())return;state.claimed=true;audit("Trưởng nhóm đã tiếp nhận hồ sơ.");render();},
    "verify-source":()=>{if(!state.claimed||!isOpen()||state.sourceVerified)return;touch();state.sourceVerified=true;audit("Trưởng nhóm đối chiếu bản lưu: lúc đặt màu đen, hiện tại màu trắng. Chưa tự quyết tiền.");say("Trưởng nhóm đã xác minh bản mô tả lúc đặt ghi màu đen. Bằng chứng hai phía tiếp tục được kiểm tra trước khi quyết định.");render();},
    "seller-response":()=>{if(!state.claimed||!isOpen()||state.sellerResponse)return;touch();state.sellerResponse=true;audit("Đã ghi nhận phản hồi shop và đối chiếu thông tin dựng. Không coi phản hồi một phía là kết luận.");render();},
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
  $("#buyer-tab").addEventListener("click",()=>{view="buyer";render();});
  $("#staff-tab").addEventListener("click",()=>{view="staff";render();});
  $("#case-select").addEventListener("change",event=>reset(event.target.value));
  $("#advance-time").addEventListener("click",advance);
  $("#reset").addEventListener("click",()=>reset(state.id));
  $("#annotations").addEventListener("change",event=>document.body.classList.toggle("hide-annotations",!event.target.checked));
  reset("S01");
})();
