# LAB05 — T4 Thương mại điện tử · Nhóm GiangThaoYen

- **Lớp:** L3A · **Bàn/zone:** Hàng 3.
- **Track:** T4 — Trợ lý khiếu nại “hàng không đúng mô tả”.
- **Bài viết:** [spec.md](spec.md).
- **Prototype và cách demo:** [prototype/README.md](prototype/README.md).
- **Trạng thái:** Có thiết kế, prototype hai màn hình, hai ảnh đánh số và 36 kiểm tra đạt. §7 có ca diễn tập đã kiểm tra; việc demo trước lớp chưa được xác nhận. Nội dung đề xuất cho Hải Yến tại §4 chờ thành viên xác nhận.
- **Hạn nộp theo đề:** 23:59 ngày 12/11/2026, giờ Việt Nam.

## Bài này làm gì?

Nhóm thiết kế trợ lý giúp người mua biết bước tiếp theo khi báo hàng sai mô tả. AI được xin bằng chứng và chuyển nhân viên; quyết định hoàn tiền hoặc đóng khiếu nại cần trưởng nhóm kiểm tra và xác nhận. AI không được phạt shop. Mọi đơn hàng, chính sách và giao dịch trong bản demo đều giả lập.

## Mở prototype

1. Tải repo ở nhánh **main** bằng **Code → Download ZIP**, rồi giải nén.
2. Mở `prototype/index.html` bằng Edge hoặc Chrome; giữ các tệp HTML, CSS và JavaScript trong cùng thư mục.
3. Chọn S01, S04 hoặc S09 ở đầu trang. Chuyển giữa **Người mua** và **Bàn trưởng nhóm** để bấm thử.

Không cần cài thư viện để dùng demo. Xem [hướng dẫn từng bước](prototype/README.md) nếu cần thử đính chính, quá hạn hoặc xác nhận quyết định. Tải lại trang sẽ khởi tạo lại dữ liệu mô phỏng.

## Phân công

| Thành viên | Mã học viên | Phần phụ trách và nội dung bài |
|---|---|---|
| Nguyễn Thị Hương Giang | 2A202603538 | §1–§2: phạm vi, dữ liệu và 9 kịch bản; §6: tiêu chí, báo cáo kiểm thử và giới hạn. |
| Nguyễn Thị Hải Yến | 2A202603567 | §3–§4: phản hồi khi AI chưa chắc, nguyên tắc giao diện, quyền của 5 tool và quy trình người duyệt. |
| Lê Sông Thao | 2A202603534 | §5 và prototype: luồng bấm, giao diện, ảnh chú thích, tổng hợp thay đổi qua pull request. |

Cả ba phụ trách trình bày phần của mình ở §7, đọc kết quả kiểm thử và xác nhận nội dung trước khi nộp. Bảng chi tiết ở đầu [spec.md](spec.md).

## Kiểm tra prototype

Máy chạy kiểm thử cần Python, Playwright và Microsoft Edge. Chạy từ thư mục gốc repo:

```powershell
py -m pip install playwright
py -X utf8 prototype/tests/browser_check.py
py -X utf8 prototype/tests/regression_check.py
py -X utf8 prototype/tests/completion_check.py
```

Kết quả: **23 + 10 + 3 = 36 kiểm tra đạt, không lỗi**. Ba báo cáo nằm trong `prototype/`: [bộ gốc](prototype/test-results.json), [bộ bổ sung](prototype/test-results-update.json), [bộ hoàn tất](prototype/test-results-completion.json). Các kiểm tra chứng minh hành vi mô phỏng, không chứng minh chất lượng AI hay giao dịch thật.

## Quy trình GitHub và nộp bài

- Làm trên nhánh riêng, mở pull request về `main`, kiểm tra rồi gộp; không commit trực tiếp lên `main`.
- Trước khi nộp, bảo đảm các thay đổi cuối đã được gộp và tải lại bản `main` để mở thử.
- Nộp **một link repo chung**: [K5-L3A-Day05-T4-NhomGiangThaoYen](https://github.com/lesongthao/K5-L3A-Day05-T4-NhomGiangThaoYen), tại kênh giảng viên thông báo.
- Bản nộp dùng `spec.md`, mã HTML/CSS/JavaScript trong `prototype/` và hai ảnh đánh số. Đề cho phép nộp prototype bằng tệp HTML; không bắt buộc triển khai thành website riêng.

## Checklist

- [x] Repo công khai, tên đúng lớp/track/nhóm.
- [x] Đã điền ba thành viên, mã học viên, Hàng 3 và phân công.
- [x] Có 9 kịch bản thuộc 4 lớp, chọn S01/S04 và giải thích mức hại.
- [x] Có UX khi sai, quyền của đủ 5 tool, phương án loại và căn cứ trên giao diện.
- [x] Prototype chạy S01/S04/S09, có đính chính, quá hạn, chuyển người và xác nhận tác động.
- [x] Có hai ảnh đánh số và đối chiếu HAX/PAIR.
- [x] Có 3 tiêu chí Pass/Fail, đánh giá trên hai ca khó và báo cáo 36 kiểm tra.
- [x] Có ca lạ diễn tập, kết quả thực chạy và lý do giữ thiết kế tại §7.
- [x] Dữ liệu mẫu, không cần API key hoặc dữ liệu cá nhân thật của khách hàng.
- [ ] Hải Yến xác nhận nội dung đề xuất ý kiến cá nhân ở §4.
- [ ] Ghi nhận buổi demo lớp: ca người xem thực tế đưa ra, kết quả và thay đổi nếu có.
- [ ] Gộp thay đổi cuối vào `main` và nộp link repo qua kênh giảng viên yêu cầu.

## Tài liệu đề bài

- [Track T4](https://github.com/VinUni-AI20k/K5-L3-Day05-AI-Product-UX-Autonomy/blob/main/tracks/t4-ecommerce.md)
- [Hướng dẫn từng chặng](https://github.com/VinUni-AI20k/K5-L3-Day05-AI-Product-UX-Autonomy/blob/main/02-guide.md)
- [Mẫu bài nộp](https://github.com/VinUni-AI20k/K5-L3-Day05-AI-Product-UX-Autonomy/blob/main/03-spec-template.md)
- [Rubric](https://github.com/VinUni-AI20k/K5-L3-Day05-AI-Product-UX-Autonomy/blob/main/04-rubric.md)
