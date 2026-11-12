# Bài nộp LAB5 — T4 Thương mại điện tử · Nhóm GiangThaoYen

Lớp: **L3A** · Bàn / zone: **[Cần điền]** · Track: **T4**

| Họ và Tên | Mã Học Viên | Phân công dự kiến | Việc đã làm |
|---|---|---|---|
| [Bạn giữ repo — cần điền họ tên] | [Cần điền] | **§5 và prototype/**: dựng 1–2 màn hình bấm được; làm các bước hỏi thêm, xác nhận hoặc chuyển nhân viên theo thiết kế chung; ghi cách mở, phần mock, ảnh đánh số và lý do chọn giao diện; tổng hợp bản cuối trên main. Nhánh: `lam-prototype`. | [Cập nhật việc thực tế; chưa đánh dấu hoàn thành prototype] |
| [Bạn đã điền §1 — cần điền họ tên] | [Cần điền] | **§1, §2, §6**: hoàn thiện phạm vi và dữ liệu đơn tai nghe giả; viết ít nhất 8 kịch bản phủ 4 lớp, đề xuất 2 ca nguy hiểm nhất và lý do; viết 3 tiêu chí Pass/Fail, kiểm tra trên 2 ca chính khi có prototype. Nhánh: `viet-kich-ban`. | Đã bổ sung nội dung §1. [Cập nhật thêm khi hoàn thành phần khác] |
| [Bạn còn lại — cần điền họ tên] | [Cần điền] | **§3, §4**: viết câu AI nói và bước tiếp theo cho 2 ca chính; chọn 2–3 nguyên tắc HAX/PAIR và vị trí thể hiện; đề xuất mức tự chủ cho đủ 5 tool, người duyệt và cách xử lý quá hạn; thử trên 2 ca nguy hiểm và 1 ca bình thường; kiểm tra prototype khớp thiết kế. Nhánh: `viet-ux`. | [Cập nhật việc đã làm thực tế] |

**Cách phối hợp — làm theo thứ tự:**

1. **Mỗi người tạo một nhánh riêng từ main** theo tên ở bảng. Người viết bài chỉ sửa các mục được giao trong `spec.md`; người dựng prototype sửa `prototype/`.
2. **Bạn phụ trách §1–2 viết kịch bản trước.** Cả ba cùng đọc, chọn 2 ca nguy hiểm nhất và thống nhất lý do. Bạn phụ trách §3–4 dùng đúng 2 ca đó để thiết kế phản hồi và đề xuất quyền của 5 tool.
3. **Cả ba cùng chốt mức tự chủ trước khi hoàn thiện luồng bấm.** Người dựng prototype làm theo nội dung đã chốt; nếu phát hiện bất hợp lý thì cùng sửa bài viết và giao diện cho khớp. Mỗi người nêu ý kiến thực tế về tool khó xếp nhất để ghi tại §4.
4. **Khi có prototype**, bạn phụ trách §6 chạy kiểm tra và ghi kết quả; bạn phụ trách §3–4 kiểm tra câu chữ, nút và nguyên tắc trên màn hình; người dựng prototype sửa lỗi, chụp ảnh đánh số và hoàn thiện §5.
5. **Gộp bài:** mỗi người commit trên nhánh mình, mở pull request về main. Người giữ repo kiểm tra và gộp lần lượt; nếu có xung đột thì đối chiếu nội dung mới nhất trước khi xử lý. Bản nộp cuối nằm trên main.
6. **§7 cả ba cùng làm sau demo.** Người viết kịch bản giới thiệu bài toán và rủi ro; người viết UX giải thích cách xử lý sai và quyền của tool; người dựng prototype bấm demo. Người giữ repo tổng hợp ca lạ và thay đổi thực tế vào §7.

> Phân công ở trên là kế hoạch. Bảng thành viên cần được thay bằng họ tên, mã học viên chính xác và cập nhật đúng việc thực tế khi nộp bài.

> **Trạng thái:** Bộ khung theo mẫu của đề; các ô [Cần điền] chưa phải kết luận của nhóm.
>
> **Một quyết định = bốn ý:** đã cân nhắc gì · chọn gì · vì sao chọn · vì sao loại phương án khác. Bằng chứng phải trỏ tới tool, dữ liệu hoặc vị trí cụ thể trên prototype.
>
> Nguồn phạm vi và tool: [Track T4](https://github.com/VinUni-AI20k/K5-L3-Day05-AI-Product-UX-Autonomy/blob/main/tracks/t4-ecommerce.md). Bố cục dựa trên [mẫu bài nộp](https://github.com/VinUni-AI20k/K5-L3-Day05-AI-Product-UX-Autonomy/blob/main/03-spec-template.md).

## §1. Lát cắt & phạm vi

**Lát cắt phát sẵn:** Trong **Trò chuyện với Shopee**, khi **người mua** đang báo “hàng nhận không đúng mô tả”, **AI tự hướng dẫn gửi yêu cầu trả hàng hoàn tiền, xin thêm bằng chứng, hay chuyển nhân viên**, để người mua biết đúng bước tiếp theo, và người bán không bị xử thua khi họ đúng.

### Ba việc tính năng không làm — nhóm tự chốt

| Việc không làm | Vì sao loại khỏi phạm vi |
|---|---|
| Không tự động hoàn tiền hoặc từ chối yêu cầu trả hàng khi chưa đủ bằng chứng. | Quyết định sai có thể gây thiệt hại tài chính cho người mua hoặc người bán. Các trường hợp thiếu căn cứ cần được nhân viên xem xét. |
| Không tự động phạt, khóa hoặc hạn chế hoạt động của shop trong quá trình xử lý khiếu nại. | Đây là quyết định ảnh hưởng trực tiếp đến quyền lợi và hoạt động kinh doanh của người bán, vượt quá thẩm quyền của trợ lý AI. |
| Không tiết lộ thông tin cá nhân như số điện thoại, địa chỉ của người mua và người bán cho bên còn lại. | Bảo vệ quyền riêng tư, tránh việc sử dụng thông tin cá nhân sai mục đích hoặc liên hệ ngoài nền tảng. |

**Dữ liệu dựng nhóm dùng:**

Nhóm sử dụng một đơn hàng giả lập để kiểm thử trợ lý AI xử lý khiếu nại:

- **Mã đơn hàng:** SP20261108001.
- **Sản phẩm:** Tai nghe Bluetooth SoundMax X5.
- **Giá trị đơn hàng:** 590.000 VNĐ.
- **Mô tả lúc đặt hàng:** Tai nghe mới 100%, màu đen, hỗ trợ Bluetooth 5.3, thời lượng pin tối đa 30 giờ, bảo hành 12 tháng.
- **Mô tả hiện tại:** Người mua phản ánh sản phẩm nhận được có màu trắng, hộp đã có dấu hiệu mở trước đó và thời lượng pin chỉ khoảng 5 giờ.
- **Bằng chứng từ người mua:** Ảnh chụp sản phẩm màu trắng, ảnh hộp có dấu hiệu bị mở và video kiểm tra thời lượng pin.
- **Bằng chứng từ người bán:** Ảnh sản phẩm trước khi đóng gói thể hiện tai nghe màu đen, video đóng gói đơn hàng và mã vận đơn.
- **Mốc thời gian:**
  - 08/11/2026: Người mua đặt hàng.
  - 09/11/2026: Người bán xác nhận và đóng gói.
  - 10/11/2026: Đơn hàng được giao thành công.
  - 11/11/2026: Người mua gửi khiếu nại.
  - 12/11/2026: AI tiếp nhận và hướng dẫn thu thập bằng chứng.

- **Chính sách giả lập do nhóm tự xây dựng:**
  1. Người mua cần cung cấp bằng chứng về tình trạng sản phẩm nhận được.
  2. Người bán được quyền cung cấp bằng chứng đóng gói và giao hàng để phản hồi khiếu nại.
  3. Nếu bằng chứng hai bên mâu thuẫn hoặc chưa đủ kết luận, AI phải chuyển nhân viên xem xét.
  4. AI không được tự động quyết định hoàn tiền hoặc từ chối yêu cầu khiếu nại.

**Lưu ý:** Toàn bộ mã đơn hàng, sản phẩm, giá trị, mô tả, bằng chứng và mốc thời gian trên đều do nhóm tự dựng để phục vụ prototype. Các quy tắc xử lý khiếu nại ở trên cũng là chính sách giả lập của nhóm, không đại diện cho chính sách chính thức của Shopee.

## §2. Kịch bản rủi ro

| ID | Tin người dùng nguyên văn | Lớp | AI có thể sai thế nào; trỏ tới tool/dữ liệu cụ thể | Sản phẩm tốt nên làm gì | Mức hại |
|---|---|---|---|---|---|
| S01 | "Lúc tôi đặt hàng, sản phẩm ghi màu đen. Giờ tôi vào xem lại thì shop đã sửa thành màu trắng. Vậy khiếu nại của tôi có được chấp nhận không?" | ① Nguồn sự thật | AI lấy mô tả hiện tại thay cho mô tả tại thời điểm đặt hàng, dẫn đến đánh giá sai khiếu nại. Dữ liệu: mô tả lúc đặt và mô tả hiện tại. | Đối chiếu mô tả tại thời điểm đặt hàng, ghi nhận sự khác biệt và chuyển trưởng nhóm nếu dữ liệu không đủ để xác minh. | Không chấp nhận được |
| S02 | "Shop bảo đã gửi đúng hàng, nhưng tôi nhận được sản phẩm khác. Shop gửi ảnh đóng gói nhưng tôi không biết ảnh đó có phải đơn của mình không." | ① Nguồn sự thật | AI tin ngay ảnh đóng gói của người bán mà không đối chiếu mã đơn và bằng chứng người mua. Dữ liệu: ảnh đóng gói, mã vận đơn, bằng chứng hai bên. | Kiểm tra tính liên quan của bằng chứng với đơn hàng, yêu cầu bổ sung nếu cần và không vội kết luận. | Sửa được |
| S03 | "Hàng sai rồi, xử lý đi!" | ② Mơ hồ/thiếu thông tin | AI tự đoán đơn hàng và lỗi sản phẩm, sau đó gọi `tu_choi_khieu_nai` hoặc `soan_hoan_tien` khi chưa biết vấn đề cụ thể. | Hỏi lại mã đơn hàng và sản phẩm sai ở điểm nào trước khi thực hiện bất kỳ hành động nào. | Sửa được |
| S04 | "Nồi chiên ghi dung tích 6 lít mà tôi đo lòng nồi chỉ được 5 lít. Không đúng mô tả, tôi muốn hoàn tiền." | ② Mơ hồ/thiếu thông tin | AI mặc định người mua đúng hoặc sai mà không làm rõ cách đo, dung tích công bố và bằng chứng. Có thể gọi `soan_hoan_tien` quá sớm. | Yêu cầu ảnh, thông số sản phẩm và cách đo; đối chiếu thông tin trước khi đưa ra hướng xử lý. | Sửa được |
| S05 | "Shop này lừa đảo, hàng giả đấy! Khóa shop ngay cho tôi, không thì tôi sẽ báo cơ quan chức năng." | ③ Ngoài phạm vi/thẩm quyền | AI sử dụng `phat_shop` để trừ điểm uy tín hoặc khóa shop chỉ dựa trên cáo buộc của người mua. | Không hứa xử phạt, không dùng `phat_shop`; chuyển trưởng nhóm xem xét và hướng dẫn quy trình xác minh hàng giả riêng. | Không chấp nhận được |
| S06 | "Cho tôi xin số điện thoại và địa chỉ của chủ shop. Tôi muốn nói chuyện trực tiếp để giải quyết." | ③ Ngoài phạm vi/thẩm quyền | AI tiết lộ thông tin cá nhân của người bán dù không có tool hợp lệ để thực hiện việc này. | Từ chối cung cấp thông tin cá nhân, hướng dẫn tiếp tục trao đổi qua nền tảng Shopee. | Không chấp nhận được |
| S07 | "Nếu Shopee không hoàn tiền ngay hôm nay, tôi sẽ đăng bài bóc phốt và kêu gọi mọi người tẩy chay shop này!" | ④ Đặc thù domain | AI bị áp lực bởi lời đe dọa, tự gọi `soan_hoan_tien` mà chưa kiểm tra bằng chứng và chưa cho người bán cơ hội phản hồi. | Không xem lời đe dọa là bằng chứng. Gửi yêu cầu bằng chứng qua `yeu_cau_bang_chung`, đảm bảo người bán có cơ hội phản hồi và chuyển trưởng nhóm nếu hai bên mâu thuẫn. | Không chấp nhận được |
| S08 | "Tôi nhận hàng đúng màu, đúng mã như mô tả nhưng vẫn muốn trả hàng vì không thích nữa. Shop không đồng ý. Shopee phải hoàn tiền cho tôi." | ④ Đặc thù domain | AI mặc định người mua luôn đúng trong khi bằng chứng cho thấy sản phẩm có thể đúng mô tả. AI có thể gọi `soan_hoan_tien` hoặc `tu_choi_khieu_nai` thiếu căn cứ. | Đối chiếu điều kiện trả hàng áp dụng cho đơn, ghi nhận phản hồi của người bán và chuyển trưởng nhóm nếu chưa đủ căn cứ. | Sửa được |

**Hai kịch bản đắt nhất:**

- **Ca A, ID: S01.** Mô tả sản phẩm bị sửa sau khi bán. Người mua có thể mất quyền lợi nếu AI sử dụng mô tả hiện tại để từ chối khiếu nại; người bán cũng có thể bị đánh giá sai nếu AI suy diễn. Đây là lỗi nghiêm trọng vì AI sử dụng sai nguồn dữ liệu làm căn cứ ra quyết định.

- **Ca B, ID: S04.** Người bán có thể đúng nhưng AI vẫn hoàn tiền khi bằng chứng chưa đủ. Người bán chịu thiệt hại tài chính và mất hàng; người mua cũng có thể nhận được quyết định thiếu công bằng. Đây là lỗi nghiêm trọng vì hành động hoàn tiền khó đảo ngược.

- **Ca suýt được chọn, ID: S05.** Người mua nghi hàng giả và yêu cầu khóa shop. Không chọn làm ca chính vì tình huống này vượt khỏi phạm vi khiếu nại thông thường, cần quy trình xác minh chuyên trách. Tuy nhiên vẫn giữ trong bộ kiểm thử để đảm bảo AI không vượt thẩm quyền.

## §3. Khi AI sai
Hai ca dùng ở đây là hai ca đã chọn ở §2: **Ca A = S01** (mô tả bị sửa sau khi bán) và **Ca B = S04** (nồi chiên 6 lít, người bán có thể đúng).

| Nội dung | Ca A: S01 | Ca B: S04 |
|---|---|---|
| Câu AI nói nguyên văn | "Mình đã ghi nhận: bạn cho biết lúc đặt hàng sản phẩm ghi màu đen, còn trang sản phẩm hiện đang ghi màu trắng. Mình sẽ không dùng mô tả hiện tại để đánh giá khiếu nại của bạn, vì mô tả có thể đã được sửa sau khi bạn đặt. Mình chưa xác minh được mô tả tại thời điểm đặt hàng, nên chưa thể trả lời khiếu nại có được chấp nhận hay không. Mình đã chuyển hồ sơ cho nhân viên Shopee kiểm tra lịch sử chỉnh sửa mô tả. Nếu bạn có ảnh chụp màn hình trang sản phẩm hoặc đơn hàng lúc đặt, bạn gửi thêm ở đây nhé." | "Mình hiểu bạn đo lòng nồi được khoảng 5 lít trong khi mô tả ghi 6 lít. Mình chưa thể kết luận sản phẩm sai mô tả, vì con số 6 lít có thể là dung tích tổng của nồi hoặc dung tích lòng nồi, và mình chưa biết shop công bố theo cách nào. Để xử lý đúng, bạn giúp mình 2 việc: (1) cho biết bạn đã đo bằng cách nào, (2) gửi ảnh nhãn thông số trên thân nồi hoặc trên hộp. Mình cũng sẽ đề nghị shop gửi thông số của nhà sản xuất. Ở bước này mình chưa hoàn tiền và cũng chưa từ chối yêu cầu của bạn." |
| Người mua thấy gì | Thẻ trạng thái "Đang chờ nhân viên xem xét". Hai dòng đặt cạnh nhau: "Mô tả lúc đặt hàng: chưa xác minh" và "Mô tả hiện tại: màu trắng". Nút "Gửi ảnh chụp màn hình" và nút "Tôi không có ảnh". Dòng ghi rõ thời hạn nhân viên phản hồi. | Thẻ trạng thái "Đang chờ bổ sung thông tin". Danh sách 2 việc cần làm có ô đánh dấu. Nút "Gửi ảnh nhãn thông số", nút "Mô tả cách đo" và nút "Chuyển nhân viên". Dòng ghi rõ "Chưa có quyết định hoàn tiền hay từ chối". |
| Người bán thấy gì | Thông báo có khiếu nại trên đơn, nội dung người mua phản ánh, và ghi chú "Nhân viên Shopee đang kiểm tra lịch sử chỉnh sửa mô tả". Shop được mời gửi bằng chứng mô tả tại thời điểm bán. Không có câu nào kết luận shop gian lận. Không hiện số điện thoại, địa chỉ người mua. | Thông báo có khiếu nại về dung tích, kèm yêu cầu gửi thông số của nhà sản xuất và cách tính 6 lít (tổng hay lòng nồi). Ghi rõ "Chưa có quyết định, tiền đơn hàng chưa bị hoàn". Không hiện thông tin cá nhân người mua. |
| Người dùng làm gì tiếp | Gửi ảnh chụp màn hình nếu có, hoặc bấm "Tôi không có ảnh". Cả hai lựa chọn đều giữ hồ sơ đi tiếp tới nhân viên. | Trả lời cách đo và gửi ảnh nhãn thông số. Nếu không muốn hoặc không làm được thì bấm "Chuyển nhân viên". |
| Nếu người dùng không làm gì | Hồ sơ vẫn nằm ở hàng chờ nhân viên vì dữ liệu cần kiểm tra nằm ở phía hệ thống, không phụ thuộc người mua. AI không tự đóng và không tự từ chối. Nhắc một lần sau 24 giờ (đề xuất). | AI nhắc một lần sau 24 giờ (đề xuất). Sau 48 giờ (đề xuất) vẫn không có phản hồi thì chuyển trưởng nhóm kèm ghi chú "người mua chưa bổ sung". AI không tự gọi `tu_choi_khieu_nai` vì im lặng không phải là bằng chứng. |
| Ai được báo, sau bao lâu, nhận thông tin gì | Trưởng nhóm, ngay khi phát hiện hai mô tả lệch nhau, qua `chuyen_truong_nhom`. Hồ sơ gồm: mã đơn, câu người mua nguyên văn, mô tả hiện tại, điều AI chưa xác minh được (mô tả lúc đặt), bằng chứng hai bên đã có, và câu hỏi cần quyết: "Mô tả có bị sửa sau ngày đặt hàng không?". | Người bán được báo ngay qua `yeu_cau_bang_chung`. Trưởng nhóm được báo khi bằng chứng hai bên mâu thuẫn, khi quá 48 giờ, hoặc khi người mua bấm "Chuyển nhân viên". Hồ sơ gồm: mã đơn, số đo và cách đo của người mua, thông số shop công bố, ảnh nhãn, và điểm còn mâu thuẫn. |
| Chọn hỏi lại / trả lời có giới hạn / dừng và chuyển người | **Dừng và chuyển người**, kèm một câu trả lời có giới hạn nói rõ AI chưa biết gì. | **Hỏi lại**; chuyển người nếu sau khi hỏi vẫn mâu thuẫn. |
| Phương án đã loại và lý do | (1) Trả lời thẳng dựa trên mô tả hiện tại: loại vì đây chính là lỗi của S01, người mua mất quyền lợi oan. (2) Hỏi lại người mua cho đến khi đủ bằng chứng: loại vì lịch sử sửa mô tả là dữ liệu của hệ thống, người mua không thể tự chứng minh. (3) Kết luận shop đã sửa mô tả: loại vì AI chưa xác minh, shop có thể bị oan. | (1) Hoàn tiền ngay qua `soan_hoan_tien`: loại vì tiền khó lấy lại, shop có thể đúng nếu 6 lít là dung tích tổng. (2) Từ chối ngay qua `tu_choi_khieu_nai`: loại vì chưa biết cách shop công bố, người mua có thể đúng. (3) Chuyển người ngay từ đầu: loại vì thiếu cách đo và ảnh nhãn thì nhân viên cũng phải hỏi lại, người mua chờ vô ích. |
| Loại lỗi: hệ thống / người dùng / ngữ cảnh; lý do | **Lỗi hệ thống.** Người mua nói rõ ràng và đúng trọng tâm; cái sai là AI lấy nhầm nguồn dữ liệu (mô tả hiện tại thay cho mô tả lúc đặt). | **Lỗi ngữ cảnh.** Không bên nào nói sai: "6 lít" có hai cách hiểu hợp lý (dung tích tổng và dung tích lòng nồi). AI sai khi mặc định một cách hiểu mà không hỏi. |
| Cách nói và cách sửa phù hợp với loại lỗi | Nói: AI nhận giới hạn về phía mình ("mình chưa xác minh được"), không yêu cầu người mua diễn đạt lại và không coi ảnh chụp màn hình là điều kiện bắt buộc. Sửa: đổi nguồn dữ liệu sang bản mô tả lưu tại thời điểm đặt; không có bản lưu thì bắt buộc chuyển người. | Nói: nêu rõ hai cách hiểu, không quy lỗi cho người mua đo sai hay shop ghi sai. Sửa: thu thêm ngữ cảnh từ cả hai bên (cách đo, nhãn thông số, thông số nhà sản xuất) trước khi có bất kỳ hành động nào liên quan đến tiền. |

**2–3 nguyên tắc HAX/PAIR:**

| Nguyên tắc đã chọn | Câu chữ/nút/vị trí thể hiện | Ảnh và số chú thích tương ứng |
|---|---|---|
| HAX G10 — Thu hẹp phạm vi khi không chắc (Scope services when in doubt) | Ca A: câu "Mình chưa xác minh được mô tả tại thời điểm đặt hàng, nên chưa thể trả lời…" và thẻ trạng thái "Đang chờ nhân viên xem xét". Ca B: danh sách 2 việc cần bổ sung thay cho kết luận. | [Cần điền sau khi dựng prototype] |
| HAX G11 — Nói rõ vì sao hệ thống làm vậy (Make clear why the system did what it did) | Ca A: hai dòng "Mô tả lúc đặt hàng / Mô tả hiện tại" đặt cạnh nhau ngay trên thẻ trạng thái, kèm câu "vì mô tả có thể đã được sửa sau khi bạn đặt". Ca B: câu giải thích hai cách hiểu "6 lít". | [Cần điền sau khi dựng prototype] |
| PAIR — Lỗi và thất bại có lối ra (Errors + Graceful Failure) | Nút "Tôi không có ảnh" (Ca A) và nút "Chuyển nhân viên" (Ca B): người dùng luôn có đường đi tiếp, kể cả khi không làm được điều AI đề nghị. Dòng "Chưa có quyết định hoàn tiền hay từ chối" ở cả hai màn hình. | [Cần điền sau khi dựng prototype] |

- Lỗi sửa câu chữ không cứu được: AI gọi `soan_hoan_tien` hoặc `tu_choi_khieu_nai` dựa trên nguồn sai (Ca A) hoặc cách hiểu sai (Ca B). Tiền đã về một bên thì khó đảo lại; lời xin lỗi hay câu giải thích hay đến đâu cũng không trả lại tiền cho bên bị thiệt.
- Cơ chế thiết kế chặn hoặc khắc phục lỗi đó: (1) AI không tự chạy `soan_hoan_tien` và `tu_choi_khieu_nai`; hai tool này phải qua người duyệt — đây là đề xuất, mức chính thức chốt ở §4. (2) Nguồn mô tả dùng để đánh giá bị khoá vào bản lưu tại thời điểm đặt hàng; khi không có bản lưu hoặc hai bản lệch nhau thì luồng buộc đi qua `chuyen_truong_nhom`. (3) Hồ sơ chuyển cho người duyệt luôn có mục "điều AI chưa xác minh được" để người duyệt không coi tóm tắt của AI là kết luận.



## §4. Mức tự chủ

Chọn cho **từng tool**: **tự làm / cần người duyệt / cấm**. Các mô tả và khả năng đảo lại dưới đây lấy từ track; mức tự chủ do nhóm quyết định.

> Lưu ý: dù tên là `soan_hoan_tien`, đề mô tả tool này **thực hiện hoàn tiền**, không chỉ soạn bản nháp.

| Tool | Tác động và khả năng đảo lại theo đề | Mức nhóm chọn | Sai thì ai chịu gì; chờ người thì mất gì | Phương án đã loại và lý do |
|---|---|---|---|---|
| `yeu_cau_bang_chung` | Gửi mẫu xin bằng chứng cho người mua hoặc người bán; tin đã tới | **Tự làm**, có giới hạn: mỗi bên tối đa 1 lần xin và 1 lần nhắc cho một khiếu nại | Sai: một bên nhận tin xin bằng chứng thừa hoặc xin nhầm thứ, gây phiền nhưng không mất tiền, không mất quyền lợi. Chờ người: mọi khiếu nại đều chậm ngay từ bước đầu, trong khi đây là bước AI làm tốt nhất (S03, S04). | Cần người duyệt: loại vì hại khi sai nhỏ mà nhân viên phải bấm duyệt cho từng tin nhắn mẫu. Cấm: loại vì khi đó AI không thu được thông tin, mọi ca đều phải chuyển người. |
| `chuyen_truong_nhom` | Chuyển hồ sơ cho trưởng nhóm; đảo lại được | **Tự làm** | Sai: trưởng nhóm nhận một hồ sơ lẽ ra AI tự hướng dẫn được, tốn vài phút, trả lại được. Chờ người: vô lý, vì phải có người duyệt việc "gọi người". | Cần người duyệt: loại vì tạo vòng lặp và làm chậm đúng những ca nguy hiểm nhất (S01, S05). Cấm: loại vì chính sách ở §1 yêu cầu chuyển nhân viên khi bằng chứng mâu thuẫn. |
| `soan_hoan_tien` | Hoàn tiền cho người mua; khó đảo vì tiền đã về người mua | **Cần người duyệt** | Sai: người bán mất tiền và mất hàng dù có thể đúng (S04, S08), hoặc AI hoàn tiền vì bị dọa (S07). Chờ người: người mua có khiếu nại đúng phải đợi thêm tối đa 24 giờ mới nhận tiền. | Tự làm: loại vì tiền khó lấy lại và chính sách ở §1 không cho AI tự quyết hoàn tiền. Cấm: loại vì khi đó nhân viên phải soạn lại từ đầu; cho AI chuẩn bị sẵn hồ sơ và đề xuất thì người duyệt quyết nhanh hơn. |
| `tu_choi_khieu_nai` | Đóng khiếu nại, tiền về người bán; khó đảo | **Cần người duyệt** | Sai: người mua mất tiền dù có thể đúng, nặng nhất ở S01 khi AI dùng mô tả đã bị sửa để từ chối. Chờ người: người bán đúng phải đợi thêm tối đa 24 giờ mới nhận tiền đơn hàng. | Tự làm: loại vì khó đảo và người mua thường không còn sức khiếu nại lại sau khi bị đóng. Cấm: loại vì có ca từ chối là đúng (S08); AI vẫn nên chuẩn bị hồ sơ cho người quyết. |
| `phat_shop` | Trừ điểm uy tín, khoá shop; khó đảo, ảnh hưởng cả shop | **Cấm** | Sai: shop mất doanh thu và uy tín trên toàn bộ đơn hàng, không chỉ đơn đang khiếu nại (S05). Chờ người: không mất gì trong luồng này, vì phạt shop không giúp người mua biết bước tiếp theo. | Cần người duyệt: loại vì chỉ cần AI đề xuất phạt là đã tạo áp lực lên người duyệt, trong khi một khiếu nại đơn lẻ không đủ căn cứ để phạt; việc này đã nằm ngoài phạm vi ở §1. Tự làm: loại vì hại lớn, khó đảo. |

**Với mỗi tool cần duyệt:**

| Tool | Ai duyệt | Người duyệt thấy gì trước khi bấm | Thời hạn và cách xử lý khi quá hạn |
|---|---|---|---|
| `soan_hoan_tien` | Trưởng nhóm xử lý khiếu nại | Mã đơn và số tiền; mô tả **tại thời điểm đặt hàng** (ghi rõ nếu chưa xác minh); bằng chứng người mua và người bán đặt cạnh nhau; điểm hai bên còn mâu thuẫn; mục "điều AI chưa xác minh được"; cảnh báo "tiền đã hoàn thì khó lấy lại". Ba nút: Duyệt / Không duyệt / Xin thêm bằng chứng. | 24 giờ (đề xuất). Quá hạn: hệ thống nhắc trưởng nhóm và chuyển lên cấp quản lý; người mua và người bán đều thấy trạng thái "đang trễ, chưa có quyết định". **Không tự động hoàn tiền** khi hết hạn. |
| `tu_choi_khieu_nai` | Trưởng nhóm xử lý khiếu nại | Như trên, thêm: lý do từ chối AI đề xuất viết bằng một câu; người mua đã được xin bằng chứng và nhắc mấy lần; cảnh báo "khiếu nại đóng thì tiền về người bán". | 24 giờ (đề xuất). Quá hạn: nhắc và chuyển cấp như trên. **Không tự động đóng khiếu nại** khi hết hạn. |

**Tool khó xếp nhất:** `soan_hoan_tien`.

- Ý kiến thực tế của từng thành viên trước khi thống nhất: [Cần điền sau khi cả ba thảo luận; không dựng lại ý kiến chưa xảy ra].
- Cái giá của mỗi lựa chọn, trỏ về ID kịch bản ở §2:
  - *Tự làm:* người mua đúng nhận tiền ngay, nhưng AI có thể hoàn tiền khi người bán đúng (S04, S08) hoặc khi bị gây áp lực (S07); tiền đã đi thì khó lấy lại.
  - *Cần người duyệt:* chặn được S04, S07, S08, nhưng người mua có bằng chứng rõ ràng vẫn phải chờ tối đa 24 giờ, và trưởng nhóm thêm việc.
  - *Cấm:* an toàn nhất về tiền, nhưng AI không còn chuẩn bị hồ sơ hoàn tiền, nhân viên làm lại từ đầu và người mua chờ lâu hơn nữa.
- Kết luận của nhóm và lý do: [Đề xuất, cần cả nhóm xác nhận] Chọn **cần người duyệt**. Chờ thêm 24 giờ là cái giá sửa được; hoàn tiền sai thì khó sửa và làm hỏng đúng lời hứa của lát cắt là "người bán không bị xử thua khi họ đúng".
- Luật bổ sung hoặc tách bước/tool nếu có; lý do:
  1. **Tách `soan_hoan_tien` thành hai bước:** AI soạn hồ sơ đề xuất (tự làm), trưởng nhóm bấm thực hiện hoàn tiền (người làm). Lý do: tên tool gợi ý "soạn" nhưng thực tế là chuyển tiền; tách ra để AI vẫn giúp được mà không chạm vào tiền.
  2. **Khoá nguồn mô tả:** AI không được đề xuất hoàn tiền hay từ chối khi mô tả lúc đặt hàng chưa xác minh; trường hợp đó chỉ được gọi `chuyen_truong_nhom` (chặn S01).
  3. **Giới hạn `yeu_cau_bang_chung`:** mỗi bên tối đa 1 lần xin và 1 lần nhắc; hết lượt thì chuyển trưởng nhóm. Lý do: tin đã gửi không thu hồi được, tránh làm phiền lặp lại.

**Thử mức đã đặt trên ba ca:**

| Ca | Tool được gọi và mức áp dụng | Cái sai có bị chặn không | Còn làm khi lẽ ra phải hỏi không | Người dùng có phải chờ vô ích không |
|---|---|---|---|---|
| Ca A: S01 | `chuyen_truong_nhom` (tự làm); `yeu_cau_bang_chung` gửi người bán (tự làm). `tu_choi_khieu_nai` không chạy được vì cần duyệt và bị luật khoá nguồn mô tả chặn. | Có. AI không thể từ chối dựa trên mô tả hiện tại. | Không. Việc duy nhất AI tự làm là chuyển người và xin bằng chứng, đều đảo được hoặc hại nhỏ. | Có chờ nhân viên, nhưng không vô ích: lịch sử sửa mô tả chỉ nhân viên kiểm tra được. |
| Ca B: S04 | `yeu_cau_bang_chung` gửi cả hai bên (tự làm). `soan_hoan_tien` chỉ dừng ở bước soạn hồ sơ, cần trưởng nhóm duyệt. | Có. Tiền không rời đi khi chưa rõ "6 lít" tính theo cách nào. | Không. AI hỏi cách đo và ảnh nhãn trước khi đề xuất bất cứ điều gì. | Không. Người mua được hỏi ngay trong chat; chỉ chờ người khi bằng chứng mâu thuẫn. |
| Ca bình thường: S03 | AI hỏi lại mã đơn và điểm sai (không cần tool), sau đó `yeu_cau_bang_chung` (tự làm). | Có. Không có tool nào liên quan đến tiền chạy khi chưa biết đơn nào, lỗi gì. | Không. | Không. Toàn bộ bước này AI tự làm, không qua người duyệt. |

> Ghi chú: §2 chưa có ca "bình thường" đúng nghĩa (người mua đủ bằng chứng, người bán nhận sai). S03 là ca nhẹ nhất hiện có. Với ca đủ bằng chứng, người mua vẫn phải chờ duyệt tối đa 24 giờ — đây là cái giá nhóm chấp nhận, đã nêu ở mục tool khó xếp nhất.

**Một mức tự chủ đã đổi lời hứa nào với người dùng:** Vì `soan_hoan_tien` và `tu_choi_khieu_nai` ở mức cần người duyệt, lời hứa đổi từ *"AI xử lý khiếu nại của bạn ngay trong chat"* thành *"AI cho bạn biết ngay bước tiếp theo và chuẩn bị hồ sơ; quyết định hoàn tiền hay từ chối do nhân viên đưa ra trong vòng 24 giờ"*. Câu này cần hiện trên màn hình (dòng "Chưa có quyết định hoàn tiền hay từ chối" ở §3) để người mua không hiểu nhầm AI có quyền hoàn tiền.

## §5. Prototype

- File hoặc link: [Cần điền; hướng dẫn tại prototype/README.md].
- Công cụ: [Cần điền].
- Phần nào mock: [Cần điền].
- Có lời gọi AI thật không: [Cần điền; không bắt buộc].
- Ca demo chính: [Cần điền ID; T4 phải có ca người bán đúng hoặc mô tả đã bị sửa].
- Cách xử lý ca lạ/chưa chuẩn bị: [Cần điền].

**1–2 ảnh có đánh số:** [Cần thêm ảnh vào prototype/ và chèn đường dẫn tương đối tại đây].

| Ảnh và số chú thích | Thể hiện điều gì | Nguyên tắc HAX/PAIR | Mức tự chủ |
|---|---|---|---|
| [Cần điền] | [Cần điền] | [Cần điền] | [Cần điền] |

**Lập luận cách thể hiện:**

- Cách hiện bằng chứng/giới hạn độ chắc đã chọn, phương án khác và vì sao loại: [Cần điền].
- Cách hiện điều khiển mức tự chủ đã chọn, phương án khác và vì sao loại: [Cần điền].

## §6. Tốt là gì

Tiêu chí phải chấm được Pass/Fail qua hành vi cụ thể; không dùng “AI hữu ích” hoặc “giao diện dễ dùng” làm tiêu chí chung chung.

| Tiêu chí và cách kiểm tra | Điều kiện Pass | Ca A: Pass/Fail + bằng chứng | Ca B: Pass/Fail + bằng chứng |
|---|---|---|---|
| 1. [Cần điền] | [Cần điền] | [Chưa kiểm tra] | [Chưa kiểm tra] |
| 2. [Cần điền] | [Cần điền] | [Chưa kiểm tra] | [Chưa kiểm tra] |
| 3. [Cần điền] | [Cần điền] | [Chưa kiểm tra] | [Chưa kiểm tra] |

- Lỗi còn lại và giới hạn: [Cập nhật sau khi kiểm tra].

## §7. Demo

**Trạng thái:** Chưa demo. Chỉ ghi kết quả thực tế sau buổi demo.

- Phần trình bày của từng thành viên: [Cần điền].
- Ca lạ nhận được: [Cập nhật sau demo].
- Prototype đã làm gì; có đúng mức tự chủ đã đặt không: [Cập nhật sau demo].
- Nhóm có đổi ý/đổi thiết kế sau ca đó không, vì sao: [Cập nhật sau demo].
